import type { CrudTableEntity } from '@/components/crud/crud-table-interface.ts';
import type { IUm } from '@/shared/model/um.model.ts';

export const entity: CrudTableEntity<IUm> = {
  deleteMessage: 'businessApp.um.delete.question',
  notFound: 'businessApp.um.home.notFound',
  deleteItemLabel: (item: IUm) => item?.name ?? '',
  columns: [
    {
      key: 'id',
      label: 'global.field.id',
      sortable: true,
    },
    {
      key: 'name',
      label: 'businessApp.um.name',
      sortable: true,
    },
    {
      key: 'description',
      label: 'businessApp.um.description',
      sortable: true,
    },
  ],
  actions: [
    {
      type: 'Update',
      routeName: 'UmEdit',
      params: (item: IUm) => ({ umId: item.id }),
    },
    {
      type: 'Delete',
    },
  ],
};
