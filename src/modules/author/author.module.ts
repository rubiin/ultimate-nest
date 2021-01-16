import { Author } from "@entities/Author.entity";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { DateScalar } from "../../common/scalars/date.scalar";
import { AuthorResolver } from "./author.resolver";
import { AuthorService } from "./author.service";

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Author] })],
  providers: [AuthorResolver, AuthorService, DateScalar],
})
export class AuthorModule {}
