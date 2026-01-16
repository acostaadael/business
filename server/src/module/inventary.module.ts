import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventary } from '../domain/inventary.entity';
import { InventaryController } from '../web/rest/inventary.controller';
import { InventaryService } from '../service/inventary.service';
import { CompanyModule } from './company.module';
import { InventaryRepository } from '../repository/inventary.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Inventary, InventaryRepository]), CompanyModule],
  controllers: [InventaryController],
  providers: [InventaryService, InventaryRepository],
  exports: [InventaryService, InventaryRepository],
})
export class InventaryModule {}
