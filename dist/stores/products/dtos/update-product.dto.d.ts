declare class Attribute {
    key: string;
    value: string;
}
export declare class UpdateProductDto {
    name?: string;
    description?: string;
    price?: number;
    comparePrice?: number;
    categoryId?: number;
    stock?: number;
    attributes: Attribute[];
}
export {};
