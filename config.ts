import {
  PermissionFlagsBits,
  SlashCommandBuilder
} from "discord.js";

export const commands = [
  new SlashCommandBuilder()
    .setName("wallet")
    .setDescription("View your Lunaris wallet and recent activity"),
  new SlashCommandBuilder()
    .setName("topup")
    .setDescription("Add credit to your Lunaris wallet"),
  new SlashCommandBuilder()
    .setName("store")
    .setDescription("Browse the Lunaris store"),
  new SlashCommandBuilder()
    .setName("link")
    .setDescription("Link your Minecraft username")
    .addStringOption((option) =>
      option.setName("username").setDescription("Your exact Minecraft username").setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("panel")
    .setDescription("Post a permanent Lunaris Bridge customer panel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((option) =>
      option.setName("type").setDescription("Panel to post").setRequired(true)
        .addChoices(
          { name: "Store", value: "store" },
          { name: "Top up", value: "topup" }
        )
    ),
  new SlashCommandBuilder()
    .setName("payment")
    .setDescription("Manage a wallet payment")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) =>
      subcommand.setName("approve")
        .setDescription("Approve a pending top-up")
        .addStringOption((option) =>
          option.setName("reference").setDescription("The LB payment reference").setRequired(true)
        )
        .addStringOption((option) =>
          option.setName("provider_reference").setDescription("Receipt or provider reference").setRequired(true)
        )
    ),
  new SlashCommandBuilder()
    .setName("credit")
    .setDescription("Credit a wallet manually")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption((option) =>
      option.setName("customer").setDescription("Customer to credit").setRequired(true)
    )
    .addNumberOption((option) =>
      option.setName("amount").setDescription("Amount in PHP").setMinValue(1).setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Audit reason").setMaxLength(200).setRequired(true)
    )
].map((command) => command.toJSON());
