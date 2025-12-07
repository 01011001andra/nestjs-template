import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import {
  AuthGuard,
  AuthModule as AuthModuleBetterAuth,
} from '@thallesp/nestjs-better-auth';
import { auth } from './lib/auth';
import { APP_GUARD } from '@nestjs/core';
import { RbacGuard } from './lib/auth/rbac.guard';
import { ExampleModule } from './example/example.module';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    AuthModuleBetterAuth.forRoot({ auth, disableGlobalAuthGuard: true }),
    ExampleModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 1) Isi req.session & req.user
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    // 2) Cek permission custom ke Prisma
    {
      provide: APP_GUARD,
      useClass: RbacGuard,
    },
  ],
})
export class AppModule {}
