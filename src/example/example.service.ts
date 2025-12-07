// src/example/example.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExampleDto } from './dto/create-example.dto';
import { UpdateExampleDto } from './dto/update-example.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ExampleService {
  constructor(private readonly prisma: DatabaseService) {}

  create(dto: CreateExampleDto) {
    return this.prisma.example.create({
      data: dto,
    });
  }

  findAll() {
    return this.prisma.example.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.example.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException(`example with id "${id}" not found`);
    }

    return item;
  }

  async update(id: string, dto: UpdateExampleDto) {
    await this.findOne(id); // akan throw kalau tidak ada
    return this.prisma.example.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.example.delete({
      where: { id },
    });
    return { success: true };
  }
}
