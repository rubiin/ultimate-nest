import path from "node:path";

import { ConfigService } from "@nestjs/config";
import {
  FileMailTransport,
  FileTemplateEngine,
  InMemoryMailTransport,
  MailModule,
  Mailer,
  SesTransport,
  SmtpTransport,
} from "@nestjs/mail";
import { Test } from "@nestjs/testing";

import { mailTransport } from "./mail.module";
import { ResetPasswordMail, WelcomeMail } from "./mails";

const configWith = (values: Record<string, unknown>) =>
  ({ get: (key: string) => values[key] }) as unknown as ConfigService<Configs, true>;

describe("mails", () => {
  const mailbox = new InMemoryMailTransport();
  let mailer: Mailer;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        MailModule.forRoot({
          transport: mailbox,
          templates: new FileTemplateEngine({
            dir: path.join(__dirname, "../../resources/templates"),
            layout: "layout",
          }),
          from: "Nestify <no-reply@example.com>",
        }),
      ],
      providers: [ResetPasswordMail, WelcomeMail],
    }).compile();

    await module.init();
    mailer = module.get(Mailer);
  });

  beforeEach(() => mailbox.clear());

  it("renders the reset mail with the one-time code inside the layout", async () => {
    await mailer.send(ResetPasswordMail, {
      to: "ada@example.com",
      data: { firstName: "Ada", lastName: "Lovelace", otp: "123456" },
    });

    const mail = mailbox.assertSent({ to: "ada@example.com", subject: "Reset your password" });

    expect(mail.html).toContain("<strong>123456</strong>");
    expect(mail.html).toContain("Best regards");
    expect(mail.html).not.toContain("{{");
  });

  it("renders the welcome mail with the client link", async () => {
    await mailer.send(WelcomeMail, {
      to: "ada@example.com",
      data: { firstName: "Ada", link: "https://app.example.com/start" },
    });

    const mail = mailbox.assertSent({ to: "ada@example.com", subject: "Welcome to the app" });

    expect(mail.link("/start").href).toBe("https://app.example.com/start");
    expect(mail.html).not.toContain("{{");
  });
});

describe("mailTransport", () => {
  // Regression: MAIL_PREVIEW_EMAIL arrived as a string, so "false" counted as truthy.
  it("previews to files only when previewEmail is enabled", () => {
    expect(mailTransport(configWith({ "mail.previewEmail": true }))).toBeInstanceOf(
      FileMailTransport,
    );
  });

  it("uses SES when the server type is SES", () => {
    const transport = mailTransport(
      configWith({
        "mail.type": "SES",
        "mail.sesRegion": "us-east-1",
        "mail.sesKey": "key",
        "mail.sesAccessKey": "secret",
      }),
    );

    expect(transport).toBeInstanceOf(SesTransport);
  });

  it("uses SMTP otherwise", () => {
    const transport = mailTransport(
      configWith({
        "mail.type": "SMTP",
        "mail.host": "smtp.example.com",
        "mail.port": 465,
        "mail.username": "user",
        "mail.password": "secret",
      }),
    );

    expect(transport).toBeInstanceOf(SmtpTransport);
  });
});
