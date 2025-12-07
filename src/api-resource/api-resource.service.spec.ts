import { Test, TestingModule } from '@nestjs/testing';
import { ApiResourceService } from './api-resource.service';

describe('ApiResourceService', () => {
  let service: ApiResourceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApiResourceService],
    }).compile();

    service = module.get<ApiResourceService>(ApiResourceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
