import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Area } from '../domain/area.entity';
import { AreaController } from '../web/rest/area.controller';
import { AreaService } from '../service/area.service';

@Module({
  imports: [TypeOrmModule.forFeature([Area])],
  controllers: [AreaController],
  providers: [AreaService],
  exports: [AreaService],
})
export class AreaModule {}
