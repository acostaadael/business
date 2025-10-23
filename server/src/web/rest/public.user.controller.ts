import { ClassSerializerInterceptor, Controller, Get, Logger, Req, UseInterceptors } from '@nestjs/common';
import { Request } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';
import { Page, PageRequest } from '../../domain/base/pagination.entity';
import { Authority } from '../../domain/authority.entity';
import { UserDTO } from '../../service/dto/user.dto';
import { HeaderUtil } from '../../client/header-util';
import { AuthService } from '../../service/auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('api')
@UseInterceptors(LoggingInterceptor, ClassSerializerInterceptor)
@ApiTags('public-user-controller')
export class PublicUserController {
  logger = new Logger('PublicUserController');

  constructor(
    private readonly authService: AuthService,
    @InjectRepository(Authority) private authorityRepository: Repository<Authority>,
  ) {}

  @Get('/users')
  @ApiOperation({ summary: 'Get the list of users' })
  @ApiResponse({
    status: 200,
    description: 'List all users records',
    type: UserDTO,
  })
  async getAllPublicUsers(@Req() req: Request): Promise<UserDTO[]> {
    const pageRequest: PageRequest = new PageRequest(req.query.page, req.query.size, req.query.sort ?? 'id,ASC');
    const [results, count] = await this.authService.getAllUsers({
      skip: +pageRequest.page * pageRequest.size,
      take: +pageRequest.size,
      order: pageRequest.sort.asOrder(),
    });
    HeaderUtil.addPaginationHeaders(req.res, new Page(results, count, pageRequest));
    return results;
  }

  @Get('/authorities')
  @ApiOperation({ summary: 'Get the list of user roles' })
  @ApiResponse({
    status: 200,
    description: 'List all user roles',
    type: String,
  })
  async getAuthorities(@Req() req: Request): Promise<String[]> {
    const items: string[] = [];
    const authorities = await this.authorityRepository.find();
    authorities.forEach(authority => items.push(authority.name));

    return items;
  }
}
