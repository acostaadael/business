import { type IProductFamily } from '@/shared/model/product-family.model';

export interface IProductLine {
  id?: number;
  name?: string;
  description?: string | null;
  productFamily?: IProductFamily | null;
}

export class ProductLine implements IProductLine {
  constructor(
    public id?: number,
    public name?: string,
    public description?: string | null,
    public productFamily?: IProductFamily | null,
  ) {}
}
