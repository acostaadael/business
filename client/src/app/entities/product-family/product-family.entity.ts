import type { CrudTableEntity } from '@/components/crud/crud-table-interface.ts';
import type { IProductFamily } from '@/shared/model/product-family.model.ts';

export const entity: CrudTableEntity<IProductFamily> = {
  deleteMessage: 'businessApp.productFamily.delete.question',
  notFound: 'businessApp.productFamily.home.notFound',
  deleteItemLabel: (item: IProductFamily) => item?.name ?? '',
  columns: [
    {
      key: 'id',
      label: 'global.field.id',
      sortable: true,
    },
    {
      key: 'name',
      label: 'businessApp.productFamily.name',
      sortable: true,
    },
    {
      key: 'description',
      label: 'businessApp.productFamily.description',
      sortable: true,
    },
    {
      key: 'productCategory',
      label: 'businessApp.productFamily.productCategory',
      sortable: true,
      render: (item: IProductFamily) => item.productCategory?.name ?? '',
    },
  ],
  actions: [
    {
      type: 'View',
      routeName: 'ProductFamilyView',
      params: (item: IProductFamily) => ({ productFamilyId: item.id }),
    },
    {
      type: 'Update',
      routeName: 'ProductFamilyEdit',
      params: (item: IProductFamily) => ({ productFamilyId: item.id }),
    },
    {
      type: 'Delete',
    },
  ],
};
