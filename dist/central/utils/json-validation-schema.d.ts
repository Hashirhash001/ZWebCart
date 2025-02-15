import { z } from "zod";
export declare const SectionSchema: z.ZodObject<{
    type: z.ZodString;
    order: z.ZodNumber;
    config: z.ZodOptional<z.ZodObject<{
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        height: z.ZodOptional<z.ZodString>;
        textAlign: z.ZodOptional<z.ZodEnum<["left", "center", "right"]>>;
        columns: z.ZodOptional<z.ZodNumber>;
        displayMode: z.ZodOptional<z.ZodEnum<["grid", "carousel"]>>;
        layout: z.ZodOptional<z.ZodEnum<["grid", "list", "slider"]>>;
        filterTypes: z.ZodOptional<z.ZodArray<z.ZodEnum<["price", "category", "brand"]>, "many">>;
        allowRatings: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        columns?: number;
        backgroundColor?: string;
        textColor?: string;
        height?: string;
        textAlign?: "left" | "center" | "right";
        displayMode?: "grid" | "carousel";
        layout?: "grid" | "list" | "slider";
        filterTypes?: ("category" | "price" | "brand")[];
        allowRatings?: boolean;
    }, {
        columns?: number;
        backgroundColor?: string;
        textColor?: string;
        height?: string;
        textAlign?: "left" | "center" | "right";
        displayMode?: "grid" | "carousel";
        layout?: "grid" | "list" | "slider";
        filterTypes?: ("category" | "price" | "brand")[];
        allowRatings?: boolean;
    }>>;
    content: z.ZodOptional<z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        subtitle: z.ZodOptional<z.ZodString>;
        imageUrl: z.ZodOptional<z.ZodString>;
        productIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        testimonials: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            quote: z.ZodString;
            imageUrl: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name?: string;
            imageUrl?: string;
            quote?: string;
        }, {
            name?: string;
            imageUrl?: string;
            quote?: string;
        }>, "many">>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        reviews: z.ZodOptional<z.ZodArray<z.ZodObject<{
            user: z.ZodString;
            rating: z.ZodNumber;
            comment: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            user?: string;
            rating?: number;
            comment?: string;
        }, {
            user?: string;
            rating?: number;
            comment?: string;
        }>, "many">>;
        location: z.ZodOptional<z.ZodObject<{
            lat: z.ZodNumber;
            lng: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            lat?: number;
            lng?: number;
        }, {
            lat?: number;
            lng?: number;
        }>>;
        links: z.ZodOptional<z.ZodArray<z.ZodObject<{
            platform: z.ZodString;
            url: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            url?: string;
            platform?: string;
        }, {
            url?: string;
            platform?: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        reviews?: {
            user?: string;
            rating?: number;
            comment?: string;
        }[];
        title?: string;
        productIds?: string[];
        subtitle?: string;
        imageUrl?: string;
        testimonials?: {
            name?: string;
            imageUrl?: string;
            quote?: string;
        }[];
        categories?: string[];
        location?: {
            lat?: number;
            lng?: number;
        };
        links?: {
            url?: string;
            platform?: string;
        }[];
    }, {
        reviews?: {
            user?: string;
            rating?: number;
            comment?: string;
        }[];
        title?: string;
        productIds?: string[];
        subtitle?: string;
        imageUrl?: string;
        testimonials?: {
            name?: string;
            imageUrl?: string;
            quote?: string;
        }[];
        categories?: string[];
        location?: {
            lat?: number;
            lng?: number;
        };
        links?: {
            url?: string;
            platform?: string;
        }[];
    }>>;
}, "strip", z.ZodTypeAny, {
    order?: number;
    config?: {
        columns?: number;
        backgroundColor?: string;
        textColor?: string;
        height?: string;
        textAlign?: "left" | "center" | "right";
        displayMode?: "grid" | "carousel";
        layout?: "grid" | "list" | "slider";
        filterTypes?: ("category" | "price" | "brand")[];
        allowRatings?: boolean;
    };
    type?: string;
    content?: {
        reviews?: {
            user?: string;
            rating?: number;
            comment?: string;
        }[];
        title?: string;
        productIds?: string[];
        subtitle?: string;
        imageUrl?: string;
        testimonials?: {
            name?: string;
            imageUrl?: string;
            quote?: string;
        }[];
        categories?: string[];
        location?: {
            lat?: number;
            lng?: number;
        };
        links?: {
            url?: string;
            platform?: string;
        }[];
    };
}, {
    order?: number;
    config?: {
        columns?: number;
        backgroundColor?: string;
        textColor?: string;
        height?: string;
        textAlign?: "left" | "center" | "right";
        displayMode?: "grid" | "carousel";
        layout?: "grid" | "list" | "slider";
        filterTypes?: ("category" | "price" | "brand")[];
        allowRatings?: boolean;
    };
    type?: string;
    content?: {
        reviews?: {
            user?: string;
            rating?: number;
            comment?: string;
        }[];
        title?: string;
        productIds?: string[];
        subtitle?: string;
        imageUrl?: string;
        testimonials?: {
            name?: string;
            imageUrl?: string;
            quote?: string;
        }[];
        categories?: string[];
        location?: {
            lat?: number;
            lng?: number;
        };
        links?: {
            url?: string;
            platform?: string;
        }[];
    };
}>;
