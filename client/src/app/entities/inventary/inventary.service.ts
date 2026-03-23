import axios from 'axios';

import buildPaginationQueryOpts from '@/shared/sort/sorts';

import { type IInventary } from '@/shared/model/inventary.model';
import type { CrudTableService } from '@/components/crud/crud-table-interface';

const baseApiUrl = 'api/inventaries';

export default class InventaryService implements CrudTableService<IInventary> {
  public find(id: number | string): Promise<IInventary> {
    return new Promise<IInventary>((resolve, reject) => {
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

  public delete(id: number | string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      axios
        .delete(`${baseApiUrl}/${id}`)
        .then(() => {
          resolve();
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  public create(entity: IInventary): Promise<IInventary> {
    return new Promise<IInventary>((resolve, reject) => {
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

  public update(entity: IInventary): Promise<IInventary> {
    return new Promise<IInventary>((resolve, reject) => {
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

  public partialUpdate(entity: IInventary): Promise<IInventary> {
    return new Promise<IInventary>((resolve, reject) => {
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
