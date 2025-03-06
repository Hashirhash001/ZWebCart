import { CreateSectionDto } from './dtos/create-section.dto';
import { UpdateSectionDto } from './dtos/update-section.dto';
import { PrismaDynamicService } from '../../../prisma/prisma.service';
export declare class SectionsService {
    private readonly prismaDynamicService;
    constructor(prismaDynamicService: PrismaDynamicService);
    create(storeDbUrl: string, storeId: number, data: CreateSectionDto): Promise<{
        success: boolean;
        message: string;
        data: {
            order: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            config: import("prisma/generated-store/runtime/library").JsonValue | null;
            themeId: number | null;
            pageId: number | null;
            type: string;
            title: string | null;
            isGlobal: boolean;
            content: import("prisma/generated-store/runtime/library").JsonValue | null;
        };
    }>;
    findAll(storeDbUrl: string): Promise<{
        success: boolean;
        message: string;
        data: {
            order: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            config: import("prisma/generated-store/runtime/library").JsonValue | null;
            themeId: number | null;
            pageId: number | null;
            type: string;
            title: string | null;
            isGlobal: boolean;
            content: import("prisma/generated-store/runtime/library").JsonValue | null;
        }[];
    }>;
    findByTheme(storeDbUrl: string, themeId: number): Promise<{
        success: boolean;
        message: string;
        data: {
            order: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            config: import("prisma/generated-store/runtime/library").JsonValue | null;
            themeId: number | null;
            pageId: number | null;
            type: string;
            title: string | null;
            isGlobal: boolean;
            content: import("prisma/generated-store/runtime/library").JsonValue | null;
        }[];
    }>;
    findByPage(storeDbUrl: string, pageId: number): Promise<{
        success: boolean;
        message: string;
        data: {
            order: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            config: import("prisma/generated-store/runtime/library").JsonValue | null;
            themeId: number | null;
            pageId: number | null;
            type: string;
            title: string | null;
            isGlobal: boolean;
            content: import("prisma/generated-store/runtime/library").JsonValue | null;
        }[];
    }>;
    update(storeDbUrl: string, id: number, data: UpdateSectionDto): Promise<{
        success: boolean;
        message: string;
        data: {
            order: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            config: import("prisma/generated-store/runtime/library").JsonValue | null;
            themeId: number | null;
            pageId: number | null;
            type: string;
            title: string | null;
            isGlobal: boolean;
            content: import("prisma/generated-store/runtime/library").JsonValue | null;
        };
    }>;
    delete(storeDbUrl: string, id: number): Promise<{
        success: boolean;
        message: string;
        data: {
            order: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            config: import("prisma/generated-store/runtime/library").JsonValue | null;
            themeId: number | null;
            pageId: number | null;
            type: string;
            title: string | null;
            isGlobal: boolean;
            content: import("prisma/generated-store/runtime/library").JsonValue | null;
        };
    }>;
}
