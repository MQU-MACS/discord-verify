import { Interaction, Snowflake, TextBasedChannel } from 'discord.js';
import loadConfig from '../config';
import client from '.';

const config = loadConfig();

const getChannelName = (channel: TextBasedChannel | null) => {
  let channelName = 'unknown';

  if (channel) {
    if ('name' in channel) {
      channelName = `#${channel.name}`;
    } else {
      channelName = channel.id;
    }
  }

  return channelName;
};

export const logInteraction = (interaction: Interaction) => {
  let logString = '';

  const channelName = getChannelName(interaction.channel);
  logString = `${interaction.user.tag} in channel ${channelName} triggered an interaction`;

  if (interaction.isCommand()) {
    const commandName = interaction.commandName;
    logString += ` - command: ${commandName}`;
  }

  console.log(logString);
};

export const isVerified = async (member: Snowflake): Promise<boolean> => {
  const guild = client.guilds.cache.get(config.discord.guildId);
  if (!guild) {
    throw new Error('Could not find guild');
  }

  const maybeMember = await guild.members.fetch({ user: member });
  if (!maybeMember) {
    throw new Error('Could not find member');
  }

  return new Promise((resolve) => {
    resolve(maybeMember.roles.cache.has(config.discord.verifiedRoleId));
  });
};

export const verifyUserInDiscord = async (userId: string, external: boolean) => {
  const guild = client.guilds.cache.get(config.discord.guildId);
  if (!guild) {
    throw new Error('Could not find guild');
  }

  let member;
  try {
    member = await guild.members.fetch({ user: userId });
    if (!member) {
      throw new Error('User not found');
    }
  } catch (error) {
    throw new Error('User not found');
  }

  const isVerified = member.roles.cache.has(config.discord.verifiedRoleId);
  if (isVerified) {
    throw new Error('User already verified');
  }

  // Add the external role to the user if they are external
  let externalRole;
  try {
    externalRole = await guild.roles.fetch(config.discord.externalRoleId);
    if (!externalRole) {
      throw new Error(`External role not found`);
    }
  } catch (error) {
    throw new Error(`External role not found`);
  }

  if (external) await member.roles.add(externalRole);

  // Add the verified role to the user
  let verifiedRole;
  try {
    verifiedRole = await guild.roles.fetch(config.discord.verifiedRoleId);
    if (!verifiedRole) {
      throw new Error(`Verified role not found`);
    }
  } catch (error) {
    throw new Error(`Verified role not found`);
  }

  await member.roles.add(verifiedRole);

  return;
};
