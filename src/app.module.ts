import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import {
  AuthGuard,
  AuthModule as AuthModuleBetterAuth,
} from '@thallesp/nestjs-better-auth';
import { auth } from './lib/auth/auth';
import { APP_GUARD } from '@nestjs/core';
import { PermissionsGuard } from './lib/auth/permission.guard';
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
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
