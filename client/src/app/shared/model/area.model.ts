export interface IArea {
  id?: number;
  name?: string;
  description?: string | null;
}

export class Area implements IArea {
  constructor(
    public id?: number,
    public name?: string,
    public description?: string | null,
  ) {}
}
