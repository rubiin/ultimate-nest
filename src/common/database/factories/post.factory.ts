import { Post } from "@entities"
import { Factory } from "@mikro-orm/seeder"
import { randAwsRequestId, randProductDescription } from "@ngneat/falso"
import { randomNumber } from "helper-fns"

/* `PostFactory` is a factory that creates `Post` instances */
export class PostFactory extends Factory<Post> {
  model = Post

  definition(): Partial<Post> {
    return {
      title: randAwsRequestId(),
      content: randProductDescription(),
      description: randProductDescription(),
      readingTime: randomNumber(10, 100),
      favoritesCount: randomNumber(1, 100),
      readCount: randomNumber(10, 100),
    }
  }
}
