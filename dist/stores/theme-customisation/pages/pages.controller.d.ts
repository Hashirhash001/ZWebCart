import { PagesService } from './pages.service';
import { CreatePageDto } from './dtos/create-page.dto';
import { UpdatePageDto } from './dtos/update-page.dto';
export declare class PagesController {
    private readonly pagesService;
    constructor(pagesService: PagesService);
    create(createPageDto: CreatePageDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updatePageDto: UpdatePageDto): string;
    remove(id: string): string;
}
