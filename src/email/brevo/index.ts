import brevoMail from '@getbrevo/brevo';
import loadConfig from '../../config';

const config = loadConfig();
const apiInstance = new brevoMail.TransactionalEmailsApi();
apiInstance.setApiKey(brevoMail.TransactionalEmailsApiApiKeys.apiKey, config.email.brevo.apiKey);

const sendEmail = async (email: string, username: string, jwt: string) => {
    const newEmail = new brevoMail.SendSmtpEmail()
    const verificationUrl = `${config.web.uri}/confirm?token=${jwt}`;

    newEmail.to = [ { email } ];
    newEmail.subject = "MACS Discord Verification";
    newEmail.textContent = `Hi ${username},\n\nPlease click here to verify your Discord account in the MACS server: ${verificationUrl}\n\nIf you did not request this email, please ignore it.`;
    newEmail.sender = { email: "noreply@macs.codes" }

    try {
        await apiInstance.sendTransacEmail(newEmail);
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export default sendEmail;
