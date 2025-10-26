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
import { UmDTO } from '../../service/dto/um.dto';
import { UmService } from '../../service/um.service';
import { Page, PageRequest } from '../../domain/base/pagination.entity';
import { AuthGuard, RoleType, Roles, RolesGuard } from '../../security';
import { HeaderUtil } from '../../client/header-util';
import { Request } from '../../client/request';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';
import { Like } from 'typeorm';

@Controller('api/ums')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth()
@ApiTags('ums')
export class UmController {
  logger = new Logger('UmController');

  constructor(private readonly umService: UmService) {}

  @Get('/')
  @Roles(RoleType.USER)
  @ApiResponse({
    status: 200,
    description: 'List all records',
    type: UmDTO,
  })
  async getAll(@Req() req: Request): Promise<UmDTO[]> {
    const pageRequest: PageRequest = new PageRequest(req.query.page, req.query.size, req.query.sort ?? 'id,ASC');
    const options = req.query.globalSearch
      ? {
          skip: +pageRequest.page * pageRequest.size,
          take: +pageRequest.size,
          where: [{ name: Like(`%${req.query.globalSearch}%`) }, { description: Like(`%${req.query.globalSearch}%`) }],
          order: pageRequest.sort.asOrder(),
        }
      : {
          skip: +pageRequest.page * pageRequest.size,
          take: +pageRequest.size,
          order: pageRequest.sort.asOrder(),
        };
    console.log(options);

    const [results, count] = await this.umService.findAndCount(options);
    HeaderUtil.addPaginationHeaders(req.res, new Page(results, count, pageRequest));
    return results;
  }

  @Get('/:id')
  @Roles(RoleType.USER)
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: UmDTO,
  })
  async getOne(@Param('id') id: number): Promise<UmDTO> {
    return await this.umService.findById(id);
  }

  @PostMethod('/')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Create um' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
    type: UmDTO,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async post(@Req() req: Request, @Body() umDTO: UmDTO): Promise<UmDTO> {
    const created = await this.umService.save(umDTO, req.user?.login);
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Um', created.id);
    return created;
  }

  @Put('/')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Update um' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
    type: UmDTO,
  })
  async put(@Req() req: Request, @Body() umDTO: UmDTO): Promise<UmDTO> {
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Um', umDTO.id);
    return await this.umService.update(umDTO, req.user?.login);
  }

  @Put('/:id')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Update um with id' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
    type: UmDTO,
  })
  async putId(@Req() req: Request, @Body() umDTO: UmDTO): Promise<UmDTO> {
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Um', umDTO.id);
    return await this.umService.update(umDTO, req.user?.login);
  }

  @Delete('/:id')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Delete um' })
  @ApiResponse({
    status: 204,
    description: 'The record has been successfully deleted.',
  })
  async deleteById(@Req() req: Request, @Param('id') id: number): Promise<void> {
    HeaderUtil.addEntityDeletedHeaders(req.res, 'Um', id);
    return await this.umService.deleteById(id);
  }
}
