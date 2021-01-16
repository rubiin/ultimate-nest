import { DateScalar } from "@common/scalars/date.scalar";
import { Book } from "@entities/Book.entity";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { BookService } from "./book.service";

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Book] })],
  providers: [BookService, DateScalar],
})
export class BookModule {}
