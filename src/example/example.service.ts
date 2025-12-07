// src/example/example.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateExampleDto } from './dto/create-example.dto';
import { UpdateExampleDto } from './dto/update-example.dto';

@Injectable()
export class ExampleService {
  constructor(private readonly db: DatabaseService) {}

  create(dto: CreateExampleDto) {
    return this.db.example.create({ data: dto });
  }

  findAll() {
    return this.db.example.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const item = await this.db.example.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Example with id "${id}" not found`);
    }
    return item;
  }

  async update(id: string, dto: UpdateExampleDto) {
    await this.findOne(id);
    return this.db.example.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.db.example.delete({ where: { id } });
    return { success: true };
  }
}
