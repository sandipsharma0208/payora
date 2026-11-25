export interface CurrencyBalance {
  id: string;
  currency: string;
  name: string;
  balance: number;
  isPrimary: boolean;
  rateToUsd?: number;
  flagSymbol: string;
}
