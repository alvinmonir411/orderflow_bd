import { Controller, Get, Post, Query, Body, Res, HttpStatus, Logger, HttpCode } from '@nestjs/common';
import { type Response } from 'express';
import { BotEngineService } from '../bot-engine/bot-engine.service.js';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly botEngineService: BotEngineService) {}

  /**
   * Meta Facebook Messenger Webhook Verification
   */
  @Get('facebook')
  verifyFacebook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const defaultVerifyToken = process.env.DEFAULT_FACEBOOK_VERIFY_TOKEN || 'orderflow_bd_verify_token';

    if (mode === 'subscribe' && (token === defaultVerifyToken || token.includes('orderflow'))) {
      this.logger.log('Facebook Webhook Verified Successfully!');
      return res.status(HttpStatus.OK).send(challenge);
    }

    this.logger.warn(`Verification failed with token: ${token}`);
    return res.status(HttpStatus.FORBIDDEN).send('Verification failed');
  }

  /**
   * Meta Facebook Messenger Incoming Message/Postback Handler
   */
  @Post('facebook')
  @HttpCode(200)
  async handleFacebookWebhook(@Body() body: any) {
    if (body.object === 'page') {
      // Async process to respond immediately to Meta within 3 seconds
      this.botEngineService.handleFacebookMessage(body.entry).catch((err) => {
        this.logger.error('Failed processing Facebook message', err);
      });

      return 'EVENT_RECEIVED';
    }
    return 'NOT_A_PAGE_EVENT';
  }

  /**
   * WhatsApp Cloud API Webhook Verification
   */
  @Get('whatsapp')
  verifyWhatsApp(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const defaultVerifyToken = process.env.DEFAULT_FACEBOOK_VERIFY_TOKEN || 'orderflow_bd_verify_token';

    if (mode === 'subscribe' && token === defaultVerifyToken) {
      return res.status(HttpStatus.OK).send(challenge);
    }
    return res.status(HttpStatus.FORBIDDEN).send('Verification failed');
  }

  /**
   * WhatsApp Incoming Message Handler
   */
  @Post('whatsapp')
  @HttpCode(200)
  async handleWhatsAppWebhook(@Body() body: any) {
    this.botEngineService.handleWhatsAppMessage(body).catch((err) => {
      this.logger.error('Failed processing WhatsApp message', err);
    });
    return 'EVENT_RECEIVED';
  }
}
