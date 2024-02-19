import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/products.entity';
import { UnitTypeModule } from './unitType/unitType.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), UnitTypeModule],
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}
