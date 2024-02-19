import { Controller, Get } from '@nestjs/common';
import { UnitTypeService } from './unitType.service';

@Controller('unittype')
export class UnitTypeController {
  constructor(private readonly unitTypeService: UnitTypeService) {}

  @Get('')
  getUnitTypes() {
    return this.unitTypeService.getUnitTypes();
  }
}
