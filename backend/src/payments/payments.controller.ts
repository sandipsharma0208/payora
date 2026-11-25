import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { TransferDto, TopupDto, SendAbroadQuoteDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post()
  async transfer(@Request() req, @Body() dto: TransferDto) {
    return this.paymentsService.executeTransfer(req.user.sub, dto);
  }

  @Post('topup')
  async topup(@Request() req, @Body() dto: TopupDto) {
    return this.paymentsService.executeTopup(req.user.sub, dto);
  }

  @Post('quote')
  async quote(@Body() dto: SendAbroadQuoteDto) {
    return this.paymentsService.getSendAbroadQuote(dto);
  }
}
