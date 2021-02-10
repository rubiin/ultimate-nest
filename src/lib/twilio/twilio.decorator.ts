import { Inject } from '@nestjs/common';

import { TWILIO_TOKEN } from './twilio.constant';

export const InjectTwilio = () => Inject(TWILIO_TOKEN);
