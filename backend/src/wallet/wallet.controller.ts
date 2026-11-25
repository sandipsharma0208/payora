import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get('accounts')
  async getAccounts(@Request() req) {
    return this.walletService.getUserAccounts(req.user.sub);
  }

  @Get('transactions')
  async getTransactions(@Request() req) {
    return this.walletService.getTransactionHistory(req.user.sub);
  }

  @Get('favorites')
  async getFavorites(@Request() req) {
    return this.walletService.getFavorites(req.user.sub);
  }

  @Get('rates')
  async getRates() {
    return this.walletService.getExchangeRates();
  }
}
