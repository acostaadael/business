import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post as PostMethod,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PeriodDTO } from '../../service/dto/period.dto';
import { PeriodService } from '../../service/period.service';
import { Page, PageRequest } from '../../domain/base/pagination.entity';
import { AuthGuard, RoleType, Roles, RolesGuard } from '../../security';
import { HeaderUtil } from '../../client/header-util';
import { Request } from '../../client/request';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';

@Controller('api/periods')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth()
@ApiTags('periods')
export class PeriodController {
  logger = new Logger('PeriodController');

  constructor(private readonly periodService: PeriodService) {}

  @Get('/')
  @Roles(RoleType.ADMIN)
  @ApiResponse({
    status: 200,
    description: 'List all records',
    type: PeriodDTO,
  })
  async getAll(@Req() req: Request): Promise<PeriodDTO[]> {
    const pageRequest: PageRequest = new PageRequest(req.query.page, req.query.size, req.query.sort ?? 'id,ASC');
    const [results, count] = await this.periodService.findAndCount({
      skip: +pageRequest.page * pageRequest.size,
      take: +pageRequest.size,
      order: pageRequest.sort.asOrder(),
    });
    HeaderUtil.addPaginationHeaders(req.res, new Page(results, count, pageRequest));
    return results;
  }

  @Get('/any-open')
  @Roles(RoleType.USER)
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: PeriodDTO,
  })
  async getAnyOpen(): Promise<PeriodDTO> {
    return await this.periodService.findOpen();
  }

  @Get('/last-closed')
  @Roles(RoleType.USER)
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: PeriodDTO,
  })
  async getLastClosed(): Promise<PeriodDTO> {
    return await this.periodService.findLastClosed();
  }

  @PostMethod('/')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Create period' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
    type: PeriodDTO,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async post(@Req() req: Request, @Body() periodDTO: PeriodDTO): Promise<PeriodDTO> {
    const created = await this.periodService.save(periodDTO, req.user?.login);
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Period', created.id);
    return created;
  }

  @Put('/')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Update period' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
    type: PeriodDTO,
  })
  async put(@Req() req: Request, @Body() periodDTO: PeriodDTO): Promise<PeriodDTO> {
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Period', periodDTO.id);
    return await this.periodService.update(periodDTO, req.user?.login);
  }

  @Put('/:id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Update period with id' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
    type: PeriodDTO,
  })
  async putId(@Req() req: Request, @Body() periodDTO: PeriodDTO): Promise<PeriodDTO> {
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Period', periodDTO.id);
    return await this.periodService.update(periodDTO, req.user?.login);
  }

  @Delete('/:id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Delete period' })
  @ApiResponse({
    status: 204,
    description: 'The record has been successfully deleted.',
  })
  async deleteById(@Req() req: Request, @Param('id') id: number): Promise<void> {
    HeaderUtil.addEntityDeletedHeaders(req.res, 'Period', id);
    return await this.periodService.deleteById(id);
  }
}
