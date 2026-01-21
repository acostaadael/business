// reports/repositories/report.repository.ts
import { Repository, DataSource } from 'typeorm';
import { Report } from '../entities/report.entity';
import { Injectable } from '@nestjs/common';
import { ReportFilterDto } from '../dto/report-filter.dto';

@Injectable()
export class ReportRepository extends Repository<Report> {
  constructor(private dataSource: DataSource) {
    super(Report, dataSource.createEntityManager());
  }

  async findWithFilters(filterDto: ReportFilterDto): Promise<[Report[], number]> {
    const query = this.createQueryBuilder('report');

    // Apply filters
    if (filterDto.status) {
      query.andWhere('report.status = :status', { status: filterDto.status });
    }

    if (filterDto.type) {
      query.andWhere('report.type = :type', { type: filterDto.type });
    }

    if (filterDto.generatedBy) {
      query.andWhere('report.generatedBy = :generatedBy', { generatedBy: filterDto.generatedBy });
    }

    if (filterDto.fromDate) {
      query.andWhere('report.createdAt >= :fromDate', { fromDate: new Date(filterDto.fromDate) });
    }

    if (filterDto.toDate) {
      query.andWhere('report.createdAt <= :toDate', { toDate: new Date(filterDto.toDate) });
    }

    if (filterDto.search && filterDto.search.length > 0) {
      filterDto.search.forEach((searchTerm, index) => {
        query.orWhere(`report.name ILIKE :searchTerm${index}`, { [`searchTerm${index}`]: `%${searchTerm}%` });
      });
    }

    // Apply sorting
    query.orderBy(`report.${filterDto.sortBy}`, filterDto.sortOrder);

    // Apply pagination
    query.skip((filterDto.page - 1) * filterDto.limit);
    query.take(filterDto.limit);

    return await query.getManyAndCount();
  }

  async findExpiredReports(): Promise<Report[]> {
    return await this.createQueryBuilder('report')
      .where('report.expiresAt < :now', { now: new Date() })
      .andWhere('report.status != :status', { status: 'expired' })
      .getMany();
  }
}
