import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Payora double-entry ledger database...");

  // 1. Create or ensure Central Equity Reserve and Fee Revenue accounts
  const reserveAccount = await prisma.account.upsert({
    where: { id: "payora-central-reserve-usd" },
    update: {},
    create: {
      id: "payora-central-reserve-usd",
      name: "Payora Central Reserve",
      currency: "USD",
      type: "EQUITY",
      isPrimary: false,
    },
  });

  // 2. Create Noor Mohammad (Primary user matching screenshots)
  const pinHash = await bcrypt.hash("12345", 10);
  const noor = await prisma.user.upsert({
    where: { phoneNumber: "+14155550134" },
    update: { pinHash },
    create: {
      phoneNumber: "+14155550134",
      fullName: "Noor Mohammad",
      email: "noor@payora.example",
      pinHash,
      avatarUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
      kycStatus: "VERIFIED",
    },
  });

  // 3. Create Multi-Currency Accounts for Noor
  const usdAccount = await prisma.account.upsert({
    where: { userId_currency: { userId: noor.id, currency: "USD" } },
    update: {},
    create: {
      userId: noor.id,
      name: "US Dollar",
      currency: "USD",
      type: "ASSET",
      isPrimary: true,
    },
  });

  const eurAccount = await prisma.account.upsert({
    where: { userId_currency: { userId: noor.id, currency: "EUR" } },
    update: {},
    create: {
      userId: noor.id,
      name: "Euro",
      currency: "EUR",
      type: "ASSET",
      isPrimary: false,
    },
  });

  const gbpAccount = await prisma.account.upsert({
    where: { userId_currency: { userId: noor.id, currency: "GBP" } },
    update: {},
    create: {
      userId: noor.id,
      name: "British Pound",
      currency: "GBP",
      type: "ASSET",
      isPrimary: false,
    },
  });

  const jpyAccount = await prisma.account.upsert({
    where: { userId_currency: { userId: noor.id, currency: "JPY" } },
    update: {},
    create: {
      userId: noor.id,
      name: "Japanese Yen",
      currency: "JPY",
      type: "ASSET",
      isPrimary: false,
    },
  });

  // 4. Initial Balances via Balanced Double-Entry Transactions
  // US Dollar: $2,458.50
  await prisma.transaction.create({
    data: {
      senderId: noor.id,
      type: "ADD_MONEY",
      status: "COMPLETED",
      description: "Opening Balance Funding",
      entries: {
        create: [
          { accountId: usdAccount.id, amount: 2458.5, currency: "USD" },
          { accountId: reserveAccount.id, amount: -2458.5, currency: "USD" },
        ],
      },
    },
  });

  // Euro: €820.00
  await prisma.transaction.create({
    data: {
      senderId: noor.id,
      type: "ADD_MONEY",
      status: "COMPLETED",
      description: "EUR Opening Balance",
      entries: {
        create: [
          { accountId: eurAccount.id, amount: 820.0, currency: "EUR" },
          { accountId: reserveAccount.id, amount: -820.0, currency: "EUR" },
        ],
      },
    },
  });

  // British Pound: £315.40
  await prisma.transaction.create({
    data: {
      senderId: noor.id,
      type: "ADD_MONEY",
      status: "COMPLETED",
      description: "GBP Opening Balance",
      entries: {
        create: [
          { accountId: gbpAccount.id, amount: 315.4, currency: "GBP" },
          { accountId: reserveAccount.id, amount: -315.4, currency: "GBP" },
        ],
      },
    },
  });

  // Japanese Yen: ¥42,000
  await prisma.transaction.create({
    data: {
      senderId: noor.id,
      type: "ADD_MONEY",
      status: "COMPLETED",
      description: "JPY Opening Balance",
      entries: {
        create: [
          { accountId: jpyAccount.id, amount: 42000.0, currency: "JPY" },
          { accountId: reserveAccount.id, amount: -42000.0, currency: "JPY" },
        ],
      },
    },
  });

  // 5. Create Seeded Transactions matching Screenshot 05 (Inbox)
  const txs = [
    {
      desc: "Withdraw (LINKED BANK **4821)",
      type: "WITHDRAW",
      amount: -250.0,
      ref: "TX948ZWSOM",
      date: new Date(Date.now() - 3600000 * 2),
    },
    {
      desc: "Add Money (VISA DEBIT **0937)",
      type: "ADD_MONEY",
      amount: +300.0,
      ref: "TX938ZUMON",
      date: new Date(Date.now() - 3600000 * 5),
    },
    {
      desc: "Received Money (SOFIA MARTINEZ)",
      type: "TRANSFER",
      amount: +45.0,
      ref: "TX858IWC2H",
      date: new Date(Date.now() - 86400000),
    },
    {
      desc: "Send Abroad (AMMU)",
      type: "TRANSFER",
      amount: -200.0,
      ref: "TX833RMT4B",
      date: new Date(Date.now() - 86400000 * 2),
    },
    {
      desc: "Mobile Top-up (NOOR MOHAMMAD)",
      type: "MOBILE_TOPUP",
      amount: -20.0,
      ref: "TX817GZE5T",
      date: new Date(Date.now() - 86400000 * 3),
    },
  ];

  for (const t of txs) {
    await prisma.transaction.create({
      data: {
        referenceId: t.ref,
        senderId: noor.id,
        type: t.type as any,
        status: "COMPLETED",
        description: t.desc,
        createdAt: t.date,
        entries: {
          create: [
            { accountId: usdAccount.id, amount: t.amount, currency: "USD" },
            {
              accountId: reserveAccount.id,
              amount: -t.amount,
              currency: "USD",
            },
          ],
        },
      },
    });
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
