import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculates current balances for all accounts owned by a user
   * by dynamically summing entries. Invariant: Balance = SUM(Entry.amount)
   */
  async getUserAccounts(userId: string) {
    const accounts = await this.prisma.account.findMany({
      where: { userId, isActive: true },
      include: {
        entries: {
          select: {
            amount: true,
          },
        },
      },
      orderBy: { isPrimary: 'desc' },
    });

    const rates: Record<string, number> = {
      USD: 1.0,
      EUR: 0.92,
      GBP: 0.79,
      JPY: 151.2,
      BDT: 119.5,
    };

    const flags: Record<string, string> = {
      USD: '🇺🇸',
      EUR: '🇪🇺',
      GBP: '🇬🇧',
      JPY: '🇯🇵',
      BDT: '🇧🇩',
    };

    return accounts.map((account) => {
      // Calculate dynamic balance from immutable ledger entries
      const totalAmount = account.entries.reduce((sum, entry) => {
        return sum + Number(entry.amount);
      }, 0);

      return {
        id: account.id,
        name: account.name,
        currency: account.currency,
        balance: totalAmount,
        formattedBalance: this.formatCurrency(totalAmount, account.currency),
        isPrimary: account.isPrimary,
        rateToUsd: rates[account.currency] || 1.0,
        flag: flags[account.currency] || '🌐',
      };
    });
  }

  async getTransactionHistory(userId: string) {
    // Find all accounts owned by the user
    const userAccounts = await this.prisma.account.findMany({
      where: { userId },
      select: { id: true },
    });
    const accountIds = userAccounts.map((a) => a.id);

    // Fetch transactions containing entries affecting the user's accounts
    const transactions = await this.prisma.transaction.findMany({
      where: {
        entries: {
          some: {
            accountId: { in: accountIds },
          },
        },
      },
      include: {
        entries: {
          include: {
            account: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return transactions.map((tx) => {
      // Find the user's entry in this transaction
      const userEntry = tx.entries.find((e) => accountIds.includes(e.accountId));
      const amount = userEntry ? Number(userEntry.amount) : 0;

      return {
        id: tx.id,
        referenceId: tx.referenceId,
        type: tx.type,
        status: tx.status,
        description: tx.description,
        note: tx.note,
        amount,
        formattedAmount: (amount >= 0 ? '+' : '') + this.formatCurrency(amount, userEntry?.currency || 'USD'),
        currency: userEntry?.currency || 'USD',
        createdAt: tx.createdAt,
      };
    });
  }

  async getFavorites(userId: string) {
    return [
      { id: '1', name: 'Mom', phone: '+1 555 019 2831', avatarInitial: 'M', color: '#81C784' },
      { id: '2', name: 'Sofia Marti..', phone: '+1 555 018 7722', avatarInitial: 'S', color: '#BA68C8' },
      { id: '3', name: 'Daniel Kim', phone: '+1 555 014 9912', avatarInitial: 'D', color: '#F06292' },
    ];
  }

  async getExchangeRates() {
    return {
      base: 'USD',
      rates: {
        USD: 1.0,
        EUR: 0.92,
        GBP: 0.79,
        JPY: 151.2,
        BDT: 119.5,
      },
      updatedAt: new Date().toISOString(),
    };
  }

  private formatCurrency(amount: number, currency: string): string {
    const symMap: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      BDT: '৳',
    };
    const sym = symMap[currency] || currency + ' ';
    const isNegative = amount < 0;
    const absVal = Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: currency === 'JPY' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2,
    });
    return (isNegative ? '-' : '') + sym + absVal;
  }
}
