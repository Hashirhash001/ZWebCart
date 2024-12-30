import {
  IsOptional,
  IsString,
  IsNumber,
  IsPositive,
  ValidateNested,
  ArrayMinSize,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

class Attribute {
  @IsString()
  key: string;

  @IsString()
  value: string;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number) // Converts to a number
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number) // Converts to a number
  @IsPositive()
  categoryId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number) // Converts to a number
  stock?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => Attribute)
  attributes: Attribute[];
}
