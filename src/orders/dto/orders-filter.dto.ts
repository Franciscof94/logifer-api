import { IsOptional, IsString } from 'class-validator';
import { OrderedPaginatedQueryDto } from '../../pagination/pagination-data.interface';
import { Orders } from '../entities/orders.entity';
import { OrdersFilters } from '../interfaces/order-filter.interface';

export class OrdersFiltersDto
  extends OrderedPaginatedQueryDto<Orders>
  implements OrdersFilters
{
  @IsString()
  @IsOptional()
  nameAndLastname: string;

  @IsString()
  @IsOptional()
  address: string;

  @IsString()
  @IsOptional()
  orderDate: string;

  page: number = 1;
  size: number = 9;
}
