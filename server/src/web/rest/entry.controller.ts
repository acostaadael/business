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
import { EntryDTO } from '../../service/dto/entry.dto';
import { EntryService } from '../../service/entry.service';
import { Page, PageRequest } from '../../domain/base/pagination.entity';
import { AuthGuard, RoleType, Roles, RolesGuard } from '../../security';
import { HeaderUtil } from '../../client/header-util';
import { Request } from '../../client/request';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';
import { PeriodService } from '../../service/period.service';
import { EntryQueryDTO } from '../../service/dto/entry.query.dto';

@Controller('api/entries')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth()
@ApiTags('entries')
export class EntryController {
  logger = new Logger('EntryController');

  constructor(
    private readonly entryService: EntryService,
    private readonly periodService: PeriodService,
  ) {}

  @Get('/')
  @Roles(RoleType.USER)
  @ApiResponse({
    status: 200,
    description: 'List all records',
    type: EntryDTO,
  })
  async getAll(@Req() req: Request): Promise<EntryDTO[]> {
    const pageRequest: PageRequest = new PageRequest(req.query.page, req.query.size, req.query.sort ?? 'id,ASC');

    const openPeriod = await this.periodService.findOpen();

    const entryQuery = new EntryQueryDTO();
    entryQuery.periodId = openPeriod.id;
    entryQuery.pageRequest = pageRequest;
    entryQuery.globalFilter = req.query.globalSearch ? req.query.globalSearch.toString() : null;

    const [results, count] = await this.entryService.findAndCount(entryQuery);
    HeaderUtil.addPaginationHeaders(req.res, new Page(results, count, pageRequest));
    return results;
  }

  @Get('/:id')
  @Roles(RoleType.USER)
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: EntryDTO,
  })
  async getOne(@Param('id') id: number): Promise<EntryDTO> {
    return await this.entryService.findById(id);
  }

  @PostMethod('/')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Create entry' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
    type: EntryDTO,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async post(@Req() req: Request, @Body() entryDTO: EntryDTO): Promise<EntryDTO> {
    const created = await this.entryService.save(entryDTO, req.user?.login);
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Entry', created.id);
    return created;
  }

  @Put('/')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Update entry' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
    type: EntryDTO,
  })
  async put(@Req() req: Request, @Body() entryDTO: EntryDTO): Promise<EntryDTO> {
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Entry', entryDTO.id);
    return await this.entryService.update(entryDTO, req.user?.login);
  }

  @Put('/:id')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Update entry with id' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
    type: EntryDTO,
  })
  async putId(@Req() req: Request, @Body() entryDTO: EntryDTO): Promise<EntryDTO> {
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Entry', entryDTO.id);
    return await this.entryService.update(entryDTO, req.user?.login);
  }

  @Delete('/:id')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Delete entry' })
  @ApiResponse({
    status: 204,
    description: 'The record has been successfully deleted.',
  })
  async deleteById(@Req() req: Request, @Param('id') id: number): Promise<void> {
    HeaderUtil.addEntityDeletedHeaders(req.res, 'Entry', id);
    return await this.entryService.deleteById(id);
  }
}
