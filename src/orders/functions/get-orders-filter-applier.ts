import { QueryHelper } from '../../helpers/index';
import { OrdersFilters } from '../interfaces/order-filter.interface';

export async function getOrdersFiltersApplier(
  filtersOptions: OrdersFilters,
): Promise<any> {
  return {
    nameandlastname: {
      value: filtersOptions.nameAndLastname,
      applier: async (v, q) => {
        return QueryHelper.addWhere(
          q,
          'AND',
          'client.nameAndLastname LIKE :nameandlastname',
          {
            nameandlastname: `%${v}%`,
          },
        );
      },
    },
    address: {
      value: filtersOptions.address,
      applier: async (v, q) => {
        return QueryHelper.addWhere(q, 'AND', 'order.address LIKE :address', {
          address: `%${v}%`,
        });
      },
    },
    orderdate: {
      value: filtersOptions.orderDate,
      applier: async (v, q) => {
        return QueryHelper.addWhere(q, 'AND', 'order.orderDate = :orderdate', {
          orderdate: v,
        });
      },
    },
  };
}
