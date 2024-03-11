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
import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import * as fs from 'fs';
import handlebars from 'handlebars';
import * as htmlToPdf from 'html-pdf';
import * as path from 'path';

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

  private loadTemplate(templateName: string): handlebars.TemplateDelegate {
    const templatePath = `src/orders/templates/${templateName}`;
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    return handlebars.compile(templateSource);
  }
  async createNewOrder(createOrderDto: CreateOrderDto[]) {
    if (!createOrderDto.length) {
      throw new BadGatewayException('La orden no puede estar vacia');
    }

    for (const order of createOrderDto) {
      let totalPrice: number;

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

      if (order.discount) {
        totalPrice = product.price * order.count * 0.9;
      } else {
        totalPrice = product.price * order.count;
      }

      product.stock -= order.count;
      await this.productRepository.save(product);

      if (existingOrder) {
        const existingProductOrder = existingOrder.productsOrders.find(
          (po) => po.product === order.productId,
        );

        const withoutNewProduct = existingOrder.productsOrders.reduce(
          (acc, val) => {
            return (acc += val.count * val.price);
          },
          0,
        );

        if (order.discount) {
          console.log('Este ', withoutNewProduct);
          const newProductPrice = product.price * order.count;
          totalPrice = withoutNewProduct + newProductPrice;
          totalPrice *= 0.9;
        } else {
          totalPrice = withoutNewProduct + product.price * order.count;
        }

        existingOrder.total = totalPrice;

        await this.orderRepository.save(existingOrder);

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
          createdAt: new Date(),
          client: {
            id: order.clientId,
          },
          total: totalPrice,
          discount: order.discount,
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

        let deliveryDateFormat;

        const deliveryDate = orderDetails.deliveryDate?.toString().split('-');

        if (deliveryDateFormat) {
          deliveryDateFormat =
            deliveryDate[2] + '-' + deliveryDate[1] + '-' + deliveryDate[0];
        }
        const orderDate = orderDetails.orderDate.toString().split('-');

        const orderDateFormat =
          orderDate[2] + '-' + orderDate[1] + '-' + orderDate[0];

        return {
          id: orderDetails.id,
          client: orderDetails.client.nameAndLastname,
          deliveryDate: deliveryDateFormat || '',
          orderDate: orderDateFormat,
          send: orderDetails.send,
          total: orderDetails.total,
          discount: orderDetails.discount ? '10%' : '',
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
      relations: {
        client: true,
        productsOrders: true,
      },
    });

    findOrder.send = true;
    findOrder.deliveryDate = deliveryDate;
    const SESSION_FILE_PATH = 'session.json';

    const clientConfig = {
      puppeteer: { headless: true },
      authStrategy: new LocalAuth({ clientId: 'client-one' }),
    };

    const client = new Client(clientConfig);

    const html = this.loadTemplate('template.hbs');

    const findProduct = async (id: number) => {
      return await this.productRepository.findOne({
        where: {
          id: id,
        },
      });
    };

    const productPromises = findOrder.productsOrders.map(async (ctOrder) => {
      const product = await findProduct(ctOrder.product);
      return {
        product: product.productName,
        price: ctOrder.count * ctOrder.price,
        unitPrice: ctOrder.price,
        count: ctOrder.count,
      };
    });

    const productsOrder = await Promise.all(productPromises);

    const data = {
      clientName: findOrder.client.nameAndLastname,
      deliveryDate: deliveryDate,
      logoUrl: './Logo.png',
      productsOrder: productsOrder,
      total: findOrder.total,
      discount: findOrder.discount,
    };

    const pdfPath = 'Orden.pdf';

    const compiledHtml = html(data);

    htmlToPdf.create(compiledHtml).toFile(pdfPath, async (err) => {
      if (err) return console.log(err);

      client.on('authenticated', (session) => {
        if (session) {
          fs.writeFileSync(SESSION_FILE_PATH, JSON.stringify(session));
        }
      });

      client.on('qr', (qr) => {
        console.log('QR Code received', qr);
      });

      client.on('ready', async () => {
        console.log('Client is ready!');

        const number = `+549${findOrder.client.phone}`;
        const chatId = number.substring(1) + '@c.us';

        const media = MessageMedia.fromFilePath(pdfPath);
        await client.sendMessage(
          chatId,
          `Hola ${findOrder.client.nameAndLastname}, nos comunicamos desde Ferraro Materiales para recordarle que su pedido será enviado el día de la fecha. Esperemos que tenga una buena jornada.`,
          {
            media,
          },
        );

        /*   await this.orderRepository.save(findOrder); */
      });

      client.initialize();
    });

    return `Pedido marcado como enviado el día ${deliveryDate}`;
  }

  async deleteProductOrder(orderId: number, productId: number) {
    if (!orderId) {
      throw new BadGatewayException('El id no puede estar vacio');
    }

    console.log(orderId, productId);

    const productOrder = await this.productsOrdersRepository.findOne({
      relations: {
        order: true,
      },
      where: {
        order: {
          id: orderId,
        },
        product: productId,
      },
    });
    if (!productOrder) {
      throw new NotFoundException(
        `El producto con ID ${productId} no está en la orden con ID ${orderId}`,
      );
    }

    const order = productOrder.order;
    if (order.discount) {
      order.total -= productOrder.count * productOrder.price * 0.9;
    } else {
      order.total -= productOrder.count * productOrder.price;
    }
    await this.orderRepository.save(order);
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
      relations: {
        order: true,
      },
      where: {
        order: {
          id: orderId,
        },
        product: productId,
      },
    });

    const productsOrdersFindWithoutProductParams =
      await this.productsOrdersRepository.find({
        where: {
          order: {
            id: orderId,
          },
        },
      });

    const totalCountWithoutProductParams =
      productsOrdersFindWithoutProductParams.reduce((acc, val) => {
        if (val.product !== productId) {
          return acc + val.count * val.price;
        }
        return acc;
      }, 0);

    if (!productOrderFind) {
      throw new NotFoundException(
        'El producto en la orden no pudo ser encontrada',
      );
    }

    if (productOrderFind.order.discount) {
      const countNewProduct =
        count * productOrderFind.price + totalCountWithoutProductParams;
      productOrderFind.order.total = countNewProduct * 0.9;
    } else {
      const countNewProduct =
        count * productOrderFind.price + totalCountWithoutProductParams;
      productOrderFind.order.total = countNewProduct;
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
    await this.orderRepository.save(productOrderFind.order);
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

      monthlySales[month] += order.total;
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
