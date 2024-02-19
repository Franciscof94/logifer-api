import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitType } from './entities/unittype.entity';
import { UnitTypeService } from './unitType.service';
import { UnitTypeController } from './unitType.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UnitType])],
  providers: [UnitTypeService],
  controllers: [UnitTypeController],
})
export class UnitTypeModule {}
