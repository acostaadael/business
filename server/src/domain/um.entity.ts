/* eslint-disable @typescript-eslint/no-unused-vars */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base/base.entity';

/**
 * A Um.
 */
@Entity('um')
export class Um extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'description', nullable: true })
  description?: string;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
