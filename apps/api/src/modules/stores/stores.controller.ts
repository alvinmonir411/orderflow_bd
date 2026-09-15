import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { StoresService } from './stores.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { GetUser } from '../auth/decorators/get-user.decorator.js';
import type { CurrentUserPayload } from '../auth/decorators/get-user.decorator.js';

@UseGuards(JwtAuthGuard)
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get('profile')
  getProfile(@GetUser() user: CurrentUserPayload) {
    return this.storesService.getStoreProfile(user.storeId);
  }

  @Patch('facebook-config')
  updateFacebook(
    @GetUser() user: CurrentUserPayload,
    @Body()
    dto: {
      facebookPageId: string;
      facebookPageToken: string;
      facebookVerifyToken?: string;
    },
  ) {
    return this.storesService.updateFacebookConfig(user.storeId, dto);
  }

  @Patch('whatsapp-config')
  updateWhatsApp(
    @GetUser() user: CurrentUserPayload,
    @Body()
    dto: {
      whatsappPhoneId: string;
      whatsappToken: string;
    },
  ) {
    return this.storesService.updateWhatsAppConfig(user.storeId, dto);
  }
}
