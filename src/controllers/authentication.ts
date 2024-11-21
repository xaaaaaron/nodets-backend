import { createUser, getUserByEmail, getUserByUsername } from "../db/users";
import express from "express";
import { random, authentication } from "../helpers";

export const login = async (
  req: express.Request,
  res: express.Response
): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400);
    }

    const user = await getUserByEmail(email).select(
      "+authentication.salt +authentication.password"
    );

    if (!user) {
      return res.status(400);
    }

    const expectedHash = authentication(user.authentication.salt, password);

    if (user.authentication.password !== expectedHash) {
      return res.status(403);
    }

    const salt = random();
    user.authentication.sessionToken = authentication(
      salt,
      user._id.toString()
    );

    await user.save();

    res.cookie("AUTH", user.authentication.sessionToken, {
      domain: "localhost",
      path: "/",
    });

    return res.status(200).json(user).end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const register = async (
  req: express.Request,
  res: express.Response
): Promise<any> => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.sendStatus(400);
    }

    const existingUser = await getUserByEmail(email);
    const existingUsername = await getUserByUsername(username);

    if (existingUser) {
      return res.status(400).json({ error: "email already exist" });
    }

    if (existingUsername) {
      return res.status(400).json({ error: "username already exist" });
    }

    const salt = random();

    const user = await createUser({
      email,
      username,
      authentication: {
        salt,
        password: authentication(salt, password),
      },
    });
    return res.status(200).json(user).end();
  } catch (err) {
    console.log(err);
    return res.sendStatus(400);
  }
};
