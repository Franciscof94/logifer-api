import { DataSource, DeepPartial } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { UnitType } from '../../products/unitType/entities/unittype.entity';

interface UnitTypeSeed {
  id: number;
  unitTypeDescripcion: string;
  equivalencyValue: number;
  isSelectCountDisabled: boolean;
}

export enum UniTypeEnum {
  'bolson' = 1,
  'pallet' = 2,
  'metros' = 3,
  'unidad/es' = 4,
  '1/4' = 5,
  '1/2' = 6,
  '3/4' = 7,
}

const UNIT_TYPE: UnitTypeSeed[] = [
  {
    id: UniTypeEnum.bolson,
    unitTypeDescripcion: 'Bolson',
    equivalencyValue: 1,
    isSelectCountDisabled: false,
  },
  {
    id: UniTypeEnum.metros,
    unitTypeDescripcion: 'Metro/s',
    equivalencyValue: 1,
    isSelectCountDisabled: false,
  },
  {
    id: UniTypeEnum.pallet,
    unitTypeDescripcion: 'Pallet/S',
    equivalencyValue: 1,
    isSelectCountDisabled: false,
  },
  {
    id: UniTypeEnum['unidad/es'],
    unitTypeDescripcion: 'Unidad/es',
    equivalencyValue: 1,
    isSelectCountDisabled: false,
  },
  {
    id: UniTypeEnum['1/4'],
    unitTypeDescripcion: '1/4',
    equivalencyValue: 0.25,
    isSelectCountDisabled: true,
  },
  {
    id: UniTypeEnum['1/2'],
    unitTypeDescripcion: '1/2',
    equivalencyValue: 0.5,
    isSelectCountDisabled: true,
  },
  {
    id: UniTypeEnum['3/4'],
    unitTypeDescripcion: '3/4',
    equivalencyValue: 0.75,
    isSelectCountDisabled: true,
  },
];

export class UnitTypeSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const unitTypeRepository = dataSource.getRepository(UnitType);

    for (const a of UNIT_TYPE) {
      let unitType = await unitTypeRepository.findOneBy({
        id: a.id,
      });

      if (!unitType) {
        unitType = unitTypeRepository.create({
          id: a.id,
          unitTypeDescription: a.unitTypeDescripcion,
          equivalencyValue: a.equivalencyValue,
          isSelectCountDisabled: a.isSelectCountDisabled,
        } as DeepPartial<UnitType>);
      }
      await unitTypeRepository.save(unitType);
    }
  }
}
