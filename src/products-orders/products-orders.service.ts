import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsOrders } from './entities/products-orders.entity';
@Injectable()
export class ProductsOrdersService {
  constructor(
    @InjectRepository(ProductsOrders)
    private productsOrdersRepository: Repository<ProductsOrders>,
  ) {}
}
