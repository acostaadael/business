import type { CrudTableEntity } from '@/components/crud/crud-table-interface';
import type { IInventary } from '@/shared/model/inventary.model';

export const entity: CrudTableEntity<IInventary> = {
  notFound: 'businessApp.inventary.home.notFound',
  columns: [
    {
      key: 'id',
      label: 'global.field.id',
      sortable: true,
    },
    {
      key: 'product',
      label: 'businessApp.inventary.product',
      sortable: false,
      render: (row: IInventary) => {
        const name = row.product?.name ?? '';
        return `${name}`;
      },
    },
    {
      key: 'count',
      label: 'businessApp.inventary.count',
      render: (row: IInventary) => {
        const count = row.count ?? '';
        const um = row.product?.um?.name ?? '';
        return `${count} ${um}`;
      },
    },
    {
      key: 'area',
      label: 'businessApp.inventary.area',
      render: (row: IInventary) => row.area?.name ?? '',
    },
  ],
  actions: [],
};
