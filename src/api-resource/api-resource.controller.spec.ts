import { Test, TestingModule } from '@nestjs/testing';
import { ApiResourceController } from './api-resource.controller';
import { ApiResourceService } from './api-resource.service';

describe('ApiResourceController', () => {
  let controller: ApiResourceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiResourceController],
      providers: [ApiResourceService],
    }).compile();

    controller = module.get<ApiResourceController>(ApiResourceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
