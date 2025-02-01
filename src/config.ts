import dotenv from 'dotenv';

interface IConfig {
  discord: {
    token: string;
    clientId: string;
    guildId: string;
    verifiedRoleId: string;
    externalRoleId: string;
  };
  web: {
    jwtSecret: string;
    uri: string;
  };
  email: {
    // ses: {
    //   region: string;
    //   accessKeyId: string;
    //   secretAccessKey: string;
    // };
    sendgrid: {
      apiKey: string;
    };
  };
  db: {
    host: string;
    port: string;
    name: string;
    password: string;
  };
}

const loadConfig = () => {
  if (process.env.CI !== 'true' && process.env.NODE_ENV === 'development') {
    dotenv.config();
  }

  const config: IConfig = {
    discord: {
      token: process.env.DISCORD_TOKEN || '',
      clientId: process.env.DISCORD_CLIENT_ID || '',
      guildId: process.env.DISCORD_GUILD_ID || '',
      verifiedRoleId: process.env.DISCORD_VERIFIED_ROLE_ID || '',
      externalRoleId: process.env.DISCORD_EXTERNAL_ROLE_ID || '',
    },
    web: {
      jwtSecret: process.env.WEB_JWT_SECRET || '',
      uri: process.env.WEB_URI || '',
    },
    email: {
      // ses: {
      //   region: process.env.SES_REGION || '',
      //   accessKeyId: process.env.SES_ACCESS_KEY_ID || '',
      //   secretAccessKey: process.env.SES_SECRET_ACCESS_KEY || '',
      // },
      sendgrid: {
        apiKey: process.env.SENDGRID_API_KEY || '',
      },
    },
    db: {
      host: process.env.DB_HOST || '',
      port: process.env.DB_PORT || '',
      name: process.env.DB_NAME || '',
      password: process.env.DB_PASSWORD || '',
    },
  };

  //   const isValidKey = <K, V>(key: K, config: V) => {
  //     return key in config;
  //   };

  // Recursively check if any of the config values are missing
  const checkConfig = (config: object) => {
    for (const key in config) {
      if (typeof config[key as keyof typeof config] === 'object') {
        checkConfig(config[key as keyof typeof config]);
      } else if (config[key as keyof typeof config] === '') {
        throw new Error(`Missing config value: ${key}`);
      }
    }
  };
  checkConfig(config);

  return config;
};

export default loadConfig;
