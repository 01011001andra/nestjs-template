// auth/resource.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const RESOURCE_KEY = 'resource';

// name: misal 'example'
export const Resource = (name: string) => SetMetadata(RESOURCE_KEY, name);
