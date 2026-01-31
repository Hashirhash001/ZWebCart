import { PagesService } from './pages.service';
import { CreatePageDto } from './dtos/create-page.dto';
import { UpdatePageDto } from './dtos/update-page.dto';
import { AddSectionsToPageDto } from './dtos/add-sections-to-page.dto';
export declare class PagesController {
    private readonly pagesService;
    constructor(pagesService: PagesService);
    create(request: any, createPageDto: CreatePageDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            config: import("prisma/generated-store/runtime/library").JsonValue | null;
            themeId: number | null;
            title: string;
            slug: string;
        };
    }>;
    addSectionsToPage(pageId: number, data: AddSectionsToPageDto, req: Request): Promise<{
        success: boolean;
        message: string;
        data: {
            pageId: number;
            sectionId: number;
            order: number;
        }[];
    }>;
    findAll(request: any): Promise<{
        success: boolean;
        message: string;
        data: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            config: import("prisma/generated-store/runtime/library").JsonValue | null;
            themeId: number | null;
            title: string;
            slug: string;
        }[];
    }>;
    findOne(request: any, id: string): Promise<void>;
    update(request: any, id: string, updatePageDto: UpdatePageDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            config: import("prisma/generated-store/runtime/library").JsonValue | null;
            themeId: number | null;
            title: string;
            slug: string;
        };
    }>;
    remove(request: any, id: string): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
}
