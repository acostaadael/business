import type { CrudTableEntity } from '@/components/crud/crud-table-interface.ts';
import type { IProduct } from '@/shared/model/product.model.ts';

export const entity: CrudTableEntity<IProduct> = {
  deleteMessage: 'businessApp.product.delete.question',
  columns: [
    {
      key: 'code',
      label: 'businessApp.product.code',
      sortable: true,
    },
    {
      key: 'name',
      label: 'businessApp.product.name',
    },
    {
      key: 'costPrice',
      label: 'businessApp.product.costPrice',
      render: (item: IProduct) => `${item.costPrice} $`,
    },
    {
      key: 'sellingPrice',
      label: 'businessApp.product.sellingPrice',
      render: (item: IProduct) => `${item.sellingPrice} $`,
    },
    {
      key: 'um',
      label: 'businessApp.product.um',
      render: (item: IProduct) => item.um?.name ?? '',
    },
    {
      key: 'productLine',
      label: 'businessApp.product.productLine',
      render: (item: IProduct) => item.productLine?.name ?? '',
    },
  ],
  actions: [
    {
      type: 'View',
      routeName: 'ProductView',
      params: (item: IProduct) => ({ productId: item.id }),
    },
    {
      type: 'Update',
      routeName: 'ProductEdit',
      params: (item: IProduct) => ({ productId: item.id }),
    },
    {
      type: 'Delete',
    },
  ],
};
