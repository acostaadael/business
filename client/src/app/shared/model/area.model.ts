import type { AreaType } from '@/shared/model/enumerations/area-type.model.ts';

export interface IArea {
  id?: number;
  name?: string;
  description?: string | null;
  type?: AreaType;
}

export class Area implements IArea {
  constructor(
    public id?: number,
    public name?: string,
    public description?: string | null,
    public type?: AreaType,
  ) {}
}
