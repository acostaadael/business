import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventary } from '../domain/inventary.entity';
import { InventaryController } from '../web/rest/inventary.controller';
import { InventaryService } from '../service/inventary.service';
import { CompanyModule } from './company.module';

@Module({
  imports: [TypeOrmModule.forFeature([Inventary]), CompanyModule],
  controllers: [InventaryController],
  providers: [InventaryService],
  exports: [InventaryService],
})
export class InventaryModule {}
