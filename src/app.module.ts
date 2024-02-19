import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { AppDataSource } from 'ormconfig';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { UserRolesModule } from './user-roles/user-roles.module';
import { ClientsModule } from './clients/clients.module';
import { UnitType } from './products/unitType/entities/unittype.entity';
import { ConfigurationModule } from './configuration/configuration.module';

@Module({
  imports: [
    ConfigurationModule,
    TypeOrmModule.forRoot(AppDataSource.options),
    AuthModule,
    UsersModule,
    ProductsModule,
    AuthModule,
    UserRolesModule,
    ClientsModule,
    OrdersModule,
    UnitType,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
