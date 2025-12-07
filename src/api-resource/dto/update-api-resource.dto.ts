import { PartialType } from '@nestjs/mapped-types';
import { CreateApiResourceDto } from './create-api-resource.dto';

export class UpdateApiResourceDto extends PartialType(CreateApiResourceDto) {}
