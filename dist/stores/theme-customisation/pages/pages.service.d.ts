import { CreatePageDto } from './dtos/create-page.dto';
import { UpdatePageDto } from './dtos/update-page.dto';
import { PrismaDynamicService } from '../../../prisma/prisma.service';
import { AddSectionsToPageDto } from './dtos/add-sections-to-page.dto';
export declare class PagesService {
    private readonly prismaDynamicService;
    constructor(prismaDynamicService: PrismaDynamicService);
    create(storeDbUrl: string, data: CreatePageDto): Promise<{
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
    addSectionsToPage(storeDbUrl: string, pageId: number, data: AddSectionsToPageDto): Promise<{
        success: boolean;
        message: string;
        data: {
            pageId: number;
            sectionId: number;
            order: number;
        }[];
    }>;
    findAll(storeDbUrl: string): Promise<{
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
    findOne(storeDbUrl: string, id: number): Promise<void>;
    update(storeDbUrl: string, id: number, data: UpdatePageDto): Promise<{
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
    delete(storeDbUrl: string, id: number): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
}
