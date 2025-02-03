import { IsNotEmpty, IsString, IsOptional, IsArray, IsInt } from 'class-validator';

export class CreateCollectionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class AddProductsToCollectionDto {
  @IsNotEmpty()
  @IsInt({ each: true })
  productIds: number[];
}
