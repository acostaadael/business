export interface ICompany {
  id?: number;
  name?: string;
  active?: boolean | null;
}

export class Company implements ICompany {
  constructor(
    public id?: number,
    public name?: string,
    public active?: boolean | null,
  ) {
    this.active = this.active ?? false;
  }
}
