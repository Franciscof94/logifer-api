import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/products.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsFiltersDto } from './dto/products-filter.dto';
import { OrderedPaginatedQueryOptions } from 'src/pagination/pagination-data.interface';
import { applyQueryFilters } from 'src/pagination/functions/apply-query-filters';
import { Pagination } from 'src/pagination/pagination.class';
import { getProductsFiltersApplier } from './functions/get-products-filter-applier';
import { IProduct } from './interfaces/product.interface';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async createNewProduct(createProductDto: CreateProductDto) {
    if (!createProductDto) {
      throw new BadRequestException('No puede estar vacio el producto');
    }

    const findProduct = await this.productRepository.findOne({
      where: {
        productName: createProductDto.product,
      },
    });
    if (findProduct) {
      throw new BadRequestException(
        'Ya existe un producto creado con el mismo nombre',
      );
    }

    try {
      await this.productRepository.save({
        price: createProductDto.price,
        productName: createProductDto.product,
        stock: createProductDto.stock,
      });

      return 'Producto creado exitosamente';
    } catch (error) {
      return error;
    }
  }

  async getProductsOptions() {
    const products = await this.productRepository.find();

    return products.map((ctProduct) => {
      return {
        price: ctProduct.price.toString().replace(/\.00$/, ''),
        stock: ctProduct.stock,
        value: ctProduct.id,
        label: ctProduct.productName,
      };
    });
  }

  async getProducts(filtersOptions: ProductsFiltersDto) {
    const pageOptions: OrderedPaginatedQueryOptions<Product> = {
      page: filtersOptions.page,
      size: filtersOptions.size,
    };

    let query = this.productRepository.createQueryBuilder('product');

    const filters = await getProductsFiltersApplier(filtersOptions);
    query = await applyQueryFilters(query, filters);

    const productsResponse = await Pagination.getPaginatedResponse(
      pageOptions,
      query,
      async (product: Product) => {
        return {
          product: product.productName,
          price: product.price.toString().replace(/\.00$/, ''),
          unit: '',
          stock: product.stock,
          id: product.id,
        };
      },
    );

    return productsResponse;
  }

  async deleteProduct(productId: number) {
    if (!productId) {
      throw new BadRequestException('El productId no puede estar vacio');
    }

    const findProduct = await this.productRepository.findOne({
      where: {
        id: productId,
      },
    });

    if (!productId) {
      throw new NotFoundException('El producto no pudo ser encontrado');
    }

    await this.productRepository.remove(findProduct);

    return 'Producto eliminado correctamente';
  }

  async productEdit(productData: { id: number; product: IProduct }) {
    const { product, id } = productData;

    if (!id && !product) {
      throw new BadRequestException(
        'El id y el producto no pueden estar vacios',
      );
    }

    const findProduct = await this.productRepository.findOne({
      where: {
        id: Number(id),
      },
    });

    findProduct.price = product.price;
    findProduct.productName = product.product;
    findProduct.stock = product.stock;
    await this.productRepository.save(findProduct);

    return 'Producto actualizado correctamente';
  }

  async editProductStock(productData: {
    productId: { id: number };
    count: number;
  }) {
    const { productId, count } = productData;
    if (!productId) {
      throw new BadRequestException('El id del producto no puede estar vacio');
    }

    const findProduct = await this.productRepository.findOne({
      where: {
        id: productId.id,
      },
    });

    if (!findProduct) {
      throw new NotFoundException('El producto no pudo ser encontrado');
    }
    findProduct.stock = count;

    await this.productRepository.save(findProduct);
    return 'Stock actualizado correctamente';
  }
}
