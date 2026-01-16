/* eslint-disable @typescript-eslint/no-unused-vars */
import { IsNotEmpty } from 'class-validator';
import { PageRequest } from '../../domain/base/pagination.entity';

/**
 * A InventaryQueryDTO object.
 */
export class InventaryQueryDTO {
  @IsNotEmpty()
  companyId: number;

  globalFilter?: string;

  @IsNotEmpty()
  pageRequest: PageRequest;
  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
