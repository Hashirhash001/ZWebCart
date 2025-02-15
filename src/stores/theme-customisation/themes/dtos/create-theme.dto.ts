import { IsNotEmpty, IsString, IsBoolean, IsInt } from 'class-validator';

export class CreateThemeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsInt()
  currentVersion: number;  // 🔹 Required for Prisma schema

  @IsNotEmpty()
  @IsString()
  templateUrl: string;

  @IsBoolean()
  isActive: boolean;
}
