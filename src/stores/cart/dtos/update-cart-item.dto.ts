import { IsInt, IsNotEmpty, IsPositive, IsString, Min } from 'class-validator';

export class UpdateCartItemDto {
  @IsNotEmpty()
  @IsString()
  storeId: string;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  productId: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;
}