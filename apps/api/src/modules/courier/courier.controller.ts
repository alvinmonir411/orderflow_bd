import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { CourierService } from './courier.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { GetUser } from '../auth/decorators/get-user.decorator.js';
import type { CurrentUserPayload } from '../auth/decorators/get-user.decorator.js';

@UseGuards(JwtAuthGuard)
@Controller('courier')
export class CourierController {
  constructor(private readonly courierService: CourierService) {}

  @Get('configs')
  getConfigs(@GetUser() user: CurrentUserPayload) {
    return this.courierService.getCourierConfigs(user.storeId);
  }

  @Post('configs')
  saveConfig(
    @GetUser() user: CurrentUserPayload,
    @Body()
    dto: {
      provider: 'STEADFAST' | 'PATHAO' | 'REDX';
      apiKey: string;
      apiSecret?: string;
      isDefault?: boolean;
    },
  ) {
    return this.courierService.saveCourierConfig(user.storeId, dto);
  }

  @Post('dispatch/steadfast/:orderId')
  dispatchSteadfast(
    @GetUser() user: CurrentUserPayload,
    @Param('orderId') orderId: string,
  ) {
    return this.courierService.dispatchToSteadfast(user.storeId, orderId);
  }

  @Post('dispatch/pathao/:orderId')
  dispatchPathao(
    @GetUser() user: CurrentUserPayload,
    @Param('orderId') orderId: string,
  ) {
    return this.courierService.dispatchToPathao(user.storeId, orderId);
  }
}
