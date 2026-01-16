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
import { CompanyDTO } from '../../service/dto/company.dto';
import { CompanyService } from '../../service/company.service';
import { Page, PageRequest } from '../../domain/base/pagination.entity';
import { AuthGuard, RoleType, Roles, RolesGuard } from '../../security';
import { HeaderUtil } from '../../client/header-util';
import { Request } from '../../client/request';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';

@Controller('api/companies')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth()
@ApiTags('companies')
export class CompanyController {
  logger = new Logger('CompanyController');

  constructor(private readonly companyService: CompanyService) {}

  @Get('/')
  @Roles(RoleType.USER)
  @ApiResponse({
    status: 200,
    description: 'List all records',
    type: CompanyDTO,
  })
  async getAll(@Req() req: Request): Promise<CompanyDTO[]> {
    const pageRequest: PageRequest = new PageRequest(req.query.page, req.query.size, req.query.sort ?? 'id,ASC');
    const [results, count] = await this.companyService.findAndCount({
      skip: +pageRequest.page * pageRequest.size,
      take: +pageRequest.size,
      order: pageRequest.sort.asOrder(),
    });
    HeaderUtil.addPaginationHeaders(req.res, new Page(results, count, pageRequest));
    return results;
  }

  @Get('/:id')
  @Roles(RoleType.USER)
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: CompanyDTO,
  })
  async getOne(@Param('id') id: number): Promise<CompanyDTO> {
    return await this.companyService.findById(id);
  }

  @PostMethod('/')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Create company' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
    type: CompanyDTO,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async post(@Req() req: Request, @Body() companyDTO: CompanyDTO): Promise<CompanyDTO> {
    const created = await this.companyService.save(companyDTO, req.user?.login);
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Company', created.id);
    return created;
  }

  @Put('/')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Update company' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
    type: CompanyDTO,
  })
  async put(@Req() req: Request, @Body() companyDTO: CompanyDTO): Promise<CompanyDTO> {
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Company', companyDTO.id);
    return await this.companyService.update(companyDTO, req.user?.login);
  }

  @Put('/:id')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Update company with id' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
    type: CompanyDTO,
  })
  async putId(@Req() req: Request, @Body() companyDTO: CompanyDTO): Promise<CompanyDTO> {
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Company', companyDTO.id);
    return await this.companyService.update(companyDTO, req.user?.login);
  }

  @Delete('/:id')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Delete company' })
  @ApiResponse({
    status: 204,
    description: 'The record has been successfully deleted.',
  })
  async deleteById(@Req() req: Request, @Param('id') id: number): Promise<void> {
    HeaderUtil.addEntityDeletedHeaders(req.res, 'Company', id);
    return await this.companyService.deleteById(id);
  }
}
