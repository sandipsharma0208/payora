import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AiSupportService {
  private knowledgeBase = [
    {
      keywords: ['rate', 'exchange', 'currency', 'bdt', 'eur', 'gbp'],
      response: 'At Payora, we use the mid-market exchange rate with zero hidden markups! Current rates: 1 USD = 119.50 BDT, 0.92 EUR, 0.79 GBP, 151.20 JPY. Upfront fee is just $1.50 for transfers over $100.',
    },
    {
      keywords: ['limit', 'max', 'send'],
      response: 'Standard verified Payora accounts have a daily transfer limit of $10,000 USD and a monthly limit of $50,000 USD. You can increase your limits anytime in the KYC section.',
    },
    {
      keywords: ['fee', 'cost', 'charge'],
      response: 'Domestic Payora-to-Payora instant transfers under $100 are 100% free! Transfers of $100 and above have a flat $1.00 fee. International remittance has a flat $1.50 upfront fee.',
    },
    {
      keywords: ['face id', 'biometric', 'pin', 'security'],
      response: 'Payora uses hardware-level biometric encryption (Face ID / Touch ID) with expo-local-authentication and client-side secure enclave storage. Your face data never leaves your device.',
    },
    {
      keywords: ['kyc', 'verify', 'document', 'passport'],
      response: 'To complete Level 2 KYC verification, simply navigate to Settings > KYC Verification and take a photo of your Government ID / Passport and a quick 3D selfie. Approval takes under 3 minutes.',
    },
  ];

  generateResponse(query: string): string {
    const lower = query.toLowerCase();
    for (const item of this.knowledgeBase) {
      if (item.keywords.some((k) => lower.includes(k))) {
        return item.response;
      }
    }
    return 'Thank you for contacting Payora 24/7 AI Support! How can I assist you today with your multi-currency wallet, instant transfers, or account security?';
  }

  streamResponse(query: string): Observable<MessageEvent> {
    const fullText = this.generateResponse(query);
    const words = fullText.split(' ');

    return new Observable<MessageEvent>((subscriber) => {
      let index = 0;
      const interval = setInterval(() => {
        if (index < words.length) {
          const chunk = words[index] + (index === words.length - 1 ? '' : ' ');
          subscriber.next({
            data: JSON.stringify({ chunk, done: false }),
          } as MessageEvent);
          index++;
        } else {
          subscriber.next({
            data: JSON.stringify({ chunk: '', done: true }),
          } as MessageEvent);
          clearInterval(interval);
          subscriber.complete();
        }
      }, 40);

      return () => clearInterval(interval);
    });
  }
}
