import { CreateSectionDto } from '../../sections/dtos/create-section.dto';
export declare class CreatePageDto {
    title: string;
    slug: string;
    themeId?: number;
    config?: any;
    sections?: CreateSectionDto[];
}
