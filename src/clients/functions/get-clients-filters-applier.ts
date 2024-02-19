import { QueryHelper } from '../../helpers/index';
import { ClientsFilters } from '../interfaces/client-filter.interface';

export async function getClientsFiltersApplier(
  filtersOptions: ClientsFilters,
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
        return QueryHelper.addWhere(q, 'AND', 'client.address LIKE :address', {
          address: `%${v}%`,
        });
      },
    },
    email: {
      value: filtersOptions.email,
      applier: async (v, q) => {
        return QueryHelper.addWhere(q, 'AND', 'client.email LIKE  :email', {
          email: `%${v}%`,
        });
      },
    },
  };
}
