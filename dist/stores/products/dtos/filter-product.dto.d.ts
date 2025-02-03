export declare class FilterProductDto {
    storeId: string;
    minPrice: number | null;
    maxPrice: number | null;
    attributes: Record<string, string>;
}
