import type { FileValidator } from "@common/@types";
import { FileSize, FileType } from "@common/@types";
import { CustomUploadFileTypeValidator } from "@common/decorators";
import { HttpStatus, ParseFilePipeBuilder } from "@nestjs/common";


/**
 *
 * It takes in a fileType, fileSize, and required boolean and returns a ParseFilePipeBuilder object
 * with the fileType and fileSize validators added to it
 * @param param - IFileValidator
 * @param param.fileType - type of file to be uploaded
 * @param param.fileSize - size of file in bytes
 * @param param.required - whether the file is required or not
 * @returns A function that returns a ParseFilePipeBuilder
 */
export function fileValidatorPipe({
  fileType = FileType.IMAGE,
  fileSize = FileSize.IMAGE,
  required = true,
}: FileValidator) {
  return new ParseFilePipeBuilder()
  .addValidator(
    new CustomUploadFileTypeValidator({
      fileType,
    }),
  )
  .addMaxSizeValidator({
      maxSize: fileSize,
      message: maxSize => `File size should be less than ${Math.round(maxSize / 1024 / 1024)} MB`,
    })
    .build({
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      fileIsRequired: required,
    });
}
