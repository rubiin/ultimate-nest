import process from "node:process";
import { Roles } from "@common/@types";
import { randEmail, randFirstName, randLastName } from "@ngneat/falso";

export const user: Record<string, { email: string, password: string }> = {
  admin: {
    email: "roobin.bhandari@gmail.com",
    password: process.env.USER_PASSWORD!,
  },
  user: {
    email: "user@gmail.com",
    password: process.env.USER_PASSWORD!,
  },
  NonExistentUser: {
    email: "unknown@someone.com",
    password: process.env.USER_PASSWORD!,
  },
};

export const userDto = {
  firstName: randFirstName(),
  lastName: randLastName(),
  email: randEmail(),
  username: "username",
  roles: [Roles.AUTHOR],
  password: process.env.USER_PASSWORD!,
};
