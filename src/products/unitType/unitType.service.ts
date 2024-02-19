import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnitType } from './entities/unittype.entity';

@Injectable()
export class UnitTypeService {
  constructor(
    @InjectRepository(UnitType)
    private unitTypeRepository: Repository<UnitType>,
  ) {}

  async getUnitTypes() {
    const findUnitTypes = await this.unitTypeRepository.find();

    return findUnitTypes.map((ctUnit) => {
      return {
        isSelectCountDisabled: ctUnit.isSelectCountDisabled,
        equivalencyValue: ctUnit.equivalencyValue,
        value: ctUnit.id,
        label: ctUnit.unitTypeDescription,
      };
    });
  }
}
