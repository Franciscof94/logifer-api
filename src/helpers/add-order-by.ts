import { SelectQueryBuilder } from 'typeorm';

export function applyOrderBy<T>(
  query: SelectQueryBuilder<T>,
  orderBySort: string,
  order?: 'ASC' | 'DESC',
  nulls?: 'NULLS FIRST' | 'NULLS LAST',
): SelectQueryBuilder<T> {
  if (Object.keys(query.expressionMap.orderBys).length > 0) {
    return query.addOrderBy(orderBySort, order, nulls);
  } else {
    return query.orderBy(orderBySort, order, nulls);
  }
}
