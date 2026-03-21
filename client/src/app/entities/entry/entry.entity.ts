import type { CrudTableEntity } from '@/components/crud/crud-table-interface.ts';
import type { IEntry } from '@/shared/model/entry.model.ts';

export const entity: CrudTableEntity<IEntry> = {
  deleteMessage: 'businessApp.entry.delete.question',
  notFound: 'businessApp.entry.home.notFound',
  columns: [
    {
      key: 'product',
      label: 'businessApp.entry.product',
      render: (item: IEntry) => item.product?.name ?? '',
    },
    {
      key: 'count',
      label: 'businessApp.entry.count',
      render: (item: IEntry) => `${item.count} ${item.product?.um?.name}`,
    },
    {
      key: 'day',
      label: 'businessApp.entry.day',
    },
    {
      key: 'area',
      label: 'businessApp.entry.area',
      render: (item: IEntry) => item.area?.name ?? '',
    },
  ],
};
