import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder
} from "discord.js";
import { brandColor, config } from "./config.js";
import { formatPhp } from "./money.js";
import type { Catalog, Product } from "./types.js";

export function baseEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(brandColor)
    .setFooter({ text: config.BRAND_FOOTER });
}

export function walletView(balance: number) {
  const embed = baseEmbed()
    .setTitle("💳 Your wallet")
    .setDescription(
      `**Balance: ${formatPhp(balance)}**\n\nTop up your wallet, then spend it in the Lunaris store.`
    );
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("wallet:refresh").setLabel("Check balance").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("topup:open").setLabel("Top up").setEmoji("💸").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("store:open").setLabel("Open store").setEmoji("🛒").setStyle(ButtonStyle.Primary)
  );
  return { embeds: [embed], components: [row] };
}

export function topupView() {
  const embed = baseEmbed()
    .setTitle(`💸 ${config.BRAND_NAME} • Top up`)
    .setDescription(
      [
        "Add store credit to your wallet, then use it to buy from the store.",
        "",
        "**GCash:** send an amount from your own number.",
        "**Bank → GCash:** send the exact amount using InstaPay or a supported bank.",
        "",
        "Your credit is added after the payment is securely matched or approved."
      ].join("\n")
    );
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("wallet:refresh").setLabel("Check balance").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("topup:open").setLabel("Top up").setEmoji("💸").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("topup:bank").setLabel("Bank → GCash").setEmoji("🏦").setStyle(ButtonStyle.Primary)
  );
  return { embeds: [embed], components: [row] };
}

export function storeHome(catalog: Catalog) {
  const embed = baseEmbed()
    .setTitle(`🌙 Welcome to ${config.BRAND_NAME}`)
    .setDescription(
      `Purchase Minecraft packages and Discord perks with instant wallet delivery.\n\n` +
      `**Minecraft server:** \`${config.STORE_SERVER_ADDRESS}\``
    );
  const menu = new StringSelectMenuBuilder()
    .setCustomId("store:category")
    .setPlaceholder("Pick a category...")
    .addOptions(catalog.categories.map((category) => ({
      label: category.name,
      value: category.id,
      description: category.description,
      emoji: category.emoji
    })));
  return {
    embeds: [embed],
    components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu)]
  };
}

export function categoryView(catalog: Catalog, categoryId: string) {
  const category = catalog.categories.find((item) => item.id === categoryId);
  const products = catalog.products.filter(
    (product) => product.categoryId === categoryId && product.enabled
  );
  if (!category) throw new Error("Category not found.");

  const embed = baseEmbed()
    .setTitle(`${category.emoji ?? "🛒"} ${category.name}`)
    .setDescription(products.length
      ? products.map((product) =>
        `**${product.name}** • ${formatPhp(product.priceCentavos)}\n${product.description}`
      ).join("\n\n")
      : "No products are currently available in this category.");

  const menu = new StringSelectMenuBuilder()
    .setCustomId("store:product")
    .setPlaceholder("Choose a product...")
    .setDisabled(products.length === 0)
    .addOptions(products.length ? products.map((product) => ({
      label: product.name,
      value: product.id,
      description: `${formatPhp(product.priceCentavos)} • ${product.description}`.slice(0, 100)
    })) : [{ label: "No products", value: "none" }]);

  return {
    embeds: [embed],
    components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu)]
  };
}

export function productView(product: Product, balance: number, minecraftName: string | null) {
  const needsMinecraft = product.deliveries.some((delivery) => delivery.type === "minecraft_command");
  const embed = baseEmbed()
    .setTitle(product.name)
    .setDescription(product.description)
    .addFields(
      { name: "Price", value: formatPhp(product.priceCentavos), inline: true },
      { name: "Wallet", value: formatPhp(balance), inline: true },
      {
        name: "Minecraft account",
        value: needsMinecraft ? (minecraftName ? `\`${minecraftName}\`` : "Not linked") : "Not required",
        inline: true
      }
    );
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`buy:${product.id}`)
      .setLabel(balance >= product.priceCentavos ? "Buy now" : "Insufficient balance")
      .setStyle(ButtonStyle.Success)
      .setDisabled(balance < product.priceCentavos || (needsMinecraft && !minecraftName)),
    new ButtonBuilder().setCustomId("store:open").setLabel("Back to store").setStyle(ButtonStyle.Secondary)
  );
  return { embeds: [embed], components: [row] };
}
