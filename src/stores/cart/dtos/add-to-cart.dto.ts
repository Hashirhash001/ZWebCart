import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class AddToCartDto {
  @IsNotEmpty()
  @IsString()
  storeId: string;

  @IsNotEmpty()
  @IsInt({ message: 'productId must be an integer number' })
  @IsPositive({ message: 'productId must be a positive number' })
  productId: number;

  @IsNotEmpty()
  @IsInt({ message: 'quantity must be an integer number' })
  @IsPositive({ message: 'quantity must not be less than 1' })
  quantity: number;
}