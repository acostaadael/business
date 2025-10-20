import { PeriodStatus } from '@/shared/model/enumerations/period-status.model';
export interface IPeriod {
  id?: number;
  month?: number;
  year?: number;
  status?: keyof typeof PeriodStatus;
}

export class Period implements IPeriod {
  constructor(
    public id?: number,
    public month?: number,
    public year?: number,
    public status?: keyof typeof PeriodStatus,
  ) {
    const date = new Date();

    this.month = date.getMonth();
    this.year = date.getFullYear();
    this.status = PeriodStatus.OPEN;
  }
}
