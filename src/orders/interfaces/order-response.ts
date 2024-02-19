export interface IOrdersResponse {
  orderDate: string;
  client: string;
  send: boolean;
  deliveryDate?: string;
  order: IOrder[];
}

interface IOrder {
  product: string;
  count: string;
  price: string;
}
