import { BaseRepository } from "@common/database";
import { NewsLetter, Tag } from "@entities";
import { InjectRepository } from "@mikro-orm/nestjs";
import { BaseService } from "@modules/base/base.service";
import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";

@Injectable()
export class NewsLetterService extends BaseService<NewsLetter> {
	constructor(@InjectRepository(Tag) private newsLetterRepository: BaseRepository<NewsLetter>) {
		super(newsLetterRepository);
	}

		@Cron('45 * * * * *')
		async sendNewLetter() {
			const newsLetterEmails = await this.newsLetterRepository.find({
				isActive: true,
				isObsolete: false,
			}, { fields: ['email'] });
			const emailPromises = []

			for (const email of newsLetterEmails) {

				emailPromises.push(
					
				)
			}
		}

}
