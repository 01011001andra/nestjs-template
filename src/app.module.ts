import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { AuthModule as AuthModuleBetterAuth } from '@thallesp/nestjs-better-auth';
import { auth } from './lib/auth';

@Module({
  imports: [AuthModule, DatabaseModule, AuthModuleBetterAuth.forRoot({ auth })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
