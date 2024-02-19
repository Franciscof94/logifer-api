import { IsOptional, IsString } from 'class-validator';
import { OrderedPaginatedQueryDto } from '../../pagination/pagination-data.interface';
import { Product } from '../entities/products.entity';
import { ProductsFilters } from '../interfaces/product-filter.interface';

export class ProductsFiltersDto
  extends OrderedPaginatedQueryDto<Product>
  implements ProductsFilters
{
  @IsString()
  @IsOptional()
  product: string;

  @IsString()
  @IsOptional()
  price: string;

  page: number = 1;
  size: number = 9;
}
