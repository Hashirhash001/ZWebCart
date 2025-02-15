import { z } from "zod";

export const SectionSchema = z.object({
    type: z.string(),
    order: z.number().min(1),
    config: z.object({
        backgroundColor: z.string().optional(),
        textColor: z.string().optional(),
        height: z.string().optional(),
        textAlign: z.enum(["left", "center", "right"]).optional(),
        columns: z.number().min(1).max(6).optional(),
        displayMode: z.enum(["grid", "carousel"]).optional(),
        layout: z.enum(["grid", "list", "slider"]).optional(),
        filterTypes: z.array(z.enum(["price", "category", "brand"])).optional(),
        allowRatings: z.boolean().optional(),
    }).optional(),
    content: z.object({
        title: z.string().optional(),
        subtitle: z.string().optional(),
        imageUrl: z.string().url().optional(),
        productIds: z.array(z.string()).optional(),
        testimonials: z.array(
            z.object({
                name: z.string(),
                quote: z.string(),
                imageUrl: z.string().url().optional(),
            })
        ).optional(),
        categories: z.array(z.string()).optional(),
        reviews: z.array(z.object({ user: z.string(), rating: z.number().min(1).max(5), comment: z.string() })).optional(),
        location: z.object({ lat: z.number(), lng: z.number() }).optional(),
        links: z.array(
            z.object({ platform: z.string(), url: z.string().url() })
        ).optional(),
    }).optional(),
});
