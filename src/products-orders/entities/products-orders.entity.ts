import { Orders } from 'src/orders/entities/orders.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class ProductsOrders {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float' })
  price: number;

  @Column({ type: 'float' })
  count: number;

  @Column()
  product: number;

  @ManyToOne(() => Orders, (orders) => orders.productsOrders)
  @JoinColumn({ name: 'order_id', referencedColumnName: 'id' })
  order: Orders;
}
