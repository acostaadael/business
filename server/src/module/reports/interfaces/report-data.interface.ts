// reports/interfaces/report-data.interface.ts
export interface ReportData {
  [key: string]: any;
}

export interface ReportColumn {
  header: string;
  key: string;
  width?: number;
  format?: string;
}

export interface ReportOptions {
  title: string;
  columns: ReportColumn[];
  filters?: Record<string, any>;
  includeCharts?: boolean;
  groupBy?: string[];
  sortBy?: string;
}
