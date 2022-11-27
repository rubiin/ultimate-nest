import { createMock } from "@golevelup/ts-jest";
import { ExecutionContext } from "@nestjs/common";
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

			const canActivate = authenticatedGuard.canActivate(mockContext);

			expect(canActivate).toBe(true);
		});
	});
});
