import { IsArray, IsInt, Min } from 'class-validator';

export class AddSectionsToPageDto {
  @IsArray()
  sections: { sectionId: number; order: number }[];
}
