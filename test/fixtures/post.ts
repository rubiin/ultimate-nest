import { randAbbreviation, randBrand, randCatchPhrase } from "@ngneat/falso";

export const postDto = {
  title: randBrand(),
  description: randCatchPhrase(),
  content: randCatchPhrase(),
  tags: [randAbbreviation(), randAbbreviation()],
};

export interface SuperTestBody<T = unknown> {
  body: T & {
    errors: string[]
  }
}
