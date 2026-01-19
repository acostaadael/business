import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AuthModule } from './module/auth.module';
import { ormConfig } from './orm.config';
import { config } from './config';
import { PeriodModule } from './module/period.module';
import { UmModule } from './module/um.module';
import { AreaModule } from './module/area.module';
import { ProductCategoryModule } from './module/product-category.module';
import { ProductFamilyModule } from './module/product-family.module';
import { ProductLineModule } from './module/product-line.module';
import { ProductModule } from './module/product.module';
import { InventaryModule } from './module/inventary.module';
import { EntryModule } from './module/entry.module';
import { CompanyModule } from './module/company.module';
import { InventoryMovementModule } from './module/inventory-movement.module';
import { ProductShipmentModule } from './module/product-shipment.module';
// jhipster-needle-add-entity-module-to-main-import - JHipster will import entity modules here, do not remove
// jhipster-needle-add-controller-module-to-main-import - JHipster will import controller modules here, do not remove
// jhipster-needle-add-service-module-to-main-import - JHipster will import service modules here, do not remove

@Module({
  imports: [
    TypeOrmModule.forRootAsync({ useFactory: ormConfig }),
    ServeStaticModule.forRoot({
      rootPath: config.getClientPath(),
    }),
    AuthModule,
    PeriodModule,
    UmModule,
    AreaModule,
    ProductCategoryModule,
    ProductFamilyModule,
    ProductLineModule,
    ProductModule,
    InventaryModule,
    EntryModule,
    CompanyModule,
    InventoryMovementModule,
    ProductShipmentModule,
    // jhipster-needle-add-entity-module-to-main - JHipster will add entity modules here, do not remove
  ],
  controllers: [
    // jhipster-needle-add-controller-module-to-main - JHipster will add controller modules here, do not remove
  ],
  providers: [
    // jhipster-needle-add-service-module-to-main - JHipster will add service modules here, do not remove
  ],
})
export class AppModule {}
