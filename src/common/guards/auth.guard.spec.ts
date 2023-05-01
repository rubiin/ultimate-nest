import { createMock } from "@golevelup/ts-jest";
import { mockJwtService } from "@mocks";
import { ExecutionContext, HttpException } from "@nestjs/common";

import { AuthGuard } from "./auth.guard";

describe("AuthenticatedGuard", () => {
	let authenticatedGuard: AuthGuard;
	const mockContext = createMock<ExecutionContext>({
		switchToHttp: () => ({
			getRequest: () => ({
				headers: {
					authorization: "Bearer token",
				},
			}),
		}),
	});

	beforeEach(() => {
		authenticatedGuard = new AuthGuard(mockJwtService);
	});

	it("should be defined", () => {
		expect(authenticatedGuard).toBeDefined();
	});

	describe("canActivate", () => {
		it("should return authorization", () => {
			mockJwtService.verify.mockImplementationOnce(() => {
				return { idx: "idx" };
			});
			expect(authenticatedGuard.canActivate(mockContext)).toBe(true);
		});

		it.skip("should throw error when invalid token", () => {
			mockJwtService.verify.mockImplementationOnce(() => {
				throw new Error("Invalid token");
			});

			try {
				authenticatedGuard.canActivate(mockContext);
			} catch (error) {
				expect(error).toBeInstanceOf(HttpException);
			}
		});
	});
});
