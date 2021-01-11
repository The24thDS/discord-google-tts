const { tts } = require('./utils');

const join = async (voiceChannel, client) => {
  if (voiceChannel) {
    if (
      client.voice.connections.find((vc) => vc.channel.id === voiceChannel.id)
    ) {
      return 'Already in your voice channel.';
    } else {
      await voiceChannel.join();
      return `Joined voice channel ${voiceChannel}`;
    }
  } else {
    return 'You must be in a voice channel.';
  }
};

const leave = async (voiceChannel, client) => {
  if (voiceChannel) {
    let connection;
    if (
      !(connection = client.voice.connections.find(
        (vc) => vc.channel.id === voiceChannel.id
      ))
    ) {
      return 'You must be in a voice channel.';
    } else {
      await connection.channel.leave();
      return `Left voice channel ${voiceChannel}.`;
    }
  } else {
    return 'You must be in a voice channel.';
  }
};

const say = async (voiceChannel, client, content) => {
  let connection;
  if (voiceChannel) {
    let reply = '';
    if (
      !(connection = client.voice.connections.find(
        (vc) => vc.channel.id === voiceChannel.id
      ))
    ) {
      connection = await voiceChannel.join();
      reply = `Joined voice channel ${voiceChannel}`;
    }
    tts(connection, content);
    return reply;
  } else {
    return 'You must be in a voice channel.';
  }
};

module.exports = {
  join,
  leave,
  say,
};
