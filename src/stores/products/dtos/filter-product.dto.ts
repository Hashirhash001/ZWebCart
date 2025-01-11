import {
  IsOptional,
  IsString,
  IsNumber,
  IsObject,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class FilterProductDto {
  @IsNotEmpty()
  @IsString()
  storeId: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseFloat(value) : null)) // Transform to float
  minPrice: number | null;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseFloat(value) : null)) // Transform to float
  maxPrice: number | null;

  @IsOptional()
  @IsObject()
  @Transform(({ value }) => {
    if (value == null) {
      return {}; // Default to an empty object if null or undefined
    }

    if (typeof value === 'string') {
      try {
        return JSON.parse(value); // Parse JSON string to object
      } catch {
        throw new SyntaxError('Invalid JSON format for attributes');
      }
    }

    if (typeof value === 'object') {
      return value; // Return as-is if it's already an object
    }

    throw new TypeError('Invalid attributes format'); // Handle unexpected types
  })
  attributes: Record<string, string>;
}
