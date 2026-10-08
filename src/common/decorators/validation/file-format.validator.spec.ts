import { CustomUploadFileTypeValidator } from "./file-format.validator";

describe("customUploadFileTypeValidator", () => {
  const buildFile = (originalname: string) => ({ originalname }) as Express.Multer.File;

  it("should accept a file with an allowed extension", () => {
    const validator = new CustomUploadFileTypeValidator({ fileType: ["png", "jpg"] });

    expect(validator.isValid(buildFile("avatar.png"))).toBe(true);
    expect(validator.isValid(buildFile("photo.jpg"))).toBe(true);
  });

  it("should reject a file with a disallowed extension", () => {
    const validator = new CustomUploadFileTypeValidator({ fileType: ["png", "jpg"] });

    expect(validator.isValid(buildFile("script.exe"))).toBe(false);
  });

  it("should reject a file without an extension", () => {
    const validator = new CustomUploadFileTypeValidator({ fileType: ["png", "jpg"] });

    expect(validator.isValid(buildFile("README"))).toBe(false);
  });

  it("should be case sensitive about the extension", () => {
    const validator = new CustomUploadFileTypeValidator({ fileType: ["png"] });

    expect(validator.isValid(buildFile("avatar.PNG"))).toBe(false);
  });

  it("should only accept the last dot-separated segment", () => {
    const validator = new CustomUploadFileTypeValidator({ fileType: ["gz"] });

    expect(validator.isValid(buildFile("archive.tar.gz"))).toBe(true);
    expect(validator.isValid(buildFile("archive.tar"))).toBe(false);
  });

  it("should build an error message listing the allowed types", () => {
    const validator = new CustomUploadFileTypeValidator({ fileType: ["png", "jpg"] });

    expect(validator.buildErrorMessage()).toEqual(
      "Upload not allowed. Upload only files of type: png, jpg",
    );
  });
});
