import { TimeoutInterceptor } from './timeout.interceptor';
import { mockContext, mockNext } from '@mocks';

describe('TimeoutInterceptor', () => {
  let interceptor: TimeoutInterceptor;

  beforeEach(() => {
    interceptor = new TimeoutInterceptor();
  });

  describe('intercept', () => {
    it('should pass', () => {
      interceptor.intercept(mockContext, mockNext).subscribe((result) => {
        expect(result).toEqual({});
      });
    });
  });
});
