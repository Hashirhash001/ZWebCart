import { PrismaClient } from '../../prisma/generated-store';
export declare class PrismaDynamicService {
    private clients;
    getClient(storeDbUrl: string): PrismaClient;
}
