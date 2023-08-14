import { createMock } from '@golevelup/ts-jest';
import type { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt.guard';

import { mockReflector } from '@mocks';

describe('JwtAuthGuard', () => {
  let authenticatedGuard: JwtAuthGuard;

  const mockContext = createMock<ExecutionContext>({
    switchToHttp: () => ({
      getRequest: () => ({
        headers: {
          authorization: 'Bearer token',
        },
      }),
    }),
  });

  beforeEach(() => {
    authenticatedGuard = new JwtAuthGuard(mockReflector);
  });

  it('should be defined', () => {
    expect(authenticatedGuard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true for public', () => {
      mockReflector.get.mockImplementationOnce(() => {
        return true;
      });
      expect(authenticatedGuard.canActivate(mockContext)).toBe(true);
    });
  });
});
