const { SlashCommandBuilder } = require("discord.js");
const { askDeepSeek } = require("../../deepseek.js");
const { API_TOKEN, VOICE_KEY } = require("../../config.json");
const {
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  NoSubscriberBehavior,
} = require("@discordjs/voice");
const fs = require("fs");
const fetch = require("node-fetch");
const ffmpeg = require("fluent-ffmpeg");

const { PermissionsBitField } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("furry")
    .setDescription("Replies with furry content"),
  async execute(interaction) {
    try {
      await interaction.deferReply();

      const voiceChannel = interaction.member.voice.channel;
      if (!voiceChannel) {
        await interaction.editReply("Ты должен быть в голосовом канале.");
        return;
      }

      const permissions = voiceChannel.permissionsFor(interaction.client.user);
      if (!permissions.has(PermissionsBitField.Flags.Connect)) {
        await interaction.editReply(
          "У меня нет прав на подключение к голосовому каналу."
        );
        return;
      }
      if (!permissions.has(PermissionsBitField.Flags.Speak)) {
        await interaction.editReply(
          "У меня нет прав на воспроизведение звука в голосовом канале."
        );
        return;
      }

      const response = await fetch("https://v2.yiff.rest/furry.boop");
      if (!response.ok) throw new Error("API request failed");
      const json = await response.json();
      const image = json.images[0].url;
      const message = await askDeepSeek(API_TOKEN);

      await interaction.editReply({
        content: message,
        files: [image],
      });
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: interaction.guildId,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });
      const ttsreq = await fetch(
        "https://api.sws.speechify.com/v1/audio/speech",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${VOICE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: `<speak><prosody pitch='-35%'>${message}</prosody></speak>`,
            voice_id: "gleb",
            model: "simba-multilingual",
            language: "ru-RU",
            emotion: "angry",
            audio_format: "mp3",
          }),
        }
      );
      const data = await ttsreq.json();
      const audioBuffer = Buffer.from(data.audio_data, "base64");
      const tempFile = `./temp_${Date.now()}.mp3`;
      fs.writeFileSync(tempFile, audioBuffer);
      const convertedFile = `./converted_${Date.now()}.mp3`;

      ffmpeg(tempFile)
        .outputOptions(["-c:a libmp3lame", "-b:a 192k"])
        .toFormat("mp3")
        .on("end", () => {
          const player = createAudioPlayer({
            behaviors: {
              noSubscriber: NoSubscriberBehavior.Play,
            },
          });
          console.log(tempFile);
          const resource = createAudioResource(convertedFile);
          connection.subscribe(player);
          player.play(resource);
          player.on("error", (error) => {
            console.error("Ошибка плеера:", error.message);
          });

          player.on("stateChange", (oldState, newState) => {
            console.log(
              `Состояние плеера: ${oldState.status} → ${newState.status}`
            );
            if (newState.status === "autopaused") {
              console.log("Попытка разпаузить.");
              player.unpause();
            }
          });
          player.on("idle", () => {
            console.log("Плеер завершил воспроизведение, очищаю файлы.");
            fs.unlinkSync(tempFile);
            fs.unlinkSync(convertedFile);
            connection.destroy();
          });
        })
        .on("error", (err) => {
          console.error("Ошибка при конвертации:", err.message);
          interaction.followUp("Ошибка при обработке аудиофайла.");
        })
        .save(convertedFile);
    } catch (error) {
      console.error("Ошибка при выполнении:", error);
      await interaction.editReply("Произошла ошибка при выполнении команды");
    }
  },
};
