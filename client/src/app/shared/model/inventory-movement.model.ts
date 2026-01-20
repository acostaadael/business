import { type IPeriod } from '@/shared/model/period.model';
import { type ICompany } from '@/shared/model/company.model';
import { type IProduct } from '@/shared/model/product.model';
import { type IArea } from '@/shared/model/area.model';

export interface IInventoryMovement {
  id?: number;
  day?: number;
  count?: number;
  period?: IPeriod;
  company?: ICompany;
  product?: IProduct;
  source?: IArea;
  target?: IArea;
}

export class InventoryMovement implements IInventoryMovement {
  constructor(
    public id?: number,
    public day?: number,
    public count?: number,
    public period?: IPeriod,
    public company?: ICompany,
    public product?: IProduct,
    public source?: IArea,
    public target?: IArea,
  ) {
    const date = new Date();
    this.day = date.getDate();
  }
}
