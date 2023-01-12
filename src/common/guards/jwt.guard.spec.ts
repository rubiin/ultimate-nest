import { createMock } from "@golevelup/ts-jest";
import { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { I18nService } from "nestjs-i18n";

import { JwtAuthGuard } from "./jwt.guard";

describe("JwtAuthGuard", () => {
	let authenticatedGuard: JwtAuthGuard;
	const mockReflector = createMock<Reflector>();
	const mockI18n = createMock<I18nService>();
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
		authenticatedGuard = new JwtAuthGuard(mockReflector, mockI18n);
	});

	it("should be defined", () => {
		expect(authenticatedGuard).toBeDefined();
	});

	describe("canActivate", () => {
		it("should return true for public", () => {
			mockReflector.get.mockImplementationOnce(() => {
				return true;
			});
			expect(authenticatedGuard.canActivate(mockContext)).toBe(true);
		});
	});
});
