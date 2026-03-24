import axios from 'axios';

import type { IPeriod } from '@/shared/model/period.model';
import type { ICompany } from '@/shared/model/company.model';
import type { IArea } from '@/shared/model/area.model';
import type { IProduct } from '@/shared/model/product.model';
import { ExitType } from '@/shared/model/enumerations/exit-type.model';
import { SaleType } from '@/shared/model/enumerations/sale-type.model';

export interface ISaleRegisterShipment {
  day: number;
  count: number;
  type: ExitType; // forzado a VENTA en server, pero lo enviamos igual
  product?: IProduct;
  area?: IArea;
  period?: IPeriod;
  company?: ICompany;
}

export interface ISaleRegisterSale {
  day: number;
  type: SaleType;
  transferNumber?: string;
  area?: IArea;
  period?: IPeriod;
  company?: ICompany;
}

export interface ISaleRegisterDTO {
  sale: ISaleRegisterSale;
  shipments: ISaleRegisterShipment[];
}

export default class SaleService {
  private baseApiUrl = 'api/sales';

  register(payload: ISaleRegisterDTO) {
    return axios.post(`${this.baseApiUrl}/register`, payload);
  }
}
