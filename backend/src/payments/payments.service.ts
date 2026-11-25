import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { TransferDto, TopupDto, SendAbroadQuoteDto } from "./dto/payment.dto";
import * as bcrypt from "bcryptjs";

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Executes atomic transfer between accounts adhering strictly to double-entry ledger.
   * Net balance change of all entries created MUST equal 0.
   */
  async executeTransfer(senderUserId: string, dto: TransferDto) {
    const currency = (dto.currency || "USD") as any;

    // 1. Verify Sender and PIN
    const sender = await this.prisma.user.findUnique({
      where: { id: senderUserId },
      include: {
        accounts: {
          where: { currency, isActive: true },
          include: { entries: true },
        },
      },
    });

    if (!sender) {
      throw new NotFoundException("Sender user not found");
    }

    if (dto.pin && sender.pinHash) {
      const pinMatch = await bcrypt.compare(dto.pin, sender.pinHash);
      if (!pinMatch) {
        throw new BadRequestException("Incorrect 5-digit PIN");
      }
    }

    const senderAccount = sender.accounts[0];
    if (!senderAccount) {
      throw new BadRequestException(
        `No active ${currency} wallet found for sender`,
      );
    }

    // 2. Calculate balance by summing entries (Overdraft Protection)
    const currentBalance = senderAccount.entries.reduce(
      (sum, e) => sum + Number(e.amount),
      0,
    );
    const transferAmount = Number(dto.amount);
    const fee = transferAmount >= 100 ? 1.0 : 0.0; // Small transparent fee for large transactions

    if (currentBalance < transferAmount) {
      throw new BadRequestException(
        `Insufficient funds. Current balance: ${senderAccount.currency} ${currentBalance.toFixed(2)}, required: ${transferAmount.toFixed(2)}`,
      );
    }

    // 3. Find recipient (by phone, ID, or email)
    let recipient = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phoneNumber: dto.recipientPhoneOrId },
          { id: dto.recipientPhoneOrId },
          { email: dto.recipientPhoneOrId },
        ],
      },
      include: {
        accounts: {
          where: { currency, isActive: true },
        },
      },
    });

    // Auto-create recipient demo user if transferring to a new phone number
    if (!recipient) {
      recipient = await this.prisma.user.create({
        data: {
          phoneNumber: dto.recipientPhoneOrId,
          fullName: "Recipient (" + dto.recipientPhoneOrId.slice(-4) + ")",
          accounts: {
            create: {
              name: `${currency} Wallet`,
              currency,
              type: "ASSET",
              isPrimary: true,
            },
          },
        },
        include: { accounts: true },
      });
    }

    let recipientAccount = recipient.accounts[0];
    if (!recipientAccount) {
      recipientAccount = await this.prisma.account.create({
        data: {
          userId: recipient.id,
          name: `${currency} Wallet`,
          currency,
          type: "ASSET",
          isPrimary: true,
        },
      });
    }

    // 4. Find or create Platform Fee Revenue Account
    let feeAccount = await this.prisma.account.findFirst({
      where: { name: "Payora Transfer Fee Revenue", type: "REVENUE" },
    });

    if (!feeAccount && fee > 0) {
      feeAccount = await this.prisma.account.create({
        data: {
          name: "Payora Transfer Fee Revenue",
          currency,
          type: "REVENUE",
          isPrimary: false,
        },
      });
    }

    // 5. ATOMIC PRISMA TRANSACTION: Ledger entries MUST sum to 0
    const result = await this.prisma.$transaction(async (tx) => {
      // Create master transaction record
      const transaction = await tx.transaction.create({
        data: {
          senderId: sender.id,
          type: "TRANSFER",
          status: "COMPLETED",
          description: `Transfer to ${recipient.fullName}`,
          note: dto.note || "Payora Instant Transfer",
          metadata: {
            recipientId: recipient.id,
            recipientPhone: recipient.phoneNumber,
            recipientName: recipient.fullName,
            amount: transferAmount,
            fee,
            currency,
          },
        },
      });

      const entriesToCreate: any[] = [
        // Sender Debit (negative)
        {
          transactionId: transaction.id,
          accountId: senderAccount.id,
          amount: -transferAmount,
          currency,
        },
        // Recipient Credit (positive)
        {
          transactionId: transaction.id,
          accountId: recipientAccount.id,
          amount: +(transferAmount - fee),
          currency,
        },
      ];

      // Platform Fee Entry (positive revenue) if fee > 0
      if (fee > 0 && feeAccount) {
        entriesToCreate.push({
          transactionId: transaction.id,
          accountId: feeAccount.id,
          amount: +fee,
          currency,
        });
      }

      await tx.entry.createMany({
        data: entriesToCreate,
      });

      // Verify zero-sum invariant strictly:
      const sum = entriesToCreate.reduce((acc, curr) => acc + curr.amount, 0);
      if (Math.abs(sum) > 0.0001) {
        throw new Error(
          `CRITICAL: Ledger double-entry invariant violated! Entries sum to ${sum}`,
        );
      }

      return transaction;
    });

    const newSenderBalance = currentBalance - transferAmount;

    return {
      success: true,
      transactionId: result.id,
      referenceId: result.referenceId,
      amount: transferAmount,
      fee,
      currency,
      recipientName: recipient.fullName,
      recipientPhone: recipient.phoneNumber,
      newBalance: newSenderBalance,
      timestamp: result.createdAt,
    };
  }

  async executeTopup(userId: string, dto: TopupDto) {
    const currency = (dto.currency || "USD") as any;
    const amount = Number(dto.amount);

    let userAccount = await this.prisma.account.findFirst({
      where: { userId, currency, isActive: true },
    });

    if (!userAccount) {
      userAccount = await this.prisma.account.create({
        data: {
          userId,
          name: `${currency} Wallet`,
          currency,
          type: "ASSET",
          isPrimary: true,
        },
      });
    }

    let reserveAccount = await this.prisma.account.findFirst({
      where: { name: "Payora External Gateway Clearing", type: "LIABILITY" },
    });

    if (!reserveAccount) {
      reserveAccount = await this.prisma.account.create({
        data: {
          name: "Payora External Gateway Clearing",
          currency,
          type: "LIABILITY",
          isPrimary: false,
        },
      });
    }

    const transaction = await this.prisma.$transaction(async (tx) => {
      const newTx = await tx.transaction.create({
        data: {
          senderId: userId,
          type: "ADD_MONEY",
          status: "COMPLETED",
          description: `Add Money (${dto.paymentMethod || "Linked Card"})`,
          metadata: { amount, currency, method: dto.paymentMethod },
        },
      });

      // Double-entry: User Asset (+amount), External Gateway Clearing (-amount) => Sum = 0
      await tx.entry.createMany({
        data: [
          {
            transactionId: newTx.id,
            accountId: userAccount.id,
            amount: +amount,
            currency,
          },
          {
            transactionId: newTx.id,
            accountId: reserveAccount.id,
            amount: -amount,
            currency,
          },
        ],
      });

      return newTx;
    });

    return {
      success: true,
      transactionId: transaction.id,
      amount,
      currency,
      message: `Successfully added ${currency} ${amount.toFixed(2)} to your wallet`,
    };
  }

  getSendAbroadQuote(dto: SendAbroadQuoteDto) {
    const exchangeRates: Record<string, number> = {
      "USD-BDT": 119.5,
      "USD-EUR": 0.92,
      "USD-GBP": 0.79,
      "USD-JPY": 151.2,
      "EUR-BDT": 129.8,
      "GBP-BDT": 151.4,
    };

    const pair = `${dto.fromCurrency}-${dto.toCurrency}`;
    const rate = exchangeRates[pair] || 1.0;
    const upfrontFee = 1.5; // Low upfront fee as shown in promo banner
    const netSendAmount = Math.max(0, dto.sendAmount - upfrontFee);
    const recipientReceives = Number((netSendAmount * rate).toFixed(2));

    return {
      sendAmount: dto.sendAmount,
      fromCurrency: dto.fromCurrency,
      recipientReceives,
      toCurrency: dto.toCurrency,
      exchangeRate: rate,
      upfrontFee,
      guaranteedDuration: "Within 5 minutes",
      savingVsBanks: "You save $18.50 compared to standard bank wires",
    };
  }
}
