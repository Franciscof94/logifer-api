import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orders } from './entities/orders.entity';
import { Product } from 'src/products/entities/products.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Orders, Product])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
