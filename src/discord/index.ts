import {
  Client,
  Collection,
  ChatInputCommandInteraction,
  PermissionsBitField,
  IntentsBitField,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from 'discord.js';
import { isVerified, logInteraction } from './util';
import pingCommand from './commands/ping';
import setupButton from './commands/setupButton';
import infoCommand from './commands/info';
import searchCommand from './commands/search';
import deleteCommand from './commands/delete';
import generateVerificationModal from './components/verificationForm';
import verifyUser, {
  MANUAL_VERIFICATION_MODAL_ID,
} from './commands/verify-user';
import verifyUserContextMenu from './context-menus/verify-user';
import infoUserContextCommand from './context-menus/info';
import sendHelpUserContextMenu from './context-menus/send-help';
import handleNormalVerificationModal from './interactions/normalVerificationModal';
import handleManualVerificationModal from './interactions/manualVerificationModal';
import loadConfig from '../config';

const NORMAL_VERIFICATION_MODAL_ID = 'normalVerificationModal';

const config = loadConfig();

// Create a new client instance
const client = new Client({
  intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages],
});

type TPermissionSlashCommand = {
  data:
    | SlashCommandBuilder
    | SlashCommandOptionsOnlyBuilder
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  public?: boolean;
};

// Add commands
const commands = new Collection<string, TPermissionSlashCommand>();
commands.set(pingCommand.data.name, pingCommand);
commands.set(setupButton.data.name, setupButton);
commands.set(infoCommand.data.name, infoCommand);
commands.set(searchCommand.data.name, searchCommand);
commands.set(deleteCommand.data.name, deleteCommand);
commands.set(verifyUser.data.name, verifyUser);

// When the client is ready, run this code (only once)
client.once('ready', () => {
  console.log('Ready!');
});

// Handle command interactions
client.on('interactionCreate', async (interaction) => {
  logInteraction(interaction);

  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);

  if (!command) return;

  if (!command.public) {
    if (
      !interaction.memberPermissions?.has(
        PermissionsBitField.Flags.Administrator,
      )
    ) {
      interaction.reply('You are not authorized to use this command.');
      return;
    }
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);

    try {
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
    }
  }
});

// Handle button click interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  // Check if the user is already verified
  const alreadyVerified = await isVerified(interaction.user.id);

  if (alreadyVerified) {
    // If the user is already verified, just show a message
    try {
      await interaction.reply({
        content: 'You are already verified!',
        ephemeral: true,
      });
      return;
    } catch (error) {
      console.error(error);
    }
  }

  const modal = generateVerificationModal(
    'Verification Form',
    NORMAL_VERIFICATION_MODAL_ID,
  );

  try {
    await interaction.showModal(modal);
  } catch (error) {
    console.error(error);
  }
});

// Handle modal submit interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isModalSubmit()) return;

  if (interaction.customId === MANUAL_VERIFICATION_MODAL_ID) {
    handleManualVerificationModal(interaction);
    return;
  }

  if (interaction.customId === NORMAL_VERIFICATION_MODAL_ID) {
    handleNormalVerificationModal(interaction, config.web.jwtSecret);
    return;
  }
});

// Handle context menu user commands
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isUserContextMenuCommand()) return;

  if (interaction.commandName === verifyUserContextMenu.data.name) {
    await verifyUserContextMenu.execute(interaction);
    return;
  }

  if (interaction.commandName === infoUserContextCommand.data.name) {
    await infoUserContextCommand.execute(interaction);
    return;
  }

  if (interaction.commandName === sendHelpUserContextMenu.data.name) {
    await sendHelpUserContextMenu.execute(interaction);
    return;
  }
});

export default client;
