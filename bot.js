require('dotenv').config();
const Discord = require('discord.js');
const { join, leave, say } = require('./commands');
const {
  checkCommamds,
  replyToInteraction,
  acknowledgeInteraction,
} = require('./utils');

const client = new Discord.Client();

client.on('ready', async () => {
  checkCommamds(client);
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async (msg) => {
  const command =
    msg.content.substr(0, msg.content.indexOf(' ')) || msg.content;
  const content = msg.content.substr(msg.content.indexOf(' ') + 1);
  const voiceChannel = msg.member.voice.channel;
  let reply = '';
  switch (command) {
    case ';join':
      reply = await join(voiceChannel, client);
      msg.channel.send(reply);
      break;
    case ';say':
      reply = await say(voiceChannel, client, content);
      if (reply.length) {
        msg.channel.send(reply);
      }
      break;
    case ';leave':
      reply = await leave(voiceChannel, client);
      msg.channel.send(reply);
    default:
      break;
  }
});

client.ws.on('INTERACTION_CREATE', async (interaction) => {
  let reply = '';
  const guild = await client.guilds.fetch(interaction.guild_id);
  const voiceChannel = guild.members.resolve(interaction.member.user.id).voice
    .channel;
  switch (interaction.data.name) {
    case 'join':
      reply = await join(voiceChannel, client);
      replyToInteraction(client, interaction.id, interaction.token, reply);
      break;
    case 'leave':
      reply = await leave(voiceChannel, client);
      replyToInteraction(client, interaction.id, interaction.token, reply);
      break;
    case 'say':
      const content = interaction.data.options[0].value;
      reply = await say(voiceChannel, client, content);
      if (reply.length) {
        replyToInteraction(client, interaction.id, interaction.token, reply);
      } else {
        acknowledgeInteraction(client, interaction.id, interaction.token);
      }
      break;

    default:
      break;
  }
});

client.login(process.env.TOKEN);
