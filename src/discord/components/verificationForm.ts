import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';

export default function generateVerificationModal(
  title: string,
  modalID: string,
  requireMQID = false,
  additionalFields?: readonly [TextInputBuilder, TextInputBuilder?],
) {
  const fullNameComponent = new TextInputBuilder()
    .setCustomId('fullNameInput')
    .setLabel('What is your full name?')
    .setRequired(true)
    .setPlaceholder('First Middle Last')
    .setMinLength(3)
    .setMaxLength(50)
    .setStyle(TextInputStyle.Short);

  const emailComponent = new TextInputBuilder()
    .setCustomId('emailInput')
    .setLabel("What's your student or staff email?")
    .setRequired(true)
    .setPlaceholder('first.last@students.mq.edu.au')
    .setMinLength('a.b@mq.edu.au'.length)
    .setMaxLength(200)
    .setStyle(TextInputStyle.Short);

  const idComponent = new TextInputBuilder()
    .setCustomId('idInput')
    .setLabel("What's your student or staff ID? (MQ only)")
    .setRequired(requireMQID)
    .setPlaceholder('41234567')
    .setMinLength(8)
    .setMaxLength(12)
    .setStyle(TextInputStyle.Short);

  const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
    fullNameComponent,
  );

  const secondActionRow =
    new ActionRowBuilder<TextInputBuilder>().addComponents(emailComponent);

  const thirdActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
    idComponent,
  );

  if (additionalFields) {
    const additionalActionRows = additionalFields.map((field) => {
      if (field) {
        return new ActionRowBuilder<TextInputBuilder>().addComponents(field);
      }
    });

    const definedAdditionalActionRows: ActionRowBuilder<TextInputBuilder>[] =
      [];

    additionalActionRows.forEach((row) => {
      if (row) {
        definedAdditionalActionRows.push(row);
      }
    });

    return new ModalBuilder()
      .setCustomId(modalID)
      .setTitle(title)
      .addComponents(
        firstActionRow,
        secondActionRow,
        thirdActionRow,
        ...definedAdditionalActionRows,
      );
  } else {
    return new ModalBuilder()
      .setCustomId(modalID)
      .setTitle(title)
      .addComponents(firstActionRow, secondActionRow, thirdActionRow);
  }
}
