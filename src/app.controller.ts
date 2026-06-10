import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  info() {
    return {
      name: 'Retail ERP API',
      version: '1.0',
      docs: '/api/docs',
      status: 'running',
    };
  }
}
