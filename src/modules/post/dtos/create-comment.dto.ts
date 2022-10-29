import { IsStringMinMax } from "@common/decorators";

export class CreateCommentDto {
	/**
	 * Content of comment
	 * @example "This is a comment"
	 */

	@IsStringMinMax()
	readonly body: string;
}
