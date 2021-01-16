import { CreateAuthorInput } from "@dtos/createAuthor.input";
import { Author } from "@entities/Author.entity";
import { EntityRepository } from "@mikro-orm/core";
import { EntityManager } from "@mikro-orm/postgresql";
import { InjectRepository } from "@mikro-orm/nestjs";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { UpdateAuthorInput } from "@dtos/updateAuthor.input";

@Injectable()
export class AuthorService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Author)
    private readonly authorRepository: EntityRepository<Author>
  ) {}

  async createAuthor(author: CreateAuthorInput): Promise<Author> {
    const checkAuthorExists = await this.authorRepository.findOne({
      username: author.username,
    });
    if (checkAuthorExists) {
      throw new HttpException(
        "Author with username exists",
        HttpStatus.CONFLICT
      );
    }
    const newAuthor = plainToClass(Author, author);

    await this.authorRepository.persistAndFlush(newAuthor);

    return newAuthor;
  }

  async findOneByIdx(idx: string): Promise<Author> {
    const author = await this.authorRepository.findOne({ idx });
    if (!author) {
      throw new HttpException("No author found with id", HttpStatus.NOT_FOUND);
    }
    return author;
  }

  async findAll(search: string): Promise<Author[]> {
    const qb = this.em.createQueryBuilder(Author, "author");

    if (search !== "") {
      qb.andWhere("name = ?", [search]);
    }

    return qb.execute();
  }

  async removeAuthor(idx: string): Promise<boolean> {
    this.authorRepository.remove({ idx });
    return true;
  }

  async updateAuthor(idx: string, author: UpdateAuthorInput): Promise<boolean> {
    const checkAuthorExists = await this.authorRepository.findOne({ idx });
    if (!author) {
      throw new HttpException("No author found with id", HttpStatus.NOT_FOUND);
    }
    if (author.username) {
      const userNameAvailable = await this.authorRepository.findOne({
        username: author.username,
      });
      if (userNameAvailable) {
        throw new HttpException("Username is taken", HttpStatus.BAD_REQUEST);
      }
    }
    Object.assign(checkAuthorExists, author);
    await this.authorRepository.persistAndFlush(checkAuthorExists);
    return true;
  }
}
