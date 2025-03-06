import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dtos/create-section.dto';
import { UpdateSectionDto } from './dtos/update-section.dto';
import { Request } from 'express';
export declare class SectionsController {
    private readonly sectionsService;
    constructor(sectionsService: SectionsService);
    create(request: Request, createSectionDto: CreateSectionDto): Promise<{
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
    findAll(request: Request): Promise<{
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
    findByTheme(request: Request, themeId: string): Promise<{
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
    findByPage(request: Request, pageId: string): Promise<{
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
    update(request: Request, id: string, updateSectionDto: UpdateSectionDto): Promise<{
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
    delete(request: Request, id: string): Promise<{
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
