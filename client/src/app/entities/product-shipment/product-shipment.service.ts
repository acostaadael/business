import axios from 'axios';

import buildPaginationQueryOpts from '@/shared/sort/sorts';

import { type IProductShipment } from '@/shared/model/product-shipment.model';
import type { CrudTableService } from '@/components/crud/crud-table-interface.ts';

const baseApiUrl = 'api/product-shipments';

export default class ProductShipmentService implements CrudTableService<IProductShipment> {
  public find(id: number): Promise<IProductShipment> {
    return new Promise<IProductShipment>((resolve, reject) => {
      axios
        .get(`${baseApiUrl}/${id}`)
        .then(res => {
          resolve(res.data);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  public retrieve(paginationQuery?: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      axios
        .get(`${baseApiUrl}?${buildPaginationQueryOpts(paginationQuery)}`)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  public delete(id: number): Promise<void> {
    return new Promise<any>((resolve, reject) => {
      axios
        .delete(`${baseApiUrl}/${id}`)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  public create(entity: IProductShipment): Promise<IProductShipment> {
    return new Promise<IProductShipment>((resolve, reject) => {
      axios
        .post(`${baseApiUrl}`, entity)
        .then(res => {
          resolve(res.data);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  public createMany(entities: IProductShipment[]): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      axios
        .post(`${baseApiUrl}/batch`, entities)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  public update(entity: IProductShipment): Promise<IProductShipment> {
    return new Promise<IProductShipment>((resolve, reject) => {
      axios
        .put(`${baseApiUrl}/${entity.id}`, entity)
        .then(res => {
          resolve(res.data);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  public partialUpdate(entity: IProductShipment): Promise<IProductShipment> {
    return new Promise<IProductShipment>((resolve, reject) => {
      axios
        .patch(`${baseApiUrl}/${entity.id}`, entity)
        .then(res => {
          resolve(res.data);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
}
