import { OtpPurpose } from "@common/@types";
import { DEFAULT_OTP_EXPIRY_MINUTES, MS_PER_MINUTE, OTP_LENGTH } from "@common/constant";
import { BaseRepository } from "@common/database";
import { OtpLog, Protocol, User } from "@entities";
import { InjectRepository } from "@mikro-orm/nestjs";
import { ref } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import { init } from "@paralleldrive/cuid2";

/**
 * Issues OTPs. The expiry came from the active `Protocol`, so creating one previously meant
 * both `AuthService` and `UserService` had to depend on `ProtocolRepository` and repeat the same
 * five steps. Reading an existing OTP already lived in `AuthService.findActiveOtp`, so creation
 * lives here too and neither service needs the protocol repository any more.
 */
@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Protocol)
    private readonly protocolRepository: BaseRepository<Protocol>,
    @InjectRepository(OtpLog)
    private readonly otpRepository: BaseRepository<OtpLog>,
  ) {}

  /**
   * Creates an unsaved `OtpLog`. The caller persists it, so a code can be issued inside an
   * existing transaction.
   * @param user - The user the code belongs to.
   * @param purpose - What the code authorises.
   * @returns The OTP entity and its plaintext code, which is never stored in readable form.
   */
  async create(user: User, purpose: OtpPurpose): Promise<{ otp: OtpLog; otpCode: string }> {
    const protocol = await this.protocolRepository.findOne({ isActive: true });
    const expiryMinutes = protocol?.otpExpiryInMinutes ?? DEFAULT_OTP_EXPIRY_MINUTES;
    const otpCode = init({ length: OTP_LENGTH })();

    const otp = this.otpRepository.create({
      expiresIn: new Date(Date.now() + expiryMinutes * MS_PER_MINUTE),
      otpCode,
      purpose,
      user: ref(user),
    });

    return { otp, otpCode };
  }
}
