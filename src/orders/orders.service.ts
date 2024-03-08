import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Orders } from './entities/orders.entity';
import { Between, In, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { format } from 'date-fns';
import { OrdersFiltersDto } from './dto/orders-filter.dto';
import { OrderedPaginatedQueryOptions } from 'src/pagination/pagination-data.interface';
import { Pagination } from 'src/pagination/pagination.class';
import { getOrdersFiltersApplier } from './functions/get-orders-filter-applier';
import { applyQueryFilters } from 'src/pagination/functions/apply-query-filters';
import { Product } from 'src/products/entities/products.entity';
import { BadRequestException } from '@nestjs/common';
import { ProductsOrders } from 'src/products-orders/entities/products-orders.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Orders)
    private orderRepository: Repository<Orders>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductsOrders)
    private productsOrdersRepository: Repository<ProductsOrders>,
  ) {}

  async createNewOrder(createOrderDto: CreateOrderDto[]) {
    if (!createOrderDto.length) {
      throw new BadGatewayException('La orden no puede estar vacia');
    }

    for (const order of createOrderDto) {
      const orderDateFormatted = format(new Date(), 'yyyy-MM-dd');
      order.orderDate = orderDateFormatted;

      const existingOrder = await this.orderRepository.findOne({
        relations: {
          productsOrders: true,
        },
        where: {
          clientId: order.clientId,
          orderDate: order.orderDate,
        },
      });

      const product = await this.productRepository.findOne({
        where: {
          id: order.productId,
        },
      });

      if (!product) {
        throw new NotFoundException(
          `El producto con ID ${order.productId} no fue encontrado`,
        );
      }

      if (product.stock < order.count) {
        throw new BadRequestException(
          `No hay suficiente stock disponible para el producto ${product.productName}`,
        );
      }
      product.stock -= order.count;
      await this.productRepository.save(product);

      if (existingOrder) {
        const existingProductOrder = existingOrder.productsOrders.find(
          (po) => po.product === order.productId,
        );

        if (existingProductOrder) {
          existingProductOrder.count += order.count;
          await this.productsOrdersRepository.save(existingProductOrder);
        } else {
          await this.productsOrdersRepository.insert({
            count: order.count,
            product: order.productId,
            price: product.price,
            order: {
              id: existingOrder.id,
            },
          });
        }
      } else {
        const newOrder = await this.orderRepository.save({
          address: order.address,
          client: {
            id: order.clientId,
          },
          deliveryDate: order.deliveryDate,
          orderDate: order.orderDate,
          unit: '',
          send: false,
        });

        await this.productsOrdersRepository.insert({
          count: order.count,
          product: order.productId,
          price: product.price,
          order: {
            id: newOrder.id,
          },
        });
      }
    }
    return 'Órdenes procesadas satisfactoriamente';
  }

  async getOrders(filtersOptions: OrdersFiltersDto) {
    const pageOptions: OrderedPaginatedQueryOptions<Orders> = {
      page: filtersOptions.page,
      size: filtersOptions.size,
    };

    let query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.client', 'client')
      .orderBy('order.createdAt', 'DESC');

    const filters = await getOrdersFiltersApplier(filtersOptions);
    query = await applyQueryFilters(query, filters);

    const ordersResponse = await Pagination.getPaginatedResponse(
      pageOptions,
      query,
      async (order: Orders) => {
        const orderDetails = await this.orderRepository.findOne({
          where: {
            id: order.id,
          },
          relations: {
            client: true,
            productsOrders: true,
          },
        });

        return {
          id: orderDetails.id,
          client: orderDetails.client.nameAndLastname,
          deliveryDate: orderDetails.deliveryDate || '',
          orderDate: orderDetails.orderDate,
          send: orderDetails.send,
          address: orderDetails.address,
          order: await Promise.all(
            orderDetails.productsOrders.map(async (ctProductOrder) => {
              const productDetails = await this.productRepository.findOne({
                where: { id: ctProductOrder.product },
              });

              return {
                id: orderDetails.id,
                count: ctProductOrder.count,
                price: ctProductOrder.price.toString(),
                product: {
                  id: productDetails.id,
                  name: productDetails
                    ? productDetails.productName
                    : 'Descripción no disponible',
                },
              };
            }),
          ),
        };
      },
    );

    return {
      ...ordersResponse,
    };
  }

  async markAsSent(markAsSentDto: { orderId: number; deliveryDate: Date }) {
    const { orderId, deliveryDate } = markAsSentDto;
    const findOrder = await this.orderRepository.findOne({
      where: {
        id: orderId,
      },
    });

    findOrder.send = true;
    findOrder.deliveryDate = deliveryDate;

    await this.orderRepository.save(findOrder);
    return `Pedido marcado como enviado el día ${deliveryDate}`;
  }

  async deleteProductOrder(orderId: number, productId: number) {
    if (!orderId) {
      throw new BadGatewayException('El id no puede estar vacio');
    }

    const productOrder = await this.productsOrdersRepository.findOne({
      where: {
        order: {
          id: orderId,
        },
        product: productId,
      },
    });

    await this.productsOrdersRepository.remove(productOrder);
    return 'Product eliminado correctamente de la orden';
  }

  async editProductCount(productOrder: {
    orderId: number;
    productId: number;
    count: number;
  }) {
    const { orderId, productId, count } = productOrder;
    if (
      orderId === undefined ||
      productId === undefined ||
      count === undefined
    ) {
      throw new BadGatewayException(
        'El id y la cantidad no pueden estar vacíos',
      );
    }

    const productOrderFind = await this.productsOrdersRepository.findOne({
      where: {
        order: {
          id: orderId,
        },
        product: productId,
      },
    });

    if (!productOrderFind) {
      throw new NotFoundException(
        'El producto en la orden no pudo ser encontrada',
      );
    }

    const findProductStock = await this.productRepository.findOne({
      where: {
        id: productId,
      },
    });

    if (!findProductStock) {
      throw new NotFoundException('El producto no pudo ser encontrado');
    }

    if (count > findProductStock.stock) {
      throw new BadRequestException('No hay suficiente stock disponible');
    }

    productOrderFind.count = count;
    findProductStock.stock -= count;

    await this.productsOrdersRepository.save(productOrderFind);
    await this.productRepository.save(findProductStock);

    return 'Cantidad actualizada correctamente de la orden';
  }

  async getReportsBySales(year: number): Promise<number[]> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const orders = await this.orderRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ['productsOrders'],
    });

    const monthlySales: number[] = Array(12).fill(0);

    for (const order of orders) {
      const month = order.createdAt.getMonth();

      let orderTotal = 0;
      for (const productOrder of order.productsOrders) {
        orderTotal += productOrder.price * productOrder.count;
      }

      monthlySales[month] += orderTotal;
    }

    return monthlySales;
  }

  async getReportsByProduct({
    productId,
    year,
    month,
  }: {
    productId: number;
    year: number;
    month: number;
  }): Promise<[number]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const orders = await this.orderRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      select: ['id'],
    });

    const orderIds = orders.map((order) => order.id);

    const productsOrders = await this.productsOrdersRepository.find({
      where: {
        product: productId,
        order: In(orderIds),
      },
      select: ['count'],
    });

    const totalSales = productsOrders.reduce(
      (total, productOrder) => total + productOrder.count,
      0,
    );

    return [totalSales];
  }
}
