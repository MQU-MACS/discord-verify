// import AWS from 'aws-sdk';
// import loadConfig from '../../config';

// const config = loadConfig();

// // Set the region
// AWS.config.update({
//   region: config.email.ses.region,
//   credentials: {
//     accessKeyId: config.email.ses.accessKeyId,
//     secretAccessKey: config.email.ses.secretAccessKey,
//   },
// });

// // Create the promise and SES service object
// const sendEmail = (email: string, username: string, jwt: string) => {
//   const verificationUrl = `${config.web.uri}/confirm?token=${jwt}`;

//   const params = {
//     Destination: { ToAddresses: [email] },
//     Message: {
//       Body: {
//         Html: {
//           Charset: 'UTF-8',
//           Data: `
//           Hi ${username},<br><br>
//           <a href="${verificationUrl}">Please click here to verify your Discord account in the MACS server</a><br><br>
//           If you did not request this email, please ignore it.`,
//         },
//         Text: {
//           Charset: 'UTF-8',
//           Data: `Hi ${username},\n\nPlease click here to verify your Discord account in the MACS server: ${verificationUrl}\n\nIf you did not request this email, please ignore it.`,
//         },
//       },
//       Subject: {
//         Charset: 'UTF-8',
//         Data: 'MACS Discord Verification',
//       },
//     },
//     Source: 'noreply@macs.codes' /* required */,
//   };

//   return new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
// };

// export default sendEmail;
