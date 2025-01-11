import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class UpdateWishlistItemDto {
  @IsNotEmpty()
  @IsString()
  storeId: string;

  @IsInt()
  @IsPositive()
  productId: number;
}