import { ModalSubmitInteraction } from 'discord.js';
import * as jose from 'jose';
import { addAttempt, attemptsForUser } from '../../db';
import sendEmail from '../../email';

export default async function handleNormalVerificationModal(
  interaction: ModalSubmitInteraction,
  jwtSecret: string
) {
  // Get the data entered by the user
  const fullName = interaction.fields.getTextInputValue('fullNameInput');
  const email = interaction.fields.getTextInputValue('emailInput');
  const mqID = interaction.fields.getTextInputValue('idInput');

  const fullNameRegex = /^\w+ \w+(?: \w+)*$/;
  const mqEmailRegex =
    /^[a-z-]+\.[a-z]+[0-9]*@(students\.mq\.edu\.au|mq\.edu\.au)$/;
  const eduEmailRegex = /^[a-z]+\.[a-z0-9]+@.*?\.edu\.au$/;
  const idRegex = /^(mq|MQ)?[0-9]{8,12}$/;

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

  if (!eduEmailRegex.test(email)) {
    try {
      await interaction.reply({
        content: 'Please enter your university email address.',
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
    }

    return;
  }

  if (mqEmailRegex.test(email) && !idRegex.test(mqID)) {
    try {
      await interaction.reply({
        content: 'Please enter a valid student or staff ID.',
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
    }

    return;
  }

  let jwt;
  try {
    jwt = await new jose.SignJWT({ email, mqID, fullName })
      .setSubject(interaction.user.id)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('12h')
      .sign(Buffer.from(jwtSecret));
  } catch (error) {
    console.error(error);
    return;
  }

  // Check how many attempts there have been from this user in the last hour
  const numAttempts = await attemptsForUser(interaction.user.id, 1);

  if (numAttempts >= 3) {
    try {
      await interaction.reply({
        content:
          'You have attempted to verify too many times in the last hour. Please try again later.',
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
    }

    return;
  }

  // Add attempt for user
  try {
    await addAttempt(email, mqID, fullName, interaction.user.id);
  } catch (error) {
    console.log(error);
    try {
      await interaction.reply({
        content:
          'There was an error sending the email. Please contact an admin if you see this.',
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
    }
    return;
  }

  // Send user email
  try {
    console.log(
      `Sending email to ${email} for user ${interaction.member?.user.username} - ${interaction.member?.user.id}`,
    );

    await sendEmail(email, interaction.user.username, jwt);
  } catch (error) {
    console.error(error);

    try {
      await interaction.reply({
        content:
          'There was an error sending the email. Please contact an admin if you see this.',
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
      content:
        'Please follow the link in the email sent to you to verify. Please note the email may take up to 30 minutes to arrive for staff.',
      ephemeral: true,
    });
  } catch (error) {
    console.error(error);
  }
}
