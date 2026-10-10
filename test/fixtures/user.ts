import process from "node:process";

import { Roles } from "@common/@types";
import { randEmail, randFirstName, randLastName } from "@ngneat/falso";

export const user: Record<string, { email: string; password: string }> = {
  NonExistentUser: {
    email: "unknown@someone.com",
    password: process.env.USER_PASSWORD!,
  },
  admin: {
    email: "roobin.bhandari@gmail.com",
    password: process.env.USER_PASSWORD!,
  },
  user: {
    email: "user@gmail.com",
    password: process.env.USER_PASSWORD!,
  },
};

export const userDto = {
  email: randEmail(),
  firstName: randFirstName(),
  lastName: randLastName(),
  password: process.env.USER_PASSWORD!,
  roles: [Roles.AUTHOR],
  username: "username",
};
