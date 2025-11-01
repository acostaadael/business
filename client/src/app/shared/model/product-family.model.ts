import { type IProductCategory } from '@/shared/model/product-category.model';

export interface IProductFamily {
  id?: number;
  name?: string;
  description?: string | null;
  productCategory?: IProductCategory | null;
}

export class ProductFamily implements IProductFamily {
  constructor(
    public id?: number,
    public name?: string,
    public description?: string | null,
    public productCategory?: IProductCategory | null,
  ) {}
}
