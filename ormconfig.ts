import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const config: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3001,
  username: process.env.DB_USER || 'avnadmin',
  password: process.env.DB_PASSWORD || 'AVNS_xakSZmrh84fL7tKvWbo',
  database: process.env.DB_NAME || 'defaultdb',
  ssl: {
    rejectUnauthorized: false,
  },
  synchronize: true,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
};

export default config;
