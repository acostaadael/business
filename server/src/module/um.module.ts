import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Um } from '../domain/um.entity';
import { UmController } from '../web/rest/um.controller';
import { UmService } from '../service/um.service';

@Module({
  imports: [TypeOrmModule.forFeature([Um])],
  controllers: [UmController],
  providers: [UmService],
  exports: [UmService],
})
export class UmModule {}
