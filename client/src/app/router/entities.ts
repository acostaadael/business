import { Authority } from '@/shared/security/authority';
const Entities = () => import('@/entities/entities.vue');

const Period = () => import('@/entities/period/period.vue');
const PeriodUpdate = () => import('@/entities/period/period-update.vue');

const Um = () => import('@/entities/um/um.vue');
const UmUpdate = () => import('@/entities/um/um-update.vue');

const AreaCrud = () => import('@/entities/area/area-crud.vue');
const AreaUpdate = () => import('@/entities/area/area-update.vue');

const ProductCategory = () => import('@/entities/product-category/product-category.vue');
const ProductCategoryUpdate = () => import('@/entities/product-category/product-category-update.vue');
const ProductCategoryDetails = () => import('@/entities/product-category/product-category-details.vue');

const ProductFamily = () => import('@/entities/product-family/product-family.vue');
const ProductFamilyUpdate = () => import('@/entities/product-family/product-family-update.vue');
const ProductFamilyDetails = () => import('@/entities/product-family/product-family-details.vue');

const ProductLine = () => import('@/entities/product-line/product-line.vue');
const ProductLineUpdate = () => import('@/entities/product-line/product-line-update.vue');
const ProductLineDetails = () => import('@/entities/product-line/product-line-details.vue');

const ProductCrud = () => import('@/entities/product/product-crud.vue');
const ProductUpdate = () => import('@/entities/product/product-update.vue');
const ProductDetails = () => import('@/entities/product/product-details.vue');

const Inventary = () => import('@/entities/inventary/inventary.vue');

const Entry = () => import('@/entities/entry/entry-crud.vue');
const EntryUpdate = () => import('@/entities/entry/entry-multiple-update.vue');

const Company = () => import('@/entities/company/company.vue');
const CompanyUpdate = () => import('@/entities/company/company-update.vue');
const CompanyDetails = () => import('@/entities/company/company-details.vue');

const InventoryMovement = () => import('@/entities/inventory-movement/inventory-movement.vue');
const InventoryMovementUpdate = () => import('@/entities/inventory-movement/inventory-movement-update.vue');

const ProductShipment = () => import('@/entities/product-shipment/product-shipment.vue');
const ProductShipmentUpdate = () => import('@/entities/product-shipment/product-shipment-update.vue');

const InventaryReport = () => import('@/entities/report/inventary-report.vue');
const InventaryParamReport = () => import('@/entities/report/inventary-param-report.vue');

const EntryReport = () => import('@/entities/report/entry-report.vue');
const EntryParamReport = () => import('@/entities/report/entry-param-report.vue');

const ExitReport = () => import('@/entities/report/exit-report.vue');
const ExitParamReport = () => import('@/entities/report/exit-param-report.vue');

// jhipster-needle-add-entity-to-router-import - JHipster will import entities to the router here

export default {
  path: '/',
  component: Entities,
  children: [
    {
      path: 'period',
      name: 'Period',
      component: Period,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'period/new',
      name: 'PeriodCreate',
      component: PeriodUpdate,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'um',
      name: 'Um',
      component: Um,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'um/new',
      name: 'UmCreate',
      component: UmUpdate,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'um/:umId/edit',
      name: 'UmEdit',
      component: UmUpdate,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'area',
      name: 'Area',
      component: AreaCrud,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'area/new',
      name: 'AreaCreate',
      component: AreaUpdate,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'area/:areaId/edit',
      name: 'AreaEdit',
      component: AreaUpdate,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'product-category',
      name: 'ProductCategory',
      component: ProductCategory,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'product-category/new',
      name: 'ProductCategoryCreate',
      component: ProductCategoryUpdate,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'product-category/:productCategoryId/edit',
      name: 'ProductCategoryEdit',
      component: ProductCategoryUpdate,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'product-category/:productCategoryId/view',
      name: 'ProductCategoryView',
      component: ProductCategoryDetails,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'product-family',
      name: 'ProductFamily',
      component: ProductFamily,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'product-family/new',
      name: 'ProductFamilyCreate',
      component: ProductFamilyUpdate,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'product-family/:productFamilyId/edit',
      name: 'ProductFamilyEdit',
      component: ProductFamilyUpdate,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'product-family/:productFamilyId/view',
      name: 'ProductFamilyView',
      component: ProductFamilyDetails,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'product-line',
      name: 'ProductLine',
      component: ProductLine,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'product-line/new',
      name: 'ProductLineCreate',
      component: ProductLineUpdate,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'product-line/:productLineId/edit',
      name: 'ProductLineEdit',
      component: ProductLineUpdate,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'product-line/:productLineId/view',
      name: 'ProductLineView',
      component: ProductLineDetails,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'product',
      name: 'Product',
      component: ProductCrud,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'product/new',
      name: 'ProductCreate',
      component: ProductUpdate,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'product/:productId/edit',
      name: 'ProductEdit',
      component: ProductUpdate,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'product/:productId/view',
      name: 'ProductView',
      component: ProductDetails,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'inventary',
      name: 'Inventary',
      component: Inventary,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'entry',
      name: 'Entry',
      component: Entry,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'entry/new',
      name: 'EntryCreate',
      component: EntryUpdate,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'company',
      name: 'Company',
      component: Company,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'company/new',
      name: 'CompanyCreate',
      component: CompanyUpdate,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'company/:companyId/edit',
      name: 'CompanyEdit',
      component: CompanyUpdate,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'company/:companyId/view',
      name: 'CompanyView',
      component: CompanyDetails,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'inventory-movement',
      name: 'InventoryMovement',
      component: InventoryMovement,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'inventory-movement/new',
      name: 'InventoryMovementCreate',
      component: InventoryMovementUpdate,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'product-shipment',
      name: 'ProductShipment',
      component: ProductShipment,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'product-shipment/new',
      name: 'ProductShipmentCreate',
      component: ProductShipmentUpdate,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'inventary-param-report',
      name: 'InventaryParamReport',
      component: InventaryParamReport,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'inventary-report/:areaId',
      name: 'InventaryReport',
      component: InventaryReport,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'entry-param-report',
      name: 'EntryParamReport',
      component: EntryParamReport,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'entry-report/:periodId',
      name: 'EntryReport',
      component: EntryReport,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'exit-param-report',
      name: 'ExitParamReport',
      component: ExitParamReport,
      meta: { authorities: [Authority.USER] },
    },
    {
      path: 'exit-report/:periodId/:exitType',
      name: 'ExitReport',
      component: ExitReport,
      meta: { authorities: [Authority.USER] },
    },
    // jhipster-needle-add-entity-to-router - JHipster will add entities to the router here
  ],
};
