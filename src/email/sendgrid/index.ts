import sgMail from '@sendgrid/mail';
import loadConfig from '../../config';

const config = loadConfig();
sgMail.setApiKey(config.email.sendgrid.apiKey);

const sendEmail = async (email: string, username: string, jwt: string) => {
  const verificationUrl = `${config.web.uri}/confirm?token=${jwt}`;

  const msg = {
    to: email, // Change to your recipient
    from: 'noreply@macs.codes', // Change to your verified sender
    subject: 'MACS Discord Verification',
    text: `Hi ${username},\n\nPlease click here to verify your Discord account in the MACS server: ${verificationUrl}\n\nIf you did not request this email, please ignore it.`
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default sendEmail;
