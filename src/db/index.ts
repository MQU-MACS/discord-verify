import { Schema, model, connect } from 'mongoose';

interface IAttempt {
  email: string;
  mqID: string;
  fullName: string;
  date: Date;
}

interface IUser {
  discordId: string;
  email: string;
  mqID: string;
  fullName: string;
  isStaff: boolean;
  isExternal: boolean;
  verified: boolean;
  dateVerified: Date;
  attempts: IAttempt[];
}

const AttemptSchema = new Schema<IAttempt>({
  email: String,
  mqID: String,
  fullName: String,
  date: Date,
});

const UserSchema = new Schema<IUser>({
  discordId: { type: String, required: true },
  email: String,
  mqID: String,
  fullName: String,
  isStaff: String,
  isExternal: Boolean,
  verified: { type: Boolean, required: true },
  dateVerified: Date,
  attempts: [AttemptSchema],
});

const User = model<IUser>('User', UserSchema);

const connectToDB = async (
  host: string,
  port: string,
  dbName: string,
  dbPassword: string,
) => {
  await connect(`mongodb://${host}:${port}/${dbName}`, {
    user: 'root',
    pass: dbPassword,
    authSource: 'admin',
  });
};

export const addAttempt = async (
  email: string,
  mqID: string,
  fullName: string,
  discordId: string,
) => {
  let user = await User.findOne({ discordId });

  if (!user) {
    user = new User({
      discordId,
      verified: false,
    });
  }

  const attempt = {
    email,
    mqID,
    fullName,
    date: new Date(),
  };

  user.attempts.push(attempt);

  await user.save();
};

export const attemptsForUser = async (userId: string, lastHours: number) => {
  const user = await User.findOne({ discordId: userId });

  if (!user) {
    return 0;
  }

  return user.attempts.filter((attempt) => {
    const date = new Date(attempt.date);

    const lookbackTime = Date.now() - lastHours * 60 * 60 * 1000;

    return date.getTime() > lookbackTime;
  }).length;
};

export const getUser = async (discordId: string) => {
  return await User.findOne({ discordId });
};

export const getUserByEmail = async (email: string) => {
  return await User.findOne({ email });
};

export const deleteUser = async (discordId: string) => {
  return await User.findOneAndDelete({ discordId });
};

export const addVerifiedUserToDb = async (
  discordId: string,
  email: string,
  mqID: string,
  fullName: string,
  staff: boolean,
  external: boolean
) => {
  // Check if email already exists on another discord account
  try {
    const existingUser = await User.findOne({ email, verified: true });
    if (existingUser && existingUser.discordId !== discordId) {
      throw new Error('Email already used');
    }
  } catch (error) {
    console.log(error);
    throw error;
  }

  let user = await User.findOne({ discordId });

  // Don't save the user again if they are already verified
  if (user?.verified) {
    console.log(`User already verified ${discordId} - ${email} - ${mqID}`);
    return;
  }

  if (!user) {
    user = new User({
      discordId,
      email,
      mqID,
      fullName,
      isStaff: staff,
      isExternal: external,
      verified: true,
      dateVerified: new Date(),
    });
  } else {
    user.email = email;
    user.mqID = mqID;
    user.fullName = fullName;
    user.isStaff = staff;
    user.isExternal = external;
    user.verified = true;
    user.dateVerified = new Date();
  }

  console.log(`Saving user ${discordId} - ${email} - ${mqID}`);

  try {
    await user.save();
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default connectToDB;
