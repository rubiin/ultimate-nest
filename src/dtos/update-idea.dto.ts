import { PartialType } from '@nestjs/mapped-types';
import { CreateIdeaDto } from './create-idea.dto';

export class UpdateIdeaDto extends PartialType(CreateIdeaDto) {}
