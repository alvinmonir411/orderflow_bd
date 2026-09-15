import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { StoresModule } from './modules/stores/stores.module.js';
import { ProductsModule } from './modules/products/products.module.js';
import { OrdersModule } from './modules/orders/orders.module.js';
import { WebhooksModule } from './modules/webhooks/webhooks.module.js';
import { BotEngineModule } from './modules/bot-engine/bot-engine.module.js';
import { CourierModule } from './modules/courier/courier.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    StoresModule,
    ProductsModule,
    OrdersModule,
    WebhooksModule,
    BotEngineModule,
    CourierModule,
  ],
})
export class AppModule {}
