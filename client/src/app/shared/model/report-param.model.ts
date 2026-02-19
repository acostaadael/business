import type { IPeriod } from '@/shared/model/period.model.ts';

export interface IReportParam {
  period?: IPeriod;
}

export class ReportParam implements IReportParam {
  constructor(public period?: IPeriod) {}
}
