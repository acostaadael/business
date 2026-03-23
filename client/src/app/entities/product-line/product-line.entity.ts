import type { CrudTableEntity } from '@/components/crud/crud-table-interface.ts';
import type { IProductLine } from '@/shared/model/product-line.model.ts';

export const entity: CrudTableEntity<IProductLine> = {
  deleteMessage: 'businessApp.productLine.delete.question',
  notFound: 'businessApp.productLine.home.notFound',
  deleteItemLabel: (item: IProductLine) => item?.name ?? '',
  columns: [
    {
      key: 'id',
      label: 'global.field.id',
      sortable: true,
    },
    {
      key: 'name',
      label: 'businessApp.productLine.name',
      sortable: true,
    },
    {
      key: 'description',
      label: 'businessApp.productLine.description',
      sortable: true,
    },
    {
      key: 'productFamily',
      label: 'businessApp.productLine.productFamily',
      sortable: true,
      render: (item: IProductLine) => item.productFamily?.name ?? '',
    },
  ],
  actions: [
    {
      type: 'View',
      routeName: 'ProductLineView',
      params: (item: IProductLine) => ({ productLineId: item.id }),
    },
    {
      type: 'Update',
      routeName: 'ProductLineEdit',
      params: (item: IProductLine) => ({ productLineId: item.id }),
    },
    {
      type: 'Delete',
    },
  ],
};
