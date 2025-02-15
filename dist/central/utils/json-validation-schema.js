"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SectionSchema = void 0;
const zod_1 = require("zod");
exports.SectionSchema = zod_1.z.object({
    type: zod_1.z.string(),
    order: zod_1.z.number().min(1),
    config: zod_1.z.object({
        backgroundColor: zod_1.z.string().optional(),
        textColor: zod_1.z.string().optional(),
        height: zod_1.z.string().optional(),
        textAlign: zod_1.z.enum(["left", "center", "right"]).optional(),
        columns: zod_1.z.number().min(1).max(6).optional(),
        displayMode: zod_1.z.enum(["grid", "carousel"]).optional(),
        layout: zod_1.z.enum(["grid", "list", "slider"]).optional(),
        filterTypes: zod_1.z.array(zod_1.z.enum(["price", "category", "brand"])).optional(),
        allowRatings: zod_1.z.boolean().optional(),
    }).optional(),
    content: zod_1.z.object({
        title: zod_1.z.string().optional(),
        subtitle: zod_1.z.string().optional(),
        imageUrl: zod_1.z.string().url().optional(),
        productIds: zod_1.z.array(zod_1.z.string()).optional(),
        testimonials: zod_1.z.array(zod_1.z.object({
            name: zod_1.z.string(),
            quote: zod_1.z.string(),
            imageUrl: zod_1.z.string().url().optional(),
        })).optional(),
        categories: zod_1.z.array(zod_1.z.string()).optional(),
        reviews: zod_1.z.array(zod_1.z.object({ user: zod_1.z.string(), rating: zod_1.z.number().min(1).max(5), comment: zod_1.z.string() })).optional(),
        location: zod_1.z.object({ lat: zod_1.z.number(), lng: zod_1.z.number() }).optional(),
        links: zod_1.z.array(zod_1.z.object({ platform: zod_1.z.string(), url: zod_1.z.string().url() })).optional(),
    }).optional(),
});
//# sourceMappingURL=json-validation-schema.js.map