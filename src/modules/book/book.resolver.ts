import { Book } from "@entities/Book.entity";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { BookService } from "./book.service";

@Resolver(() => Book)
export class AuthorResolver {
  constructor(private readonly bookService: BookService) {}
  @Query(() => [Book])
  async authors(): Promise<Book[]> {
    return this.bookService.findAll();
  }

  @Query(() => Book)
  async author(@Args("idx") idx: string): Promise<Book> {
    return this.bookService.findOneByIdx(idx);
  }

  // @Mutation(() => Book)
  // addAuthor(@Args('author') author: createAuthorInput): Promise<Book> {
  //   return this.bookService.createAuthor(author)
  // }
}
