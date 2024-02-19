import { IsOptional, IsString } from 'class-validator';
import { OrderedPaginatedQueryDto } from '../../pagination/pagination-data.interface';
import { ClientsFilters } from '../interfaces/client-filter.interface';
import { Client } from '../entities/clients.entity';

export class ClientsFiltersDto
  extends OrderedPaginatedQueryDto<Client>
  implements ClientsFilters
{
  @IsString()
  @IsOptional()
  nameAndLastname: string;

  @IsString()
  @IsOptional()
  address: string;

  @IsString()
  @IsOptional()
  email: string;

  page: number = 1;
  size: number = 9;
}
