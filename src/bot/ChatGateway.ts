import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { BOT_NAME } from './app.constant';
import { ClientService } from '../client/client.service';
import { Public } from '../common/decorators/public.decorator';

@Public()
@WebSocketGateway(3004, {
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @InjectBot(BOT_NAME) private readonly bot: Telegraf,
    private readonly clientService: ClientService,
  ) {}

  @WebSocketServer() server: Server;
  private clientSockets: Map<string, string> = new Map();

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    for (const [username, socketId] of this.clientSockets.entries()) {
      if (socketId === client.id) {
        this.clientSockets.delete(username);
        await this.clientService.setClientOffline(username);
        console.log(`Client disconnected: ${username}`);
        break;
      }
    }
  }

  @SubscribeMessage('join')
  async handleJoin(client: Socket, username: string) {
    this.clientSockets.set(username, client.id);
    await this.clientService.createOrUpdate(username, client.id);
    console.log(`${username} ulandi. Yangi socket ID: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    client: Socket,
    data: { username: string; message: string },
  ) {
    console.log(`${data.username}: ${data.message} | Socket ID: ${client.id}`);

    const existingSocketId = this.clientSockets.get(data.username);
    if (!existingSocketId || existingSocketId !== client.id) {
      this.clientSockets.set(data.username, client.id);
      await this.clientService.createOrUpdate(data.username, client.id);
      console.log(`${data.username} socket ID yangilandi: ${client.id}`);
    }

    await this.sendMessageToBot(data.message, data.username);
  }

  async sendMessageToBot(message: string, username: string): Promise<void> {
    try {
      await this.bot.telegram.sendMessage(
        process.env.ADMIN_ID,
        `New message from ${username}:\n${message}`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Javob qaytarish',
                  callback_data: `client_${username}`,
                },
              ],
            ],
          },
        },
      );
    } catch (error) {
      console.error('Error sending message to bot:', error);
    }
  }

  async sendMessageToClient(username: string, message: string) {
    let clientSocketId = this.clientSockets.get(username);

    if (!clientSocketId) {
      clientSocketId = await this.clientService.getClientSocketId(username);
      if (!clientSocketId) {
        console.error(`Client socket not found for username: ${username}`);
        return;
      }
      this.clientSockets.set(username, clientSocketId);
    }

    this.server.to(clientSocketId).emit('clientReply', message);
  }
}
