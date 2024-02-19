import { DataSource } from 'typeorm';
import { Seeder, runSeeder } from 'typeorm-extension';
import { UnitTypeSeeder } from './seeders/unitType.seeder';
import { UserSeeder } from './seeders/user.seeder';

export class MainSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    await runSeeder(dataSource, UnitTypeSeeder);
    await runSeeder(dataSource, UserSeeder);
  }
}

export const seedersClasses = [MainSeeder, UnitTypeSeeder, UserSeeder];
