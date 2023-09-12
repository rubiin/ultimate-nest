import {ExitInterceptor} from './app-exit.interceptor';
import {mockContext, mockNext} from '@mocks';

describe('ExitInterceptor', () => {
    let interceptor: ExitInterceptor;

    beforeEach(() => {
        interceptor = new ExitInterceptor();
    });

    describe('intercept', () => {
        it('should pass', () => {
            interceptor.intercept(mockContext, mockNext).subscribe((result) => {
                expect(result).toEqual({});
            });
        });
    });
});
