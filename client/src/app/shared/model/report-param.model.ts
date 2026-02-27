import type { IPeriod } from '@/shared/model/period.model.ts';
import type { IArea } from '@/shared/model/area.model.ts';

export interface IReportParam {
  period?: IPeriod;
  area?: IArea;
}

export class ReportParam implements IReportParam {
  constructor(
    public period?: IPeriod,
    public area?: IArea,
  ) {}
}
