import { Book } from "@entities/Book.entity";
import { EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: EntityRepository<Book>
  ) {}

  async findOneByIdx(idx: string): Promise<Book> {
    const author = await this.bookRepository.findOne({ idx });
    if (!author) {
      throw new HttpException("No author found with id", HttpStatus.NOT_FOUND);
    }
    return author;
  }

  async findAll(): Promise<Book[]> {
    return this.bookRepository.findAll();
  }
}
