import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Period } from '../domain/period.entity';
import { PeriodController } from '../web/rest/period.controller';
import { PeriodService } from '../service/period.service';
import { InitInventaryPeriodModule } from './init-inventary-period.module';

@Module({
  imports: [TypeOrmModule.forFeature([Period]), InitInventaryPeriodModule],
  controllers: [PeriodController],
  providers: [PeriodService],
  exports: [PeriodService],
})
export class PeriodModule {}
