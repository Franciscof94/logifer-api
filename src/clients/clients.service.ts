import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from './entities/clients.entity';
import { Repository } from 'typeorm';
import { CreateClientDto } from './dto/create-client.dto';
import { ClientsFiltersDto } from './dto/clients-filter.dto';
import { OrderedPaginatedQueryOptions } from 'src/pagination/pagination-data.interface';
import { applyQueryFilters } from 'src/pagination/functions/apply-query-filters';
import { Pagination } from 'src/pagination/pagination.class';
import { getClientsFiltersApplier } from './functions/get-clients-filters-applier';
import { IClient } from './interfaces/client.interface';
import { Orders } from '../orders/entities/orders.entity';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(Orders)
    private ordersRepository: Repository<Orders>,
  ) {}

  async createNewClient(createClientDto: CreateClientDto) {
    if (!createClientDto) {
      throw new BadRequestException('El cliente no puede estar vacio');
    }

    const findClientByEmail = await this.clientRepository.findOne({
      where: {
        email: createClientDto.email,
      },
    });

    if (findClientByEmail) {
      throw new BadRequestException(
        'Ya existe un cliente registrado con el mismo email',
      );
    }
    const saveClient = await this.clientRepository.save(createClientDto);

    return saveClient;
  }

  async getClientsOptions() {
    const clients = await this.clientRepository.find();

    return clients.map((ctClient) => {
      return {
        address: ctClient.address,
        value: ctClient.id,
        label: ctClient.nameAndLastname,
      };
    });
  }

  async deleteClient(clientId: number) {
    if (!clientId) {
      throw new BadRequestException('El clientId no puede estar vacio');
    }

    const findOrders = await this.ordersRepository.find({
      where: {
        clientId: clientId,
      },
    });

    await this.ordersRepository.remove(findOrders);

    const findClient = await this.clientRepository.findOne({
      where: {
        id: clientId,
      },
    });

    if (!clientId) {
      throw new NotFoundException('El cliente no pudo ser encontrado');
    }

    await this.clientRepository.remove(findClient);

    return 'Cliente eliminado correctamente';
  }

  async clientEdit(clientData: { id: number; client: IClient }) {
    const { client, id } = clientData;

    if (!id && !client) {
      throw new BadRequestException(
        'El id y el cliente no pueden estar vacios',
      );
    }

    console.log(id);

    const findClient = await this.clientRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!findClient) {
      throw new NotFoundException('El cliente no pudo ser encontrado');
    }

    findClient.address = client.address;
    findClient.email = client.email;
    findClient.nameAndLastname = client.nameAndLastname;
    findClient.phone = client.phone;

    await this.clientRepository.save(findClient);

    return 'Cliente actualizado correctamente';
  }

  async getClients(filtersOptions: ClientsFiltersDto) {
    const pageOptions: OrderedPaginatedQueryOptions<Client> = {
      page: filtersOptions.page,
      size: filtersOptions.size,
    };

    let query = this.clientRepository.createQueryBuilder('client');

    const filters = await getClientsFiltersApplier(filtersOptions);
    query = await applyQueryFilters(query, filters);

    const clientsResponse = await Pagination.getPaginatedResponse(
      pageOptions,
      query,
      async (client: Client) => {
        return {
          nameAndLastname: client.nameAndLastname,
          email: client.email,
          address: client.address,
          phone: client.phone,
          id: client.id,
        };
      },
    );

    return clientsResponse;
  }
}
