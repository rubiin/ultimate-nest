import { IsStringMinMaxDecorator } from "@common/decorators";

export class CreateCommentDto {
	/**
	 * Content of comment
	 * @example "This is a comment"
	 */

@IsStringMinMaxDecorator()
	readonly body: string;
}
