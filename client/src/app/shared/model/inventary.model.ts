import { type IProduct } from '@/shared/model/product.model';

export interface IInventary {
  id?: number;
  count?: number;
  product?: IProduct;
}

export class Inventary implements IInventary {
  constructor(
    public id?: number,
    public count?: number,
    public product?: IProduct,
  ) {}
}
