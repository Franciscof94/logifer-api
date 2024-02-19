import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../../auth/entities/role.entity';
import { Users } from '../../users/entities/users.entity';

@Entity()
@Index('UQ_USER_ROLE', ['userId', 'roleId'], {
  unique: true,
})
export class UserRole {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Users, (user) => user.userRoles)
  user: Users;

  @Column({ nullable: false })
  userId: number;

  @ManyToOne(() => Role, (role) => role.userRoles)
  role: Role;

  @Column({ nullable: false })
  roleId: number;

  /*   @ManyToOne(() => Institucion, { eager: false })
  institucion: Institucion; */

  /*  @Column({ nullable: false })
  institucionId: number; */
}
