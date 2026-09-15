import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller.js';
import { BotEngineModule } from '../bot-engine/bot-engine.module.js';

@Module({
  imports: [BotEngineModule],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
