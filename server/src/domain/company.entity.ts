/* eslint-disable @typescript-eslint/no-unused-vars */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base/base.entity';

/**
 * A Company.
 */
@Entity('company')
export class Company extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'name' })
  name: string;

  @Column({ type: 'boolean', name: 'active', nullable: true })
  active?: boolean;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
