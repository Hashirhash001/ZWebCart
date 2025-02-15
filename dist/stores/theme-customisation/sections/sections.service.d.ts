import { CreateSectionDto } from './dtos/create-section.dto';
import { UpdateSectionDto } from './dtos/update-section.dto';
export declare class SectionsService {
    create(createSectionDto: CreateSectionDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateSectionDto: UpdateSectionDto): string;
    remove(id: number): string;
}
