import { randAbbreviation, randBrand, randCatchPhrase } from "@ngneat/falso";

export const postDto = {
  content: randCatchPhrase(),
  description: randCatchPhrase(),
  tags: [randAbbreviation(), randAbbreviation()],
  title: randBrand(),
};

export interface SuperTestBody<T = unknown> {
  body: T & {
    errors: string[];
  };
}
