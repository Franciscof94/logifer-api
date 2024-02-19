import { Brackets, ObjectLiteral, SelectQueryBuilder } from 'typeorm';

type WhereTypes = 'AND' | 'OR';

export class QueryHelper {
  static wheres: { [K in WhereTypes]: any } = {
    AND: SelectQueryBuilder.prototype.andWhere,
    OR: SelectQueryBuilder.prototype.orWhere,
  };

  static addWhere<T>(
    query: SelectQueryBuilder<T>,
    whereType: WhereTypes,
    where:
      | string
      | Brackets
      | ObjectLiteral
      | ObjectLiteral[]
      | ((qb: SelectQueryBuilder<T>) => string),
    parameters?: ObjectLiteral,
  ): SelectQueryBuilder<T> {
    if (query.expressionMap.wheres.length > 0) {
      return this.wheres[whereType].apply(query, [`(${where})`, parameters]);
    } else {
      return query.where(`(${where})`, parameters);
    }
  }
}
