import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  firebaseToken?: string;

  @IsString()
  @IsOptional()
  pin?: string;
}

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  firebaseToken?: string;

  @IsString()
  @IsOptional()
  pin?: string;
}

export class SetPinDto {
  @IsString()
  @Matches(/^\d{5}$/, { message: 'PIN must be exactly 5 digits' })
  pin: string;
}
