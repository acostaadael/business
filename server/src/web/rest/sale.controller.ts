import { Body, ClassSerializerInterceptor, Controller, Logger, Post as PostMethod, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthGuard, RoleType, Roles, RolesGuard } from '../../security';
import { Request } from '../../client/request';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';

import { SaleService } from '../../service/sale.service';
import { SaleRegisterDTO } from '../../service/dto/sale-register.dto';
import { SaleRegisterResultDTO } from '../../service/dto/sale-register-result.dto';

@Controller('api/sales')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth()
@ApiTags('sales')
export class SaleController {
  logger = new Logger('SaleController');

  constructor(private readonly saleService: SaleService) {}

  @PostMethod('/register')
  @Roles(RoleType.USER)
  @ApiOperation({ summary: 'Registrar venta: crea product-shipments, sale y enlaces' })
  @ApiResponse({ status: 201, description: 'Venta registrada', type: SaleRegisterResultDTO })
  async register(@Req() req: Request, @Body() payload: SaleRegisterDTO): Promise<SaleRegisterResultDTO> {
    return await this.saleService.register(payload, req.user?.login);
  }
}
