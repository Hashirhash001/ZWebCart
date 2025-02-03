"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildHierarchy = buildHierarchy;
function buildHierarchy(categories) {
    const categoryMap = new Map();
    categories.forEach((category) => {
        categoryMap.set(category.id, { ...category, child: [] });
    });
    const rootCategories = new Set(categoryMap.values());
    categories.forEach((category) => {
        category.descendants.forEach((descendant) => {
            const descendantCategory = categoryMap.get(descendant.descendantId);
            if (descendantCategory) {
                categoryMap.get(category.id).child.push(descendantCategory);
                rootCategories.delete(descendantCategory);
            }
        });
    });
    const transformHierarchy = (category) => {
        if (category.child && category.child.length > 0) {
            category.child = category.child.map((child) => transformHierarchy(child));
        }
        return category;
    };
    return Array.from(rootCategories).map((category) => transformHierarchy(category));
}
//# sourceMappingURL=category.utils.js.map