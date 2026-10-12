import { OtpPurpose } from "@common/@types";
import { DEFAULT_OTP_EXPIRY_MINUTES, MS_PER_MINUTE, OTP_LENGTH } from "@common/constant";
import { OtpLog } from "@entities";
import { mockOtpLogRepo, mockProtocolRepo, mockedUser } from "@mocks";

import { OtpService } from "./otp.service";

describe("otpService", () => {
  let service: OtpService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOtpLogRepo.create.mockImplementation(
      ((data: Partial<OtpLog>) => new OtpLog(data)) as never,
    );
    service = new OtpService(mockProtocolRepo, mockOtpLogRepo);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should expire the otp using the active protocol", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
    mockProtocolRepo.findOne.mockResolvedValue({ otpExpiryInMinutes: 30 } as never);

    const { otp } = await service.create(mockedUser as never, OtpPurpose.RESET_PASSWORD);

    expect(mockProtocolRepo.findOne).toHaveBeenCalledWith({ isActive: true });
    expect(otp.expiresIn.getTime() - Date.now()).toBe(30 * MS_PER_MINUTE);
  });

  it("should default the expiry when no protocol exists", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
    mockProtocolRepo.findOne.mockResolvedValue(null as never);

    const { otp } = await service.create(mockedUser as never, OtpPurpose.VERIFY_EMAIL);

    expect(otp.expiresIn.getTime() - Date.now()).toBe(DEFAULT_OTP_EXPIRY_MINUTES * MS_PER_MINUTE);
  });

  it("should return the entity and the same plaintext code it carries", async () => {
    mockProtocolRepo.findOne.mockResolvedValue(null as never);

    const { otp, otpCode } = await service.create(mockedUser as never, OtpPurpose.RESET_PASSWORD);

    expect(otpCode).toHaveLength(OTP_LENGTH);
    expect(otp.otpCode).toBe(otpCode);
    expect(otp.purpose).toBe(OtpPurpose.RESET_PASSWORD);
    expect(otp.isUsed).toBe(false);
    // The caller persists it, so a code can be issued inside an existing transaction.
    expect(mockOtpLogRepo.create).toHaveBeenCalledTimes(1);
  });
});
