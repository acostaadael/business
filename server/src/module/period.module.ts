import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Period } from '../domain/period.entity';
import { PeriodController } from '../web/rest/period.controller';
import { PeriodService } from '../service/period.service';

@Module({
  imports: [TypeOrmModule.forFeature([Period])],
  controllers: [PeriodController],
  providers: [PeriodService],
  exports: [PeriodService],
})
export class PeriodModule {}
