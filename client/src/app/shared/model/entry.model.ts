import { type IArea } from '@/shared/model/area.model';
import { type IProduct } from '@/shared/model/product.model';

export interface IEntry {
  id?: number;
  day?: number;
  count?: number;
  area?: IArea;
  product?: IProduct;
}

export class Entry implements IEntry {
  constructor(
    public id?: number,
    public day?: number,
    public count?: number,
    public area?: IArea,
    public product?: IProduct,
  ) {}
}
