import { ClassSerializerInterceptor, Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard, RoleType, Roles, RolesGuard } from '../../security';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';
import { ProductHierarchyService } from '../../service/product-hierarchy.service';
import { IdNameDTO } from '../../service/dto/id-name.dto';

@Controller('api/product-hierarchy')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth()
@ApiTags('product-hierarchy')
export class ProductHierarchyController {
  constructor(private readonly service: ProductHierarchyService) {}

  @Get('/categories')
  @Roles(RoleType.USER)
  @ApiResponse({ status: 200, type: IdNameDTO, isArray: true })
  async categories(): Promise<IdNameDTO[]> {
    return await this.service.listCategories();
  }

  @Get('/families')
  @Roles(RoleType.USER)
  @ApiQuery({ name: 'productCategoryId', required: false, type: Number })
  @ApiResponse({ status: 200, type: IdNameDTO, isArray: true })
  async families(@Query('productCategoryId') productCategoryId?: string): Promise<IdNameDTO[]> {
    return await this.service.listFamilies({ productCategoryId: productCategoryId ? Number(productCategoryId) : undefined });
  }

  @Get('/lines')
  @Roles(RoleType.USER)
  @ApiQuery({ name: 'productFamilyId', required: false, type: Number })
  @ApiResponse({ status: 200, type: IdNameDTO, isArray: true })
  async lines(@Query('productFamilyId') productFamilyId?: string): Promise<IdNameDTO[]> {
    return await this.service.listLines({ productFamilyId: productFamilyId ? Number(productFamilyId) : undefined });
  }
}
