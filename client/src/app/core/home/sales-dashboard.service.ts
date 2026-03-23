import axios from 'axios';

export interface SalesByDay {
  day: number;
  total: number;
  amount: number;
}

export interface TopProductSales {
  productId: number;
  productName: string;
  total: number;
  umName: string;
  amount: number;
}

export interface SalesDashboard {
  year: number;
  month: number;
  totalSalesCount: number;
  totalSalesAmount: number;
  totalCostAmount: number;
  totalProfitAmount: number;
  salesByDay: SalesByDay[];
  topProducts: TopProductSales[];
}

const baseApiUrl = 'api/product-shipments';

export const getSalesDashboard = async (filter?: {
  productCategoryId?: number;
  productFamilyId?: number;
  productLineId?: number;
}): Promise<SalesDashboard> => {
  const res = await axios.get<SalesDashboard>(`${baseApiUrl}/summary`, {
    params: {
      ...(filter?.productCategoryId ? { productCategoryId: filter.productCategoryId } : {}),
      ...(filter?.productFamilyId ? { productFamilyId: filter.productFamilyId } : {}),
      ...(filter?.productLineId ? { productLineId: filter.productLineId } : {}),
    },
  });
  return res.data;
};
