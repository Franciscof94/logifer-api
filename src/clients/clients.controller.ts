import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { ClientsService } from './clients.service';
import { ClientsFiltersDto } from './dto/clients-filter.dto';
import { IClient } from './interfaces/client.interface';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}
  @Post('new-client')
  createNewClient(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.createNewClient(createClientDto);
  }

  @Get('clients-options')
  getClientsOptions() {
    return this.clientsService.getClientsOptions();
  }

  @Delete('delete-client/:id')
  deleteClient(@Param() clientId: { id: number }) {
    const { id } = clientId;
    return this.clientsService.deleteClient(id);
  }

  @Patch('/edit-client/:id')
  editClient(@Param() clientId: number, @Body() client: IClient) {
    return this.clientsService.clientEdit({ clientId, client });
  }

  @Get('')
  getClients(@Query() filtersOptions: ClientsFiltersDto) {
    return this.clientsService.getClients(filtersOptions);
  }
}
