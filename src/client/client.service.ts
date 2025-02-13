import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client) private readonly clientRepo: Repository<Client>,
  ) {}

  async createOrUpdate(name: string, socketId: string) {
    let client = await this.clientRepo.findOne({ where: { name } });

    if (!client) {
      client = this.clientRepo.create({ name, socketId });
    } else {
      client.socketId = socketId;
    }

    await this.clientRepo.save(client);
  }

  async getClientSocketId(name: string): Promise<string | null> {
    const client = await this.clientRepo.findOne({ where: { name } });
    return client ? client.socketId : null;
  }

  async setClientOffline(username: string) {
    await this.clientRepo.update({ name: username }, { socketId: null });
  }
}
