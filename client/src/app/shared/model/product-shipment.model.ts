import { type IProduct } from '@/shared/model/product.model';
import { type ICompany } from '@/shared/model/company.model';

import { type ExitType } from '@/shared/model/enumerations/exit-type.model';
import type { IArea } from './area.model';
import type { IPeriod } from '@/shared/model/period.model.ts';
export interface IProductShipment {
  id?: number;
  day?: number;
  count?: number;
  type?: keyof typeof ExitType;
  product?: IProduct;
  company?: ICompany;
  period?: IPeriod | null;
  area?: IArea;
}

export class ProductShipment implements IProductShipment {
  constructor(
    public id?: number,
    public day?: number,
    public count?: number,
    public type?: keyof typeof ExitType,
    public product?: IProduct,
    public company?: ICompany,
    public period?: IPeriod | null,
    public area?: IArea,
  ) {
    const date = new Date();
    this.day = date.getDate();
  }
}
