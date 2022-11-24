import { Roles } from "@common/types/enums";
import { Post, User } from "@entities";


export const mockedUser = {
  username:'username',
  password:'password',
  firstName:'firstName',
  lastName:'lastName',
  email:'email',
  avatar:'avatar',
  roles:[Roles.ADMIN],
  mobileNumber:'mobileNumber',
} as User



export const mockedPost = {
slug: 'slug',
title: 'title',
description: 'description',
content: 'content',
tags: ['tag1', 'tag2'],
} as Post
