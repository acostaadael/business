import type { CrudTableEntity } from '@/components/crud/crud-table-interface.ts';
import type { ICompany } from '@/shared/model/company.model.ts';

export const entity: CrudTableEntity<ICompany> = {
  deleteMessage: 'businessApp.company.delete.question',
  notFound: 'businessApp.company.home.notFound',
  columns: [
    {
      key: 'id',
      label: 'global.field.id',
      sortable: true,
    },
    {
      key: 'name',
      label: 'businessApp.company.name',
      sortable: true,
    },
    {
      key: 'active',
      label: 'businessApp.company.active',
      sortable: true,
      slot: true,
    },
  ],
  actions: [
    {
      type: 'Update',
      routeName: 'CompanyEdit',
      params: (item: ICompany) => ({ companyId: item.id }),
    },
    {
      type: 'Delete',
    },
  ],
};
