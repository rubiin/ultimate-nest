import path from "node:path";
import { FileValidator } from "@nestjs/common";

export interface CustomUploadTypeValidatorOptions {
  fileType: string[]
}

export class CustomUploadFileTypeValidator extends FileValidator {
  private _allowedExtensions: string[];

  constructor(protected readonly validationOptions: CustomUploadTypeValidatorOptions) {
    super(validationOptions);
    this._allowedExtensions = this.validationOptions.fileType;
  }

  public isValid(file: Express.Multer.File): boolean {
    const extension = path.extname(file.originalname).split('.').pop() ?? "";
    return this._allowedExtensions.includes(extension);
  }

  public buildErrorMessage(): string {
    return `Upload not allowed. Upload only files of type: ${this._allowedExtensions.join(
      ", ",
    )}`;
  }
}
