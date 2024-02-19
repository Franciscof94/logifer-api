import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { RoleEnum } from '../../user-roles/enum/role.enum';
import { hashSync } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Users } from '../../users/entities/users.entity';

interface IUser {
  name: string;
  lastname: string;
  email: string;
  password: string;
  active: boolean;
  roles: { id: number }[];
}

const configService = new ConfigService();

export class UserSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const USERS: IUser[] = [
      {
        name: 'User',
        lastname: 'User',
        email: configService.get('INITIAL_EMAIL')
          ? configService.get('INITIAL_EMAIL')
          : 'user@user.com',
        password: configService.get('INITIAL_PASSWORD')
          ? configService.get('INITIAL_PASSWORD')
          : 'user',
        active: true,
        roles: [{ id: RoleEnum.USER }],
      },
    ];

    const usersRepository = dataSource.getRepository(Users);

    for (const u of USERS) {
      let user = await usersRepository.findOneBy({
        email: u.email,
      });

      const updateUser: IUser & { id?: number } = {
        ...u,
        password: hashSync(u.password, +configService.get('PASSWORD_SALT')),
      };

      if (user) {
        updateUser.id = user.id;
      }

      user = await usersRepository.save(updateUser);
    }
  }
}
