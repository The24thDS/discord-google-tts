const textToSpeech = require('@google-cloud/text-to-speech');
const Duplex = require('stream').Duplex;

const client = new textToSpeech.TextToSpeechClient();

const synthesizeText = async (text) => {
  const request = {
    input: { text },
    voice: {
      languageCode: 'en-UK',
      name: 'en-GB-Standard-A',
      ssmlGender: 'FEMALE',
    },
    audioConfig: { audioEncoding: 'OGG_OPUS' },
  };

  const [response] = await client.synthesizeSpeech(request);
  return response.audioContent;
};

const tts = async (connection, text) => {
  const buffer = await synthesizeText(text);
  const stream = new Duplex();
  stream.push(buffer);
  stream.push(null);
  connection.play(stream);
};

const listCommands = async (client, onlyNames = false) => {
  let commands = await client.api.applications(client.user.id).commands.get();

  if (onlyNames) {
    commands = commands.map((command) => command.name);
  }

  return commands;
};

const registerGlobalCommand = async (client, commandData) =>
  await client.api.applications(client.user.id).commands.post({
    data: commandData,
  });

const checkCommamds = async (client) => {
  const globalCommandsData = require('./global-commands-data.json');
  const registeredCommands = await listCommands(client, true);

  if (globalCommandsData.length > registeredCommands.length) {
    const nonregisteredCommands = globalCommandsData.filter(
      ({ name }) => !registeredCommands.includes(name)
    );
    console.log('Registering new commands');
    nonregisteredCommands.forEach(async (commandData) => {
      const response = await registerGlobalCommand(client, commandData);
      if (response.id) {
        console.log(`Registered global command ${commandData.name}`);
      }
    });
  } else {
    console.log('No new commands to register.');
  }
};

const replyToInteraction = (
  client,
  interactionId,
  interactionToken,
  message
) => {
  client.api.interactions(interactionId, interactionToken).callback.post({
    data: {
      type: 4,
      data: {
        content: message,
      },
    },
  });
};

const acknowledgeInteraction = (client, interactionId, interactionToken) => {
  client.api.interactions(interactionId, interactionToken).callback.post({
    data: {
      type: 5,
    },
  });
};

module.exports = {
  tts,
  listCommands,
  registerGlobalCommand,
  checkCommamds,
  replyToInteraction,
  acknowledgeInteraction,
};
