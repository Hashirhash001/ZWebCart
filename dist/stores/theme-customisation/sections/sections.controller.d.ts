import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dtos/create-section.dto';
import { UpdateSectionDto } from './dtos/update-section.dto';
export declare class SectionsController {
    private readonly sectionsService;
    constructor(sectionsService: SectionsService);
    create(createSectionDto: CreateSectionDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateSectionDto: UpdateSectionDto): string;
    remove(id: string): string;
}
