import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { ServeStaticModule } from '@nestjs/serve-static/dist/serve-static.module';
import { join } from 'path';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { UserRolesModule } from './user-roles/user-roles.module';
import { ClientsModule } from './clients/clients.module';
import { UnitType } from './products/unitType/entities/unittype.entity';
import { ConfigurationModule } from './configuration/configuration.module';
import config from '../ormconfig';
import { ProductsOrders } from './products-orders/entities/products-orders.entity';

@Module({
  imports: [
    ConfigurationModule,
    TypeOrmModule.forRoot(config),
    AuthModule,
    UsersModule,
    ProductsModule,
    AuthModule,
    UserRolesModule,
    ClientsModule,
    OrdersModule,
    UnitType,
    ProductsOrders,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '../public'),
      serveRoot: '/public/',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
