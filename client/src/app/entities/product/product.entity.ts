import type { CrudTableEntity } from '@/components/crud/crud-table-interface.ts';
import type { IProduct } from '@/shared/model/product.model.ts';

export const entity: CrudTableEntity<IProduct> = {
  title: 'businessApp.product.home.title',
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
      sortable: true,
    },
    {
      key: 'costPrice',
      label: 'businessApp.product.costPrice',
      sortable: true,
    },
    {
      key: 'sellingPrice',
      label: 'businessApp.product.sellingPrice',
      sortable: true,
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
