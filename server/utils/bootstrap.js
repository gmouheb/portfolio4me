import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import User from "../models/User.js";

export async function ensureAdminUser() {
  const [userByUsername, userByEmail] = await Promise.all([
    User.findOne({ username: env.adminUsername }),
    User.findOne({ email: env.adminEmail }),
  ]);

  if (userByUsername && userByEmail && userByUsername.id !== userByEmail.id) {
    throw new Error(
      `Bootstrap admin conflict: username "${env.adminUsername}" and email "${env.adminEmail}" belong to different users`,
    );
  }

  const existingUser = userByUsername || userByEmail;

  if (existingUser) {
    const usernameChanged = existingUser.username !== env.adminUsername;
    const emailChanged = existingUser.email !== env.adminEmail;

    existingUser.username = env.adminUsername;
    existingUser.email = env.adminEmail;

    if (usernameChanged || emailChanged) {
      await existingUser.save();
      console.log(`Updated bootstrap admin user identity "${env.adminUsername}"`);
    } else {
      console.log(`Bootstrap admin user "${env.adminUsername}" already exists`);
    }

    return;
  }

  const password = await bcrypt.hash(env.adminPassword, 10);

  await User.create({
    username: env.adminUsername,
    email: env.adminEmail,
    password,
  });

  console.log(`Created bootstrap admin user "${env.adminUsername}"`);
}
