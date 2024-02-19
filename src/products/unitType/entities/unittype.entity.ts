import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UnitType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  unitTypeDescription: string;

  @Column({ type: 'decimal', precision: 5, scale: 3 })
  equivalencyValue: number;

  @Column()
  isSelectCountDisabled: boolean;
}
