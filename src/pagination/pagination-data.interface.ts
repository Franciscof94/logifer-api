import {
  Equals,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderedPaginatedQueryDto<T>
  implements OrderedPaginatedQueryOptions<T>
{
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  size: number;

  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.dir === undefined)
  @Equals(undefined)
  sort?: keyof T;

  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.sort === undefined)
  @Equals(undefined)
  dir?: 'ASC' | 'DESC';
}

export type OrderedPaginatedQueryOptions<T> = Partial<
  OrderQueryResultOptions<T>
> &
  PaginatedQueryOptions;

export interface OrderQueryResultOptions<T> {
  sort: keyof T;
  dir: 'ASC' | 'DESC';
}

export interface PaginatedQueryOptions {
  page: number;
  size: number;
}

export interface PaginatedResponse<T> {
  data: Array<T>;
  columns?: ColumnNamesMapper<T>;
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export type ColumnNamesMapper<T> = {
  [K in keyof T]: string;
};
