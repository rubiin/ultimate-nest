import * as realIp from '@supercharge/request-ip';
import {RealIpMiddleware} from './ip.middleware';

import {mockRequest, mockResponse} from '@mocks';

describe('RealIpMiddleware', () => {
    let middleware: RealIpMiddleware;

    beforeEach(() => {
        middleware = new RealIpMiddleware();
    });
    it('should be defined', () => {
        expect(middleware).toBeDefined();
    });

    describe('use', () => {
        it('should return real ip', () => {
            jest.spyOn(realIp, 'getClientIp').mockReturnValue('192.168.1.1');

            const mockNext = jest.fn();

            middleware.use(mockRequest, mockResponse, mockNext);

            expect(realIp.getClientIp).toBeCalled();
            expect(mockRequest.realIp).toBe('192.168.1.1');
            expect(mockNext).toBeCalled();
        });
    });
});
