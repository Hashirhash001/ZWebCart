import { IsString, IsOptional, IsJSON, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSectionDto } from '../../sections/dtos/create-section.dto';

export class CreatePageDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsInt()
  themeId?: number;

  @IsOptional()
  @IsJSON()
  config?: any;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSectionDto)
  sections?: CreateSectionDto[];
}
