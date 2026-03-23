import axios from 'axios';

import buildPaginationQueryOpts from '@/shared/sort/sorts';

import { type ICompany } from '@/shared/model/company.model';
import type { CrudTableService } from '@/components/crud/crud-table-interface';

const baseApiUrl = 'api/companies';

export default class CompanyService implements CrudTableService<ICompany> {
  public find(id: number | string): Promise<ICompany> {
    return new Promise<ICompany>((resolve, reject) => {
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
          // CrudTable suele trabajar con el objeto response completo (headers + data)
          // pero si tu implementación espera solo data, cambia este resolve.
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

  public create(entity: ICompany): Promise<ICompany> {
    return new Promise<ICompany>((resolve, reject) => {
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

  public createMany?(entities: ICompany[]): Promise<ICompany[]> {
    // Si tu backend no soporta batch, lo dejamos opcional.
    // Si existe endpoint, por ejemplo POST api/companies/batch, implementa aquí.
    return Promise.all(entities.map(e => this.create(e)));
  }

  public update(entity: ICompany): Promise<ICompany> {
    return new Promise<ICompany>((resolve, reject) => {
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

  public partialUpdate(entity: ICompany): Promise<ICompany> {
    return new Promise<ICompany>((resolve, reject) => {
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
