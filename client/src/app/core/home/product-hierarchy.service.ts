import axios from 'axios';

export interface IdName {
  id: number;
  name: string;
}

const baseApiUrl = 'api/product-hierarchy';

export const getCategories = async (): Promise<IdName[]> => {
  const res = await axios.get<IdName[]>(`${baseApiUrl}/categories`);
  return res.data;
};

export const getFamilies = async (productCategoryId?: number): Promise<IdName[]> => {
  const res = await axios.get<IdName[]>(`${baseApiUrl}/families`, {
    params: productCategoryId ? { productCategoryId } : {},
  });
  return res.data;
};

export const getLines = async (productFamilyId?: number): Promise<IdName[]> => {
  const res = await axios.get<IdName[]>(`${baseApiUrl}/lines`, {
    params: productFamilyId ? { productFamilyId } : {},
  });
  return res.data;
};
