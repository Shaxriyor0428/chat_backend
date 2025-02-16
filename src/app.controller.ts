import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';

@Controller()
export class AppController {
  @Get('data-deletion')
  getDataDeletion(@Res() res: Response) {
    const filePath = path.join(__dirname, '..', 'public', 'data-deletion.html');
    return res.sendFile(filePath);
  }
}
