import { randomBytes, randomUUID } from "node:crypto";
import {
  ActionRowBuilder,
  ButtonInteraction,
  ChatInputCommandInteraction,
  Client,
  Events,
  GatewayIntentBits,
  GuildMember,
  ModalSubmitInteraction,
  ModalBuilder,
  REST,
  Routes,
  StringSelectMenuInteraction,
  TextInputBuilder,
  TextInputStyle
} from "discord.js";
import { loadCatalog } from "./catalog.js";
import { commands } from "./commands.js";
import { config } from "./config.js";
import {
  approvePayment,
  beginOrder,
  completeOrder,
  createPaymentIntent,
  creditWallet,
  getBalance,
  getMinecraftName,
  recentLedger,
  refundOrder,
  setMinecraftName
} from "./database.js";
import { fulfill } from "./fulfillment.js";
import { formatPhp, parsePhp } from "./money.js";
import {
  baseEmbed,
  categoryView,
  productView,
  storeHome,
  topupView,
  walletView
} from "./ui.js";
import { startWebhookServer } from "./webhook.js";

const catalog = loadCatalog();
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

client.once(Events.ClientReady, async (readyClient) => {
  const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);
  await rest.put(
    Routes.applicationGuildCommands(config.DISCORD_CLIENT_ID, config.DISCORD_GUILD_ID),
    { body: commands }
  );
  startWebhookServer(client);
  console.log(`${config.BRAND_NAME} logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      await handleCommand(interaction);
    } else if (interaction.isButton()) {
      await handleButton(interaction);
    } else if (interaction.isStringSelectMenu()) {
      await handleSelect(interaction);
    } else if (interaction.isModalSubmit()) {
      await handleModal(interaction);
    }
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    if (interaction.isRepliable()) {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: `❌ ${message}`, ephemeral: true }).catch(() => undefined);
      } else {
        await interaction.reply({ content: `❌ ${message}`, ephemeral: true }).catch(() => undefined);
      }
    }
  }
});

async function handleCommand(interaction: ChatInputCommandInteraction) {
  switch (interaction.commandName) {
    case "wallet": {
      const balance = getBalance(interaction.user.id);
      const entries = recentLedger(interaction.user.id);
      const view = walletView(balance);
      if (entries.length) {
        view.embeds[0].addFields({
          name: "Recent activity",
          value: entries.map((entry) =>
            `${entry.delta_centavos >= 0 ? "+" : ""}${formatPhp(entry.delta_centavos)} • ${entry.note ?? entry.kind}`
          ).join("\n")
        });
      }
      await interaction.reply({ ...view, ephemeral: true });
      break;
    }
    case "topup":
      await interaction.reply({ ...topupView(), ephemeral: true });
      break;
    case "store":
      await interaction.reply({ ...storeHome(catalog), ephemeral: true });
      break;
    case "link": {
      const username = interaction.options.getString("username", true);
      if (!/^[A-Za-z0-9_]{3,16}$/.test(username)) {
        throw new Error("Minecraft usernames must be 3–16 letters, numbers, or underscores.");
      }
      setMinecraftName(interaction.user.id, username);
      await interaction.reply({
        content: `✅ Linked your Minecraft account to \`${username}\`.`,
        ephemeral: true
      });
      break;
    }
    case "panel": {
      await requireAdmin(interaction);
      if (!interaction.channel?.isSendable()) throw new Error("I cannot post in this channel.");
      const type = interaction.options.getString("type", true);
      await interaction.channel.send(type === "store" ? storeHome(catalog) : topupView());
      await interaction.reply({
        content: `The ${type === "store" ? "store" : "top-up"} panel was posted.`,
        ephemeral: true
      });
      await audit(`Panel posted: ${type} by <@${interaction.user.id}>.`);
      break;
    }
    case "payment": {
      await requireAdmin(interaction);
      const reference = interaction.options.getString("reference", true).toUpperCase();
      const providerReference = interaction.options.getString("provider_reference", true);
      const result = approvePayment(reference, providerReference, interaction.user.id);
      await interaction.reply({
        content: `✅ Credited <@${result.payment.user_id}> ${formatPhp(result.payment.amount_centavos)}. ` +
          `New balance: ${formatPhp(result.balance)}.`,
        ephemeral: true
      });
      await notifyUser(
        result.payment.user_id,
        `Your top-up of ${formatPhp(result.payment.amount_centavos)} was approved. ` +
        `New balance: ${formatPhp(result.balance)}.`
      );
      await audit(`Payment approved: \`${reference}\` by <@${interaction.user.id}>.`);
      break;
    }
    case "credit": {
      await requireAdmin(interaction);
      const customer = interaction.options.getUser("customer", true);
      const amount = Math.round(interaction.options.getNumber("amount", true) * 100);
      const reason = interaction.options.getString("reason", true);
      const reference = `manual:${interaction.id}`;
      const balance = creditWallet(customer.id, amount, reference, reason, interaction.user.id);
      await interaction.reply({
        content: `✅ Credited ${customer} ${formatPhp(amount)}. New balance: ${formatPhp(balance)}.`,
        ephemeral: true
      });
      await notifyUser(customer.id, `Your wallet was credited ${formatPhp(amount)}. Reason: ${reason}`);
      await audit(`Manual credit: ${customer} received ${formatPhp(amount)} by <@${interaction.user.id}>. ${reason}`);
      break;
    }
  }
}

async function handleButton(interaction: ButtonInteraction) {
  if (interaction.customId === "wallet:refresh") {
    await interaction.update(walletView(getBalance(interaction.user.id)));
    return;
  }
  if (interaction.customId === "store:open") {
    await interaction.update(storeHome(catalog));
    return;
  }
  if (interaction.customId === "topup:open" || interaction.customId === "topup:bank") {
    const modal = new ModalBuilder()
      .setCustomId(`topup:submit:${interaction.customId.endsWith("bank") ? "bank" : "gcash"}`)
      .setTitle("Top up your account");
    const amount = new TextInputBuilder()
      .setCustomId("amount")
      .setLabel("Amount in PHP")
      .setPlaceholder("e.g. 500")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
    const phone = new TextInputBuilder()
      .setCustomId("phone")
      .setLabel("GCash phone number")
      .setPlaceholder("e.g. 09171234567")
      .setStyle(TextInputStyle.Short)
      .setRequired(interaction.customId === "topup:open");
    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(amount),
      new ActionRowBuilder<TextInputBuilder>().addComponents(phone)
    );
    await interaction.showModal(modal);
    return;
  }
  if (interaction.customId.startsWith("buy:")) {
    await purchase(interaction, interaction.customId.slice(4));
  }
}

async function handleSelect(interaction: StringSelectMenuInteraction) {
  if (interaction.customId === "store:category") {
    await interaction.update(categoryView(catalog, interaction.values[0]));
    return;
  }
  if (interaction.customId === "store:product") {
    const product = catalog.products.find((item) => item.id === interaction.values[0]);
    if (!product || !product.enabled) throw new Error("Product is unavailable.");
    await interaction.update(productView(
      product,
      getBalance(interaction.user.id),
      getMinecraftName(interaction.user.id)
    ));
  }
}

async function handleModal(interaction: ModalSubmitInteraction) {
  if (!interaction.customId.startsWith("topup:submit:")) return;
  const amount = parsePhp(interaction.fields.getTextInputValue("amount"));
  const rawPhone = interaction.fields.getTextInputValue("phone").replace(/\s+/g, "");
  if (rawPhone && !/^(09|\+639)\d{9}$/.test(rawPhone)) {
    throw new Error("Enter a valid Philippine mobile number.");
  }
  const reference = `LB-${randomBytes(4).toString("hex").toUpperCase()}`;
  createPaymentIntent(reference, interaction.user.id, amount, rawPhone || undefined);
  const embed = baseEmbed()
    .setTitle("✅ Top-up ready")
    .setDescription(
      [
        `Send **${formatPhp(amount)}** to **${config.GCASH_RECEIVER_NUMBER}**.`,
        "",
        config.PAYMENT_INSTRUCTIONS,
        "",
        `Payment reference: \`${reference}\``,
        rawPhone ? `Expected sender: \`${rawPhone}\`` : "Bank transfer selected.",
        "",
        "Credit is added only after the payment is matched or approved."
      ].join("\n")
    );
  await interaction.reply({ embeds: [embed], ephemeral: true });
  await audit(`Top-up created: \`${reference}\`, ${formatPhp(amount)}, user <@${interaction.user.id}>.`);
}

async function purchase(interaction: ButtonInteraction, productId: string) {
  const product = catalog.products.find((item) => item.id === productId && item.enabled);
  if (!product) throw new Error("Product is unavailable.");
  const minecraftName = getMinecraftName(interaction.user.id);
  if (product.deliveries.some((item) => item.type === "minecraft_command") && !minecraftName) {
    throw new Error("Link your Minecraft username with /link before buying this product.");
  }

  await interaction.deferReply({ ephemeral: true });
  const orderId = `LBO-${randomUUID()}`;
  beginOrder({
    id: orderId,
    userId: interaction.user.id,
    productId: product.id,
    productName: product.name,
    amount: product.priceCentavos,
    minecraftName
  });

  try {
    if (!interaction.guild) throw new Error("Purchases must be made inside the store server.");
    const member = interaction.member instanceof GuildMember
      ? interaction.member
      : await interaction.guild.members.fetch(interaction.user.id);
    await fulfill(product.deliveries, member, minecraftName);
    completeOrder(orderId);
    await interaction.editReply({
      embeds: [baseEmbed()
        .setTitle("✅ Purchase delivered")
        .setDescription(
          `**${product.name}** was delivered successfully.\n\n` +
          `Order: \`${orderId}\`\nRemaining balance: ${formatPhp(getBalance(interaction.user.id))}`
        )]
    });
    await audit(`Order completed: \`${orderId}\`, ${product.name}, user <@${interaction.user.id}>.`);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown fulfillment error";
    refundOrder(orderId, interaction.user.id, product.priceCentavos, reason);
    await interaction.editReply({
      content: `❌ Delivery failed, so your ${formatPhp(product.priceCentavos)} was automatically refunded. ` +
        `Order: \`${orderId}\`. An administrator has been notified.`
    });
    await audit(`⚠️ Order refunded: \`${orderId}\`. Reason: ${reason}`);
  }
}

async function requireAdmin(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guild) throw new Error("This command must be used inside the server.");
  const member = await interaction.guild.members.fetch(interaction.user.id);
  if (!member.roles.cache.has(config.ADMIN_ROLE_ID)) {
    throw new Error("You do not have permission to perform this action.");
  }
}

async function notifyUser(userId: string, message: string): Promise<void> {
  const user = await client.users.fetch(userId);
  await user.send(`${config.BRAND_FOOTER}\n\n${message}`).catch(() => undefined);
}

async function audit(message: string): Promise<void> {
  if (!config.AUDIT_CHANNEL_ID) return;
  const channel = await client.channels.fetch(config.AUDIT_CHANNEL_ID).catch(() => null);
  if (channel?.isSendable()) await channel.send(message).catch(() => undefined);
}

client.login(config.DISCORD_TOKEN);
