import { GenericController } from "@common/decorators";
import { NewsLetter } from "@entities";
import { BaseController } from "@modules/base/base.controller";

import { NewsLetterService } from "./newsletter.service";

@GenericController("newsletter")
export class NewsLetterController extends BaseController<NewsLetter> {
	// @ts-expect-error: Unused import error
	constructor(private newsLetterService: NewsLetterService) {
		super(newsLetterService);
	}
}
