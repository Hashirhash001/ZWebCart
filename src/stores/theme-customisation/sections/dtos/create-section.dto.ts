import { IsBoolean, IsInt, IsOptional, IsString, IsJSON } from 'class-validator';

export class CreateSectionDto {
  @IsString() // Ensures 'type' is a string
  type: string;

  @IsOptional() // 'title' is optional
  @IsString()
  title?: string;

  @IsInt() // 'order' determines section placement on a page
  order: number;

  @IsOptional()
  @IsBoolean() // Determines if the section is globally used
  isGlobal?: boolean;

  @IsOptional()
  @IsInt() // References the page to which the section belongs
  pageId?: number;

  @IsOptional()
  @IsInt() // References the theme this section is associated with
  themeId?: number;

  @IsOptional()
  @IsJSON() // Holds section-specific configuration settings
  config?: any;

  @IsOptional()
  @IsJSON() // Stores dynamic content such as text, images, etc.
  content?: any;
}