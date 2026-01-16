import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '../domain/company.entity';
import { CompanyController } from '../web/rest/company.controller';
import { CompanyService } from '../service/company.service';

@Module({
  imports: [TypeOrmModule.forFeature([Company])],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
