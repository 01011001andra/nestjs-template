// src/rbac/api-resource/api-resource.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiResourceService } from './api-resource.service';
import { CreateApiResourceDto } from './dto/create-api-resource.dto';
import { UpdateApiResourceDto } from './dto/update-api-resource.dto';

@Controller('rbac/api-resources')
export class ApiResourceController {
  constructor(private readonly apiResourceService: ApiResourceService) {}

  @Get()
  findAll() {
    return this.apiResourceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.apiResourceService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateApiResourceDto) {
    return this.apiResourceService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateApiResourceDto,
  ) {
    return this.apiResourceService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.apiResourceService.remove(id);
  }
}
