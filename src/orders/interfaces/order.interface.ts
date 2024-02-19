export interface IOrder {
  address: string;
  client: number;
  count: number;
  id: number;
  product: number;
  unit: string;
  deliveryDate?: Date;
}
