import type { CrudTableEntity } from '@/components/crud/crud-table-interface.ts';
import type { IProductShipment } from '@/shared/model/product-shipment.model.ts';
import type { IEntry } from '@/shared/model/entry.model.ts';

export const entity: CrudTableEntity<IProductShipment> = {
  notFound: 'businessApp.productShipment.home.notFound',
  columns: [
    {
      key: 'product',
      label: 'businessApp.productShipment.product',
      sortable: true,
      render: (item: IProductShipment) => item.product?.name ?? '',
    },
    {
      key: 'count',
      label: 'businessApp.productShipment.count',
      render: (item: IProductShipment) => (item.count && item.product?.um?.name ? `${item.count} ${item.product.um.name}` : ''),
    },
    {
      key: 'day',
      label: 'businessApp.productShipment.day',
      sortable: true,
    },
    {
      key: 'type',
      label: 'businessApp.productShipment.type',
      sortable: true,
      slot: true,
    },
    {
      key: 'area',
      label: 'businessApp.productShipment.area',
      render: (item: IProductShipment) => item.area?.name ?? '',
    },
  ],
};
