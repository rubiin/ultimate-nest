import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreateAuthorInput } from "@dtos/createAuthor.input";
import { Author } from "@entities/Author.entity";
import { AuthorService } from "../author/author.service";
import { UpdateAuthorInput } from "@dtos/updateAuthor.input";

@Resolver(() => Author)
export class AuthorResolver {
  constructor(private readonly authorService: AuthorService) {}

  @Query(() => [Author])
  async authors(@Args("search", { nullable: true }) search: string = "") {
    return this.authorService.findAll(search);
  }

  @Query(() => Author)
  async author(@Args("idx") idx?: string): Promise<Author> {
    return this.authorService.findOneByIdx(idx);
  }

  @Mutation(() => Author)
  addAuthor(@Args("author") author: CreateAuthorInput): Promise<Author> {
    return this.authorService.createAuthor(author);
  }

  @Mutation(() => Boolean)
  async removeAuthor(@Args("idx") idx: string): Promise<boolean> {
    return this.authorService.removeAuthor(idx);
  }

  @Mutation(() => Boolean)
  async updateAuthor(
    @Args("idx") idx: string,
    @Args("author") updateAuthor: UpdateAuthorInput
  ): Promise<boolean> {
    return this.authorService.updateAuthor(idx, updateAuthor);
  }
}
