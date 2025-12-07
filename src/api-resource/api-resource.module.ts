import { Module } from '@nestjs/common';
import { ApiResourceService } from './api-resource.service';
import { ApiResourceController } from './api-resource.controller';

@Module({
  controllers: [ApiResourceController],
  providers: [ApiResourceService],
})
export class ApiResourceModule {}
