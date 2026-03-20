import axios from 'axios';

import { type IArea } from '@/shared/model/area.model';
import type { CrudTableService } from '@/components/crud/crud-table-interface.ts';
import buildPaginationQueryOpts from '@/shared/sort/sorts.ts';

const baseApiUrl = 'api/areas';

export default class AreaService implements CrudTableService<IArea> {
  public find(id: number): Promise<IArea> {
    return new Promise<IArea>((resolve, reject) => {
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

  /**
   * Recupera áreas.
   * - Si se pasa `{ type: 'X' }` o `type` como string, filtra por tipo.
   * - Si no, recupera todas.
   */
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

  public create(entity: IArea): Promise<IArea> {
    return new Promise<IArea>((resolve, reject) => {
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

  public update(entity: IArea): Promise<IArea> {
    return new Promise<IArea>((resolve, reject) => {
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

  public partialUpdate(entity: IArea): Promise<IArea> {
    return new Promise<IArea>((resolve, reject) => {
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
