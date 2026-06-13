const AUTO_ROLE = "1514629293576290415";

export async function addAutoRole(member) {
  const role = member.guild.roles.cache.get(AUTO_ROLE);

  if (!role) return;

  try {
    await member.roles.add(role);
  } catch (error) {
    console.error("Autorole Error:", error);
  }
}
