import express from 'express';
import morgan from 'morgan';
import * as jose from 'jose';
import { addVerifiedUserToDb } from '../db';
import { verifyUserInDiscord } from '../discord/util';
import loadConfig from '../config';
import client from '../index';

const config = loadConfig();

const app = express();
const port = 3000;

app.use(morgan('combined'));

app.get('/confirm', async (req, res) => {
  const jwt = req.query.token;

  if (typeof jwt !== 'string') {
    return res.sendStatus(403);
  }

  res.sendFile(`${__dirname}/pages/confirm.html`);
});

app.get('/verify', async (req, res) => {
  const jwt = req.query.token;

  if (typeof jwt !== 'string') {
    return res.sendStatus(403);
  }

  let verifiedJwt;
  try {
    verifiedJwt = (await jose.jwtVerify(
      jwt,
      Buffer.from(config.web.jwtSecret),
    )) as jose.JWTVerifyResult & {
      payload: { email?: string; mqID?: string; fullName?: string };
    };
  } catch (error) {
    if (error instanceof jose.errors.JOSEError) {
      return res.sendStatus(403);
    } else {
      throw error;
    }
  }

  const discordId = verifiedJwt.payload.sub;
  const email = verifiedJwt.payload.email?.toLowerCase();
  const mqID = verifiedJwt.payload.mqID;
  const fullName = verifiedJwt.payload.fullName;

  if (!discordId) {
    return res.status(403).json({ error: 'JWT subject not set' });
  }
  if (!email) {
    return res.status(403).json({ error: 'email not set' });
  }
  if (!fullName) {
    return res.status(403).json({ error: 'fullName not set' });
  }

  const mqEmailRegex =
    /^[a-z-]+\.[a-z]+[0-9]*@(students\.mq\.edu\.au|mq\.edu\.au)$/;
  const staffRegex = /^[a-z]+\.[a-z0-9]+@mq\.edu\.au$/;
  const external = !mqEmailRegex.test(email); // if user doesn't have an mq email, set external to true

  if (!mqID && !external) {
    return res.status(403).json({ error: 'mqID not set' });
  }

  try {
    await addVerifiedUserToDb(
      discordId,
      email,
      external ? "" : mqID, // don't set id if external
      fullName,
      staffRegex.test(email),
      external
    );
  } catch (e) {
    const errChannel = client.channels.cache.get("1343557810050568257");
    if (errChannel?.isTextBased()) {
      await errChannel.send(`User \`${discordId}\`(\`${email}\`) failed verification:\n${e}`);
    }

    if (typeof e === 'string') {
      res.status(403).json({ error: e });
    } else if (e instanceof Error) {
      res.status(403).json({ error: e.message });
    }

    return;
  }

  try {
    await verifyUserInDiscord(discordId, external);
  } catch (error) {
    console.log("Couldn't verify user in discord", error);
    const errChannel = client.channels.cache.get("1343557810050568257");
    if (errChannel?.isTextBased()) {
      await errChannel.send(`User \`${discordId}\`(\`${email}\`) failed verification:\n${error}`);
    }

    if (error instanceof Error) {
      res.json({ error: error.message });
    } else {
      res.send("Couldn't verify user in discord");
    }

    return;
  }

  res.sendFile(`${__dirname}/pages/verify.html`);
});

const startWebServer = () => {
  app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
};

export default startWebServer;
