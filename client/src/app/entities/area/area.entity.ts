import type { CrudTableEntity } from '@/components/crud/crud-table-interface.ts';
import type { IArea } from '@/shared/model/area.model';

export const entity: CrudTableEntity<IArea> = {
  deleteMessage: 'businessApp.area.delete.question',
  columns: [
    {
      key: 'id',
      label: 'global.field.id',
      sortable: true,
    },
    {
      key: 'name',
      label: 'businessApp.area.name',
      sortable: true,
    },
    {
      key: 'description',
      label: 'businessApp.area.description',
    },
    {
      key: 'type',
      label: 'businessApp.area.type',
      render: (item: IArea) => (item.type as any) ?? '',
    },
  ],
  actions: [
    {
      type: 'Update',
      routeName: 'AreaEdit',
      params: (item: IArea) => ({ areaId: item.id }),
    },
    {
      type: 'Delete',
    },
  ],
};
