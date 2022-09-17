import { ModalSubmitInteraction } from 'discord.js';
import { addVerifiedUserToDb } from '../../db';
import { verifyUserInDiscord } from '../util';
import Joi from 'joi';

export default async function handleManualVerificationModal(
  interaction: ModalSubmitInteraction,
) {
  // Get the data entered by the user
  const discordId = interaction.fields.getTextInputValue('discordId');
  const fullName = interaction.fields.getTextInputValue('fullNameInput');
  const email = interaction.fields.getTextInputValue('emailInput');
  const mqID = interaction.fields.getTextInputValue('idInput');

  const fullNameRegex = /^[a-zA-Z ]{3,}$/;

  if (!fullNameRegex.test(fullName)) {
    try {
      await interaction.reply({
        content: 'Please enter an alphanumeric full name.',
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
    }

    return;
  }

  const { error: emailValidationError } = Joi.string()
    .email()
    .required()
    .validate(email);

  if (emailValidationError) {
    try {
      await interaction.reply({
        content: `Please enter a valid email address: ${emailValidationError.message}`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
    }

    return;
  }

  const staffRegex = /^[a-z]+\.[a-z0-9]+@mq\.edu\.au$/;

  try {
    await addVerifiedUserToDb(
      discordId,
      email,
      mqID,
      fullName,
      staffRegex.test(email),
    );
  } catch (e) {
    console.error(e);
    return;
  }

  try {
    await verifyUserInDiscord(discordId);
  } catch (error) {
    console.error("Couldn't verify user in discord", error);
    try {
      await interaction.reply({
        content: "Couldn't verify user in discord",
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
    }
    return;
  }

  // Reply to user
  try {
    await interaction.reply({
      content: 'User verified.',
      ephemeral: true,
    });
  } catch (error) {
    console.error(error);
  }
}
