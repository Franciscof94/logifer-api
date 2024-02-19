import { SelectQueryBuilder } from 'typeorm';

export type QueryFilterApplier<T, K> = {
  [M in keyof K]: {
    value: K[M];
    applier: (
      value: K[M],
      query: SelectQueryBuilder<T>,
    ) => Promise<SelectQueryBuilder<T>>;
  };
};

export async function applyQueryFilters<T, K>(
  query: SelectQueryBuilder<T>,
  filterApplier: QueryFilterApplier<T, K>,
) {
  for (const prop of Object.keys(filterApplier).filter(
    (key) =>
      filterApplier[key].value != null && filterApplier[key].value !== '',
  )) {
    query = await filterApplier[prop].applier(filterApplier[prop].value, query);
  }

  return query;
}
