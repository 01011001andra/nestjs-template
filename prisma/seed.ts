// prisma/seed.ts
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { HttpMethod, PrismaClient } from '../src/generated/prisma/client';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding RBAC...');

  // ============================
  // 1. ROLES
  // ============================
  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: { name: 'user', description: 'Regular user' },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin', description: 'Admin but limited' },
  });

  const superAdminRole = await prisma.role.upsert({
    where: { name: 'superAdmin' },
    update: {},
    create: { name: 'superAdmin', description: 'Full system access' },
  });

  // ============================
  // 2. API RESOURCES
  // ============================
  const exampleRead = await prisma.apiResource.upsert({
    where: { name: 'example:read' },
    update: {},
    create: {
      name: 'example:read',
      method: HttpMethod.GET,
      path: '/example',
      description: 'Get list or detail of examples',
    },
  });

  const exampleCreate = await prisma.apiResource.upsert({
    where: { name: 'example:create' },
    update: {},
    create: {
      name: 'example:create',
      method: HttpMethod.POST,
      path: '/example',
      description: 'Create example item',
    },
  });

  const exampleUpdate = await prisma.apiResource.upsert({
    where: { name: 'example:update' },
    update: {},
    create: {
      name: 'example:update',
      method: HttpMethod.PATCH,
      path: '/example/:id',
      description: 'Update example item',
    },
  });

  const exampleSetRole = await prisma.apiResource.upsert({
    where: { name: 'example:set-role' },
    update: {},
    create: {
      name: 'example:set-role',
      method: HttpMethod.POST,
      path: '/example/set-role',
      description: 'Set role for example',
    },
  });

  const exampleDelete = await prisma.apiResource.upsert({
    where: { name: 'example:delete' },
    update: {},
    create: {
      name: 'example:delete',
      method: HttpMethod.DELETE,
      path: '/example/:id',
      description: 'Delete example item',
    },
  });

  // ============================
  // 3. PERMISSIONS
  // ============================

  // ---- USER (Hanya READ)
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

  // ---- ADMIN (Hanya READ juga)
  await prisma.roleApiPermission.upsert({
    where: {
      roleId_apiResourceId: {
        roleId: adminRole.id,
        apiResourceId: exampleRead.id,
      },
    },
    update: { allow: true },
    create: {
      roleId: adminRole.id,
      apiResourceId: exampleRead.id,
      allow: true,
    },
  });

  // ---- SUPERADMIN (READ + CREATE + UPDATE + DELETE)
  const allResources = [
    exampleRead,
    exampleCreate,
    exampleUpdate,
    exampleDelete,
  ];

  for (const res of allResources) {
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
  // superAdmin: tambahin resource baru ini
  for (const res of [
    exampleRead,
    exampleCreate,
    exampleUpdate,
    exampleDelete,
    exampleSetRole,
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

  console.log('RBAC seed completed!');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
