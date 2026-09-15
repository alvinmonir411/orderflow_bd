import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) {}

  async getStoreProfile(storeId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      include: {
        courierAccounts: true,
        smsConfig: true,
      },
    });

    if (!store) {
      throw new NotFoundException('দোকানের তথ্য পাওয়া যায়নি');
    }

    return store;
  }

  async updateFacebookConfig(
    storeId: string,
    dto: {
      facebookPageId: string;
      facebookPageToken: string;
      facebookVerifyToken?: string;
    },
  ) {
    return this.prisma.store.update({
      where: { id: storeId },
      data: {
        facebookPageId: dto.facebookPageId,
        facebookPageToken: dto.facebookPageToken,
        facebookVerifyToken: dto.facebookVerifyToken || 'orderflow_bd_verify_token',
      },
    });
  }

  async updateWhatsAppConfig(
    storeId: string,
    dto: {
      whatsappPhoneId: string;
      whatsappToken: string;
    },
  ) {
    return this.prisma.store.update({
      where: { id: storeId },
      data: {
        whatsappPhoneId: dto.whatsappPhoneId,
        whatsappToken: dto.whatsappToken,
      },
    });
  }
}
