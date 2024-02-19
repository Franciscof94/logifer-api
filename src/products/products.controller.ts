import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsFiltersDto } from './dto/products-filter.dto';
import { IProduct } from './interfaces/product.interface';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('new-product')
  createNewProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.createNewProduct(createProductDto);
  }

  @Get('products-options')
  getProductsOptions() {
    return this.productsService.getProductsOptions();
  }

  @Get('')
  getProducts(@Query() filtersOptions: ProductsFiltersDto) {
    return this.productsService.getProducts(filtersOptions);
  }

  @Delete('delete-product/:id')
  deleteProduct(@Param() productId: { id: number }) {
    const { id } = productId;
    return this.productsService.deleteProduct(id);
  }

  @Patch('/edit-product/:id')
  editProduct(@Param() productId: { id: number }, @Body() product: IProduct) {
    const { id } = productId;
    return this.productsService.productEdit({ id, product });
  }

  @Patch('/edit-product-stock/:id')
  editProductStock(
    @Param() productId: { id: number },
    @Body() body: { count: number },
  ) {
    const { count } = body;
    return this.productsService.editProductStock({ productId, count });
  }
}
