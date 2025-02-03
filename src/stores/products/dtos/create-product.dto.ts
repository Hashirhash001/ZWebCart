import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  ValidateNested,
  ArrayMinSize,
  IsArray,
  IsObject,
  IsOptional
} from 'class-validator';
import { Type } from 'class-transformer';

class Attribute {
  @IsNotEmpty()
  @IsString()
  key: string;

  @IsNotEmpty()
  @IsString()
  value: string;
}

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @IsPositive()
  price: number;

  @IsOptional()  // Make it optional, you can omit if no comparePrice is provided
  @IsNumber()
  @Type(() => Number)
  @IsPositive()
  comparePrice?: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @IsPositive()
  categoryId: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  stock: number;

  // Ensure `attributes` is an array of objects, each having `key` and `value`
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => Attribute)
  attributes: Attribute[];
}
