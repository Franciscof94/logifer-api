import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersFiltersDto } from './dto/orders-filter.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('new-order')
  createNewOrder(@Body() createOrderDto: CreateOrderDto[]) {
    return this.ordersService.createNewOrder(createOrderDto);
  }

  @Get('')
  getOrders(@Query() filtersOptions: OrdersFiltersDto) {
    return this.ordersService.getOrders(filtersOptions);
  }

  @Post('mark-sent')
  markAsSent(@Body() markAsSentDto: { orderId: number; deliveryDate: Date }) {
    return this.ordersService.markAsSent(markAsSentDto);
  }

  @Delete('delete-product-order/:id')
  deleteProductOrder(@Param() productOrderId: { id: string }) {
    const { id } = productOrderId;
    return this.ordersService.deleteProductOrder(Number(id));
  }

  @Patch('edit-product-count/:id')
  editProductCount(
    @Param() productOrderId: { id: string },
    @Body() body: { count: number },
  ) {
    const { id } = productOrderId;
    const { count } = body;
    return this.ordersService.editProductCount({
      id: Number(id),
      count,
    });
  }

  @Get('report-sales/:id')
  getReportsBySales(@Param() yearReport: { id: number }) {
    const { id } = yearReport;
    return this.ordersService.getReportsBySales(id);
  }

  @Get('report-products/:productId/:year/:month')
  getReportsByProducts(
    @Param('productId') productId: number,
    @Param('year') year: number,
    @Param('month') month: number,
  ) {
    return this.ordersService.getReportsByProduct({ productId, year, month });
  }
}
