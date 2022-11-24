import { PageOptionsDto } from "@common/classes/pagination";
import { Order, Roles } from "@common/types/enums";


export const mockedUser = {
  idx: 'idx',
  username:'username',
  password:'password',
  firstName:'firstName',
  lastName:'lastName',
  email:'email',
  avatar:'avatar',
  roles:[Roles.ADMIN],
  mobileNumber:'mobileNumber',
}



export const mockedPost = {
slug: 'slug',
title: 'title',
description: 'description',
content: 'content',
tags: ['tag1', 'tag2'],
}

export const query: PageOptionsDto = {
  page: 1,
  limit: 10,
  offset: 5,
  sort: 'createdAt',
  order: Order.DESC
};
