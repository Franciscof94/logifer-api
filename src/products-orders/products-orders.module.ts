import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsOrders } from './entities/products-orders.entity';
import { ProductsOrdersController } from './products-orders.controller';
import { ProductsOrdersService } from './products-orders.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductsOrders])],
  controllers: [ProductsOrdersController],
  providers: [ProductsOrdersService],
})
export class OrdersModule {}
