import { IsString, IsNotEmpty, IsNumber, Min, IsOptional } from 'class-validator';

export class TransferDto {
  @IsString()
  @IsNotEmpty()
  recipientPhoneOrId: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  @IsOptional()
  pin?: string;
}

export class TopupDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;
}

export class SendAbroadQuoteDto {
  @IsNumber()
  @Min(1)
  sendAmount: number;

  @IsString()
  fromCurrency: string;

  @IsString()
  toCurrency: string;
}
