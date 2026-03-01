import { type IUm } from '@/shared/model/um.model';
import { type IProductLine } from '@/shared/model/product-line.model';

export interface IProduct {
  id?: number;
  code?: string;
  name?: string;
  description?: string | null;
  costPrice?: number;
  sellingPrice?: number;
  hasCode?: boolean | null;
  um?: IUm;
  productLine?: IProductLine;
}

export class Product implements IProduct {
  constructor(
    public id?: number,
    public code?: string,
    public name?: string,
    public description?: string | null,
    public costPrice?: number,
    public sellingPrice?: number,
    public hasCode?: boolean | null,
    public um?: IUm,
    public productLine?: IProductLine,
  ) {
    this.hasCode = true;
  }
}
