import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entry } from '../domain/entry.entity';
import { EntryController } from '../web/rest/entry.controller';
import { EntryService } from '../service/entry.service';
import { PeriodModule } from './period.module';
import { InventaryModule } from './inventary.module';
import { EntryRepository } from '../repository/entry.repository';
import { CompanyModule } from './company.module';

@Module({
  imports: [TypeOrmModule.forFeature([Entry, EntryRepository]), PeriodModule, InventaryModule, CompanyModule],
  controllers: [EntryController],
  providers: [EntryService, EntryRepository],
  exports: [EntryService, EntryRepository],
})
export class EntryModule {}
