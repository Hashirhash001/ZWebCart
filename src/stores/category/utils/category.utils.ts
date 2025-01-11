export function buildHierarchy(categories: any[]) {
  const categoryMap = new Map();

  // Map all categories by their ID
  categories.forEach((category) => {
    categoryMap.set(category.id, { ...category, child: [] });
  });

  const rootCategories = new Set(categoryMap.values());

  categories.forEach((category) => {
    // If a category has descendants, add each descendant to the `child` array
    category.descendants.forEach((descendant) => {
      const descendantCategory = categoryMap.get(descendant.descendantId);
      if (descendantCategory) {
        categoryMap.get(category.id).child.push(descendantCategory);
        // Remove the descendant from root categories since it's a child
        rootCategories.delete(descendantCategory);
      }
    });
  });

  // Transform categories recursively to ensure the hierarchy is correct
  const transformHierarchy = (category: any) => {
    if (category.child && category.child.length > 0) {
      category.child = category.child.map((child: any) => transformHierarchy(child));
    }
    return category;
  };

  return Array.from(rootCategories).map((category) => transformHierarchy(category));
}
