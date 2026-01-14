import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entry } from '../domain/entry.entity';
import { EntryController } from '../web/rest/entry.controller';
import { EntryService } from '../service/entry.service';
import { PeriodModule } from './period.module';
import { InventaryModule } from './inventary.module';

@Module({
  imports: [TypeOrmModule.forFeature([Entry]), PeriodModule, InventaryModule],
  controllers: [EntryController],
  providers: [EntryService],
  exports: [EntryService],
})
export class EntryModule {}
