import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import User from "../models/User.js";

export async function ensureAdminUser() {
  const existingUser = await User.findOne({ username: env.adminUsername }).lean();

  if (existingUser) {
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
