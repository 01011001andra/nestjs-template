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
import { Permission } from 'src/lib/auth/permission.decorator';

@Controller('example')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Get()
  @Permission('example:read')
  findAll() {
    return this.exampleService.findAll();
  }

  @Get(':id')
  @Permission('example:read')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.exampleService.findOne(id);
  }

  @Post()
  @Permission('example:create')
  create(@Body() dto: CreateExampleDto) {
    return this.exampleService.create(dto);
  }

  @Post('set-role')
  @Permission('example:set-role')
  setRoleForSomething(@Body() dto: any) {
    return 'success';
  }

  @Patch(':id')
  @Permission('example:update')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateExampleDto,
  ) {
    return this.exampleService.update(id, dto);
  }

  @Delete(':id')
  @Permission('example:delete')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.exampleService.remove(id);
  }
}
