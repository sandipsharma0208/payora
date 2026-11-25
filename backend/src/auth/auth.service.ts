import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { SignupDto, LoginDto, SetPinDto } from "./dto/auth.dto";
import * as bcrypt from "bcryptjs";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.prisma.user.findFirst({
      where: { phoneNumber: dto.phoneNumber },
    });

    if (existing) {
      throw new ConflictException(
        "A user with this phone number already exists.",
      );
    }

    let pinHash: string | undefined;
    if (dto.pin) {
      pinHash = await bcrypt.hash(dto.pin, 10);
    }

    // Create user and initial multi-currency accounts inside an atomic transaction
    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          phoneNumber: dto.phoneNumber,
          fullName: dto.fullName,
          email: dto.email,
          pinHash,
          avatarUrl:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
        },
      });

      // Create primary USD account
      const usdAccount = await tx.account.create({
        data: {
          userId: newUser.id,
          name: "US Dollar Wallet",
          currency: "USD",
          type: "ASSET",
          isPrimary: true,
        },
      });

      // Create EUR account
      await tx.account.create({
        data: {
          userId: newUser.id,
          name: "Euro Wallet",
          currency: "EUR",
          type: "ASSET",
          isPrimary: false,
        },
      });

      // Create GBP account
      await tx.account.create({
        data: {
          userId: newUser.id,
          name: "British Pound Wallet",
          currency: "GBP",
          type: "ASSET",
          isPrimary: false,
        },
      });

      // Create JPY account
      await tx.account.create({
        data: {
          userId: newUser.id,
          name: "Japanese Yen Wallet",
          currency: "JPY",
          type: "ASSET",
          isPrimary: false,
        },
      });

      // Find or create Platform Reserve Account for balanced initial seeding
      let reserve = await tx.account.findFirst({
        where: { name: "Payora Central Reserve", type: "EQUITY" },
      });

      if (!reserve) {
        reserve = await tx.account.create({
          data: {
            name: "Payora Central Reserve",
            currency: "USD",
            type: "EQUITY",
            isPrimary: false,
          },
        });
      }

      // Initial funding transaction (Noor sample balance: $2,458.50)
      const initialTx = await tx.transaction.create({
        data: {
          senderId: newUser.id,
          type: "ADD_MONEY",
          status: "COMPLETED",
          description: "Welcome Bonus & Initial Deposit",
          metadata: { note: "Account opening credit" },
        },
      });

      // Double-entry entries:
      // Credit user asset (+2458.50), Debit reserve equity (-2458.50) => Sum = 0
      await tx.entry.createMany({
        data: [
          {
            transactionId: initialTx.id,
            accountId: usdAccount.id,
            amount: 2458.5,
            currency: "USD",
          },
          {
            transactionId: initialTx.id,
            accountId: reserve.id,
            amount: -2458.5,
            currency: "USD",
          },
        ],
      });

      return newUser;
    });

    const token = await this.generateToken(user);
    return {
      message: "Account created successfully",
      token,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        kycStatus: user.kycStatus,
      },
    };
  }

  async login(dto: LoginDto) {
    let user = await this.prisma.user.findFirst({
      where: { phoneNumber: dto.phoneNumber },
    });

    if (!user) {
      // Auto-provision demo user if test credentials
      return this.signup({
        phoneNumber: dto.phoneNumber,
        fullName: "Noor Mohammad",
        email: "noor@payora.example",
        pin: dto.pin || "12345",
      });
    }

    if (dto.pin && user.pinHash) {
      const match = await bcrypt.compare(dto.pin, user.pinHash);
      if (!match) {
        throw new UnauthorizedException("Invalid PIN");
      }
    }

    const token = await this.generateToken(user);
    return {
      message: "Login successful",
      token,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        kycStatus: user.kycStatus,
      },
    };
  }

  async setPin(userId: string, pin: string) {
    const pinHash = await bcrypt.hash(pin, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { pinHash },
    });
    return { message: "PIN set successfully" };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phoneNumber: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        kycStatus: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new BadRequestException("User not found");
    }
    return user;
  }

  private async generateToken(user: any): Promise<string> {
    return this.jwtService.signAsync({
      sub: user.id,
      phoneNumber: user.phoneNumber,
      fullName: user.fullName,
    });
  }
}
