import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class AddToWishlistDto {
  @IsNotEmpty()
  @IsString()
  storeId: string;

  @IsInt()
  @IsPositive()
  productId: number;
}