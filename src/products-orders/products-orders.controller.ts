import { Controller } from '@nestjs/common';
import { ProductsOrdersService } from './products-orders.service';

@Controller('products-orders')
export class ProductsOrdersController {
  constructor(private readonly productsOrdersService: ProductsOrdersService) {}
}
