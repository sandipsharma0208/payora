export interface CountryOption {
  code: string;
  name: string;
  dial: string;
  currency: string;
  currencyName: string;
}

export const COUNTRIES: CountryOption[] = [
  { code: 'US', name: 'United States', dial: '+1', currency: 'USD', currencyName: 'US Dollar' },
  { code: 'GB', name: 'United Kingdom', dial: '+44', currency: 'GBP', currencyName: 'British Pound' },
  { code: 'DE', name: 'Germany', dial: '+49', currency: 'EUR', currencyName: 'Euro' },
  { code: 'FR', name: 'France', dial: '+33', currency: 'EUR', currencyName: 'Euro' },
  { code: 'ES', name: 'Spain', dial: '+34', currency: 'EUR', currencyName: 'Euro' },
  { code: 'JP', name: 'Japan', dial: '+81', currency: 'JPY', currencyName: 'Japanese Yen' },
  { code: 'IN', name: 'India', dial: '+91', currency: 'INR', currencyName: 'Indian Rupee' },
  { code: 'AE', name: 'United Arab Emirates', dial: '+971', currency: 'AED', currencyName: 'UAE Dirham' },
  { code: 'BD', name: 'Bangladesh', dial: '+880', currency: 'BDT', currencyName: 'Bangladeshi Taka' },
];
