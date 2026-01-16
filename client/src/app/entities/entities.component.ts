import { defineComponent, provide } from 'vue';

import PeriodService from './period/period.service';
import UmService from './um/um.service';
import AreaService from './area/area.service';
import ProductCategoryService from './product-category/product-category.service';
import ProductFamilyService from './product-family/product-family.service';
import ProductLineService from './product-line/product-line.service';
import ProductService from './product/product.service';
import InventaryService from './inventary/inventary.service';
import EntryService from './entry/entry.service';
import CompanyService from './company/company.service';
import InventoryMovementService from './inventory-movement/inventory-movement.service';
import UserService from '@/entities/user/user.service';
// jhipster-needle-add-entity-service-to-entities-component-import - JHipster will import entities services here

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'Entities',
  setup() {
    provide('userService', () => new UserService());
    provide('periodService', () => new PeriodService());
    provide('umService', () => new UmService());
    provide('areaService', () => new AreaService());
    provide('productCategoryService', () => new ProductCategoryService());
    provide('productFamilyService', () => new ProductFamilyService());
    provide('productLineService', () => new ProductLineService());
    provide('productService', () => new ProductService());
    provide('inventaryService', () => new InventaryService());
    provide('entryService', () => new EntryService());
    provide('companyService', () => new CompanyService());
    provide('inventoryMovementService', () => new InventoryMovementService());
    // jhipster-needle-add-entity-service-to-entities-component - JHipster will import entities services here
  },
});
