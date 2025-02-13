import { Module } from '@nestjs/common';
import { BotUpdate } from './bot.update';
import { ChatGateway } from './ChatGateway';
import { ClientModule } from '../client/client.module';

@Module({
  imports: [ClientModule],
  providers: [ChatGateway, BotUpdate],
  exports: [ChatGateway],
})
export class BotModule {}
