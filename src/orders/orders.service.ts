import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Orders } from './entities/orders.entity';
import { Between, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { format } from 'date-fns';
import { OrdersFiltersDto } from './dto/orders-filter.dto';
import { OrderedPaginatedQueryOptions } from 'src/pagination/pagination-data.interface';
import { Pagination } from 'src/pagination/pagination.class';
import { getOrdersFiltersApplier } from './functions/get-orders-filter-applier';
import { applyQueryFilters } from 'src/pagination/functions/apply-query-filters';
import { Product } from 'src/products/entities/products.entity';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Orders)
    private orderRepository: Repository<Orders>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async createNewOrder(createOrderDto: CreateOrderDto[]) {
    if (!createOrderDto.length) {
      throw new BadGatewayException('La orden no puede estar vacia');
    }

    for (const order of createOrderDto) {
      const orderDateFormatted = format(new Date(), 'yyyy-MM-dd');
      order.orderDate = orderDateFormatted;

      const existingOrder = await this.orderRepository.findOne({
        where: {
          clientId: order.clientId,
          product: order.productId,
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
        existingOrder.count += order.count;
        await this.orderRepository.save(existingOrder);
      } else {
        await this.orderRepository.insert({
          address: order.address,
          client: {
            id: order.clientId,
          },
          count: order.count,
          product: order.productId,
          deliveryDate: order.deliveryDate,
          orderDate: order.orderDate,
          unit: '',
          send: false,
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
      .leftJoinAndSelect('order.client', 'client');

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
          },
        });

        const findProduct = await this.productRepository.findOne({
          where: { id: orderDetails.product },
        });
        return {
          id: orderDetails.id,
          client: orderDetails.client.nameAndLastname,
          deliveryDate: orderDetails.deliveryDate || '',
          orderDate: orderDetails.orderDate,
          send: orderDetails.send,
          address: orderDetails.address,
          order: [
            {
              id: orderDetails.id,
              product: findProduct.productName,
              count: orderDetails.count,
              unit: '',
              price: '$' + findProduct.price,
            },
          ],
        };
      },
    );

    const groupedOrders = {};
    ordersResponse.data.forEach((order) => {
      const key = `${order.client}-${order.orderDate}`;
      if (!groupedOrders[key]) {
        groupedOrders[key] = order;
      } else {
        groupedOrders[key].order.push(...order.order);
      }
    });

    const data = Object.values(groupedOrders);

    return {
      ...ordersResponse,
      data,
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

  async deleteProductOrder(orderProductId: number) {
    if (!orderProductId) {
      throw new BadGatewayException('El id no puede estar vacio');
    }

    const productOrder = await this.orderRepository.findOne({
      where: {
        id: orderProductId,
      },
    });

    await this.orderRepository.remove(productOrder);
    return 'Product eliminado correctamente de la orden';
  }

  async editProductCount(productOrder: { id: number; count: number }) {
    const { id, count } = productOrder;
    if (id === undefined || count === undefined) {
      throw new BadGatewayException(
        'El id y la cantidad no pueden estar vacíos',
      );
    }

    const productOrderFind = await this.orderRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!productOrderFind) {
      throw new NotFoundException('La orden no pudo ser encontrada');
    }

    const findProductStock = await this.productRepository.findOne({
      where: {
        id: productOrderFind.product,
      },
    });

    console.log(findProductStock, count);

    if (!findProductStock) {
      throw new NotFoundException('El producto no pudo ser encontrado');
    }

    if (count > findProductStock.stock) {
      throw new BadRequestException('No hay suficiente stock disponible');
    }

    productOrderFind.count += count;
    findProductStock.stock -= count;

    await this.orderRepository.save(productOrderFind);
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
      select: ['id', 'count', 'createdAt', 'product'],
    });

    const monthlySales: number[] = Array(12).fill(null);

    for (const order of orders) {
      const month = order.createdAt.getMonth();
      const product = await this.productRepository.findOne({
        where: {
          id: order.product,
        },
      });

      if (product) {
        const total = order.count * product.price;

        if (monthlySales[month] === null) {
          monthlySales[month] = total;
        } else {
          monthlySales[month] += total;
        }
      }
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
  }): Promise<number[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const orders = await this.orderRepository.find({
      where: {
        product: productId,
        createdAt: Between(startDate, endDate),
      },
      select: ['count', 'createdAt'],
    });

    const totalSalesByMonth: number = orders.reduce((total, order) => {
      return total + order.count;
    }, 0);

    const product = await this.productRepository.findOne({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new NotFoundException(
        `No se encontró el producto con ID ${product}`,
      );
    }

    const totalPrice = totalSalesByMonth;
    return [totalPrice];
  }
}
