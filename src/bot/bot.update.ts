import { Action, Ctx, On, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { ChatGateway } from './ChatGateway';

@Update()
export class BotUpdate {
  constructor(private readonly botService: ChatGateway) {}

  private clientId: string;

  @Action(/client_\S+/)
  async handleCallback(@Ctx() ctx: Context) {
    const callbackData = ctx.callbackQuery['data'];
    const [_, clientId] = callbackData.split('_');
    console.log('Client ID:', clientId);

    if (clientId) {
      this.clientId = clientId;
      await ctx.reply('Clientga xabarni kiriting: ');
    }
  }

  @On('text')
  async onText(@Ctx() ctx: Context) {
    if (this.clientId && 'text' in ctx.message) {
      await this.botService.sendMessageToClient(
        this.clientId,
        ctx.message.text,
      );
      await ctx.reply('Xabar muvaffaqiyatli yuborildi !');
    } else {
      await ctx.reply('Client ID not found.');
    }
  }
}
