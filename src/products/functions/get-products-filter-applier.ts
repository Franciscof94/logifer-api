import { QueryHelper } from '../../helpers/index';
import { ProductsFilters } from '../interfaces/product-filter.interface';

export async function getProductsFiltersApplier(
  filtersOptions: ProductsFilters,
): Promise<any> {
  return {
    productName: {
      value: filtersOptions.product,
      applier: async (v, q) => {
        return QueryHelper.addWhere(
          q,
          'AND',
          'product.productName LIKE :product',
          {
            productName: `%${v}%`,
          },
        );
      },
    },
    price: {
      value: filtersOptions.price,
      applier: async (v, q) => {
        return QueryHelper.addWhere(q, 'AND', 'product.price LIKE :price', {
          price: `%${v}%`,
        });
      },
    },
  };
}
