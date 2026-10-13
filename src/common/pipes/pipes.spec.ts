import path from "node:path";

import { IsString } from "class-validator";
import { WsException } from "@nestjs/websockets";

import { fileValidatorPipe } from "@common/misc/file";
import { SharpPipe } from "./sharp.pipe";
import { WsValidationPipe } from "./ws-validation.pipe";

vi.mock("sharp", () => {
  const toFile = vi.fn<() => Promise<void>>(async () => undefined);
  const webp = vi.fn<() => unknown>(() => ({ toFile }));
  const resize = vi.fn<() => unknown>(() => ({ webp }));

  return {
    default: vi.fn<() => unknown>(() => ({ resize })),
    __resize: resize,
    __toFile: toFile,
    __webp: webp,
  };
});

const sharpMock = (await import("sharp")).default as unknown as ReturnType<typeof vi.fn>;

const buffer = Buffer.from("image-bytes");

describe("SharpPipe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("writes a timestamped webp and returns the new filename", async () => {
    const pipe = new SharpPipe();

    const filename = await pipe.transform({ buffer, originalname: "my.photo.png" } as never);

    const { __resize, __webp, __toFile } = (await import("sharp")) as unknown as {
      __resize: ReturnType<typeof vi.fn>;
      __webp: ReturnType<typeof vi.fn>;
      __toFile: ReturnType<typeof vi.fn>;
    };

    expect(sharpMock).toHaveBeenCalledWith(buffer);
    expect(__resize).toHaveBeenCalledWith(800);
    expect(__webp).toHaveBeenCalledWith({ effort: 3 });
    expect(__toFile).toHaveBeenCalledWith(path.join("uploads", filename));
    expect(filename).toBe("1704067200000-my.photo.webp");
  });

  it("strips only the extension from the original name", async () => {
    const pipe = new SharpPipe();

    const filename = await pipe.transform({ buffer, originalname: "avatar" } as never);

    expect(filename).toBe("1704067200000-avatar.webp");
  });

  it("rejects when sharp cannot encode the buffer", async () => {
    sharpMock.mockImplementationOnce(() => {
      throw new Error("unsupported image");
    });

    await expect(
      new SharpPipe().transform({ buffer, originalname: "bad.png" } as never),
    ).rejects.toThrow("unsupported image");
  });
});

describe("fileValidatorPipe", () => {
  it("builds a pipe that accepts an image below the size limit", async () => {
    const pipe = fileValidatorPipe({});
    const file = { buffer, mimetype: "image/png", originalname: "a.png", size: 1024 };

    await expect(pipe.transform(file as never, {})).resolves.toBe(file);
  });

  it("rejects a file whose extension is not allowed", async () => {
    const pipe = fileValidatorPipe({ fileType: ["jpg", "png"] });
    const file = { buffer, mimetype: "application/pdf", originalname: "a.pdf", size: 1024 };

    await expect(pipe.transform(file as never, {})).rejects.toThrow(
      "Upload not allowed. Upload only files of type: jpg, png",
    );
  });

  it("accepts a file whose extension is allowed", async () => {
    const pipe = fileValidatorPipe({ fileType: ["jpg", "png"] });
    const file = { buffer, mimetype: "application/pdf", originalname: "a.pdf", size: 1024 };

    await expect(pipe.transform({ ...file, originalname: "a.png" }, {})).resolves.toMatchObject({
      originalname: "a.png",
    });
  });

  it("rejects a file over the size limit with a megabyte message", async () => {
    const pipe = fileValidatorPipe({ fileSize: 1024 });
    const file = {
      buffer,
      mimetype: "image/png",
      originalname: "a.png",
      size: 2 * 1024 * 1024,
    };

    await expect(pipe.transform(file as never, {})).rejects.toThrow(
      "File size should be less than 0 MB",
    );
  });

  it("rejects an empty value when the file is required", async () => {
    const pipe = fileValidatorPipe({ required: true });

    await expect(pipe.transform(undefined as never, {})).rejects.toThrow("File is required");
  });

  it("accepts an empty value when the file is optional", async () => {
    const pipe = fileValidatorPipe({ required: false });

    await expect(pipe.transform(undefined as never, {})).resolves.toBeUndefined();
  });
});

describe("WsValidationPipe", () => {
  // `forbidUnknownValues` rejects a metatype with no registered constraints, so the DTO needs one.
  class Dto {
    @IsString()
    name!: string;
  }

  it("throws a WsException carrying the validation errors", async () => {
    const pipe = new WsValidationPipe();

    await expect(
      pipe.transform({ extra: 1 }, { type: "body", metatype: Dto }),
    ).rejects.toBeInstanceOf(WsException);
  });

  it("passes a valid payload through", async () => {
    const pipe = new WsValidationPipe();

    await expect(pipe.transform({ name: "ada" }, { type: "body", metatype: Dto })).resolves.toEqual(
      { name: "ada" },
    );
  });

  it("lets a caller-supplied exception factory win", async () => {
    const pipe = new WsValidationPipe({
      exceptionFactory: () => new Error("custom"),
    });

    await expect(pipe.transform({ extra: 1 }, { type: "body", metatype: Dto })).rejects.toThrow(
      "custom",
    );
  });
});
