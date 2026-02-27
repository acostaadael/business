import type { IPeriod } from '@/shared/model/period.model.ts';
import type { IArea } from '@/shared/model/area.model.ts';
import type { ExitType } from '@/shared/model/enumerations/exit-type.model.ts';

export interface IReportParam {
  period?: IPeriod;
  area?: IArea;
  exitType?: ExitType;
}

export class ReportParam implements IReportParam {
  constructor(
    public period?: IPeriod,
    public area?: IArea,
    public exitType?: ExitType,
  ) {}
}
