// prisma/seed.ts
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { HttpMethod, PrismaClient } from '../src/generated/prisma/client';

const adapter = new PrismaBetterSqlite3({
  // sama dengan DATABASE_URL kamu
  url: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding RBAC...');

  // Roles
  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: { name: 'user', description: 'Regular user' },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin', description: 'Administrator' },
  });

  const superAdminRole = await prisma.role.upsert({
    where: { name: 'superAdmin' },
    update: {},
    create: { name: 'superAdmin', description: 'Super administrator' },
  });

  // ApiResources untuk ExampleController
  const exampleRead = await prisma.apiResource.upsert({
    where: { name: 'example:read' },
    update: {},
    create: {
      name: 'example:read',
      method: HttpMethod.GET,
      path: '/example',
      description: 'List or detail example',
    },
  });

  const exampleCreate = await prisma.apiResource.upsert({
    where: { name: 'example:create' },
    update: {},
    create: {
      name: 'example:create',
      method: HttpMethod.POST,
      path: '/example',
      description: 'Create example',
    },
  });

  const exampleUpdate = await prisma.apiResource.upsert({
    where: { name: 'example:update' },
    update: {},
    create: {
      name: 'example:update',
      method: HttpMethod.PATCH,
      path: '/example/:id',
      description: 'Update example',
    },
  });

  const exampleDelete = await prisma.apiResource.upsert({
    where: { name: 'example:delete' },
    update: {},
    create: {
      name: 'example:delete',
      method: HttpMethod.DELETE,
      path: '/example/:id',
      description: 'Delete example',
    },
  });

  // Permission matrix (role -> apiResource)
  // user: hanya read
  await prisma.roleApiPermission.upsert({
    where: {
      roleId_apiResourceId: {
        roleId: userRole.id,
        apiResourceId: exampleRead.id,
      },
    },
    update: { allow: true },
    create: {
      roleId: userRole.id,
      apiResourceId: exampleRead.id,
      allow: true,
    },
  });

  // admin: read + create + update
  for (const res of [exampleRead, exampleCreate, exampleUpdate]) {
    await prisma.roleApiPermission.upsert({
      where: {
        roleId_apiResourceId: {
          roleId: adminRole.id,
          apiResourceId: res.id,
        },
      },
      update: { allow: true },
      create: {
        roleId: adminRole.id,
        apiResourceId: res.id,
        allow: true,
      },
    });
  }

  // superAdmin: semua
  for (const res of [
    exampleRead,
    exampleCreate,
    exampleUpdate,
    exampleDelete,
  ]) {
    await prisma.roleApiPermission.upsert({
      where: {
        roleId_apiResourceId: {
          roleId: superAdminRole.id,
          apiResourceId: res.id,
        },
      },
      update: { allow: true },
      create: {
        roleId: superAdminRole.id,
        apiResourceId: res.id,
        allow: true,
      },
    });
  }

  console.log('RBAC seed done');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
