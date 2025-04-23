const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("furry")
    .setDescription("Replies with Pong!"),
  async execute(interaction) {
    let response = await fetch("https://v2.yiff.rest/furry.boop");
    let json = await response.json();
    let image = json.images[0].url;
    console.log(image);
    await interaction.reply("Сегодня Владлен Саныч особенно хорошо выглядит");
    await interaction.channel.send({
      files: [image],
    });
  },
};
