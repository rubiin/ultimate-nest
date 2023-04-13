import { BaseRepository } from "@common/database";
import { NewsLetter, Tag } from "@entities";
import { InjectRepository } from "@mikro-orm/nestjs";
import { BaseService } from "@modules/base/base.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class NewsLetterService extends BaseService<NewsLetter> {
	// @ts-expect-error: Unused import error
	constructor(@InjectRepository(Tag) private newsLetterRepository: BaseRepository<NewsLetter>) {
		super(newsLetterRepository);
	}
}
