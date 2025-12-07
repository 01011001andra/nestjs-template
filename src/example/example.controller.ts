// src/example/example.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ExampleService } from './example.service';
import { CreateExampleDto } from './dto/create-example.dto';
import { UpdateExampleDto } from './dto/update-example.dto';
import { Resource } from 'src/lib/auth/resource.decorator';
import { PermissionAction } from 'src/lib/auth/permission-action.decorator';

@Controller('example')
@Resource('example')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  // GET /examples -> action = "read" (butuh example:read)
  @Get()
  findAll() {
    return this.exampleService.findAll();
  }

  // GET /examples/:id -> action = "read"
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.exampleService.findOne(id);
  }

  // POST /examples -> action = "create" (butuh example:create)
  @Post()
  @PermissionAction('specialCreate')
  create(@Body() dto: CreateExampleDto) {
    return this.exampleService.create(dto);
  }

  // PATCH /examples/:id -> action = "update" (butuh example:update)
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateExampleDto,
  ) {
    return this.exampleService.update(id, dto);
  }

  // DELETE /examples/:id -> action = "delete" (butuh example:delete)
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.exampleService.remove(id);
  }
}
