import { createMock } from "@golevelup/ts-jest";
import { NestCaslModule } from "@lib/casl";
import { Test, TestingModule } from "@nestjs/testing";

import { PostController } from "./post.controller";
import { PostService } from "./post.service";

describe("PostController", () => {
	let controller: PostController;
	const postService = createMock<PostService>();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [NestCaslModule],
			controllers: [PostController],
			providers: [
				{
					provide: PostService,
					useValue: postService,
				},
			],
		}).compile();

		controller = module.get<PostController>(PostController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
