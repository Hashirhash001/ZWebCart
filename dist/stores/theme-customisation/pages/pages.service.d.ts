import { CreatePageDto } from './dtos/create-page.dto';
import { UpdatePageDto } from './dtos/update-page.dto';
export declare class PagesService {
    create(createPageDto: CreatePageDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updatePageDto: UpdatePageDto): string;
    remove(id: number): string;
}
