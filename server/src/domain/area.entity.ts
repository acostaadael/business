/* eslint-disable @typescript-eslint/no-unused-vars */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base/base.entity';
import { AreaType } from './enumeration/area-type';

/**
 * A Area.
 */
@Entity('area')
export class Area extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'description', nullable: true })
  description?: string;

  @Column({ type: 'varchar', name: 'type', enum: AreaType })
  type: AreaType;
  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
