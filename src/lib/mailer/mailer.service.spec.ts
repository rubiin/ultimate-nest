import { Server, TemplateEngine } from "@common/@types";
import { firstValueFrom } from "rxjs";

import { MailerService } from "./mailer.service";

describe("MailerService", () => {
  const service = new MailerService({
    credentials: {
      host: "localhost",
      password: "password",
      port: 1025,
      type: Server.SMTP,
      username: "username",
    },
    previewEmail: false,
    templateDir: "src/resources/templates",
    templateEngine: TemplateEngine.ETA,
  });

  // Regression: the template path was `resolve("}")`, the templates used eta v1's `includeFile`,
  // and reset.eta never printed the OTP that `forgotPassword` sends.
  it("renders the named template from templateDir before sending", async () => {
    const sendMail = vi.spyOn(service.transporter, "sendMail").mockResolvedValue({} as never);

    await firstValueFrom(
      service.sendMail({
        replacements: { firstName: "Jane", lastName: "Doe", otp: "123456" },
        subject: "Reset",
        template: "reset",
        to: "jane@example.com",
      }),
    );

    expect(sendMail).toHaveBeenCalledOnce();
    expect(sendMail.mock.calls[0][0].html).toContain("123456");
  });
});
