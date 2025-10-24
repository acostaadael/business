export interface IUm {
  id?: number;
  name?: string;
  description?: string | null;
}

export class Um implements IUm {
  constructor(
    public id?: number,
    public name?: string,
    public description?: string | null,
  ) {}
}
