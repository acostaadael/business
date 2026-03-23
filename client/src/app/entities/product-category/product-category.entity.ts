import type { CrudTableEntity } from '@/components/crud/crud-table-interface.ts';
import type { IProductCategory } from '@/shared/model/product-category.model.ts';

export const entity: CrudTableEntity<IProductCategory> = {
  deleteMessage: 'businessApp.productCategory.delete.question',
  notFound: 'businessApp.productCategory.home.notFound',
  deleteItemLabel: (item: IProductCategory) => item?.name ?? '',
  columns: [
    {
      key: 'id',
      label: 'global.field.id',
      sortable: true,
    },
    {
      key: 'name',
      label: 'businessApp.productCategory.name',
      sortable: true,
    },
    {
      key: 'description',
      label: 'businessApp.productCategory.description',
      sortable: true,
    },
  ],
  actions: [
    {
      type: 'View',
      routeName: 'ProductCategoryView',
      params: (item: IProductCategory) => ({ productCategoryId: item.id }),
    },
    {
      type: 'Update',
      routeName: 'ProductCategoryEdit',
      params: (item: IProductCategory) => ({ productCategoryId: item.id }),
    },
    {
      type: 'Delete',
    },
  ],
};
