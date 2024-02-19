import { Client } from '../../clients/entities/clients.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Orders {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, name: 'client_id' })
  clientId: number;

  @Column({ type: 'varchar', length: 50 })
  address: string;

  @Column({ type: 'varchar', length: 50 })
  unit: string;

  @Column({ type: 'varchar', length: 50 })
  orderDate: string;

  @Column({ type: 'float' })
  count: number;

  @Column()
  product: number;

  @Column()
  send: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'date', nullable: true })
  deliveryDate: Date | null;

  @ManyToOne(() => Client, (client) => client.orders)
  @JoinColumn({ name: 'client_id', referencedColumnName: 'id' })
  client: Client;
}
