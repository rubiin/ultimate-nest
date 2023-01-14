import { createMock } from "@golevelup/ts-jest";
import { ExecutionContext, HttpException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { AuthGuard } from "./auth.guard";

describe("AuthenticatedGuard", () => {
	let authenticatedGuard: AuthGuard;
	const mockJwt = createMock<JwtService>();
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
		authenticatedGuard = new AuthGuard(mockJwt);
	});

	it("should be defined", () => {
		expect(authenticatedGuard).toBeDefined();
	});

	describe("canActivate", () => {
		it("should return authorization", () => {
			mockJwt.verify.mockImplementationOnce(() => {
				return { idx: "idx" };
			});
			expect(authenticatedGuard.canActivate(mockContext)).toBe(true);
		});

		// fix this test

		it.skip("should throw error when invalid token", () => {
			mockJwt.verify.mockImplementationOnce(() => {
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
