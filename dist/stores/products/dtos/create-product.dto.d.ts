declare class Attribute {
    key: string;
    value: string;
}
export declare class CreateProductDto {
    name: string;
    description: string;
    price: number;
    comparePrice?: number;
    categoryId: number;
    stock: number;
    attributes: Attribute[];
}
export {};
