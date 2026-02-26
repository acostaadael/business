import { type IProduct } from '@/shared/model/product.model';
import type { IArea } from './area.model';

export interface IInventary {
  id?: number;
  count?: number;
  product?: IProduct;
  area?: IArea;
  unit_price?: number;
  total_price?: number;
}

export class Inventary implements IInventary {
  constructor(
    public id?: number,
    public count?: number,
    public area?: IArea,
    public unit_price?: number,
    public total_price?: number,
  ) {}
}
