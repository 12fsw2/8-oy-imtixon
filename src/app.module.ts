import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './company/company.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { CustomersModule } from './customers/customers.module';
import { SalesModule } from './sales/sales.module';
import { PaymentsModule } from './payments/payments.module';
import { DebtsModule } from './debts/debts.module';
import { InventoryModule } from './inventory/inventory.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CompanyModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    CustomersModule,
    SalesModule,
    PaymentsModule,
    DebtsModule,
    InventoryModule,
    DashboardModule,
  ],
})
export class AppModule {}
