export function buildHierarchy(categories: any[]) {
  const categoryMap = new Map();

  // Map all categories by their ID
  categories.forEach((category) => {
    categoryMap.set(category.id, { ...category, child: [] });
  });

  // Create hierarchy by linking parent categories with their children
  const rootCategories = [];
  
  categories.forEach((category) => {
    const descendants = category.descendants.map((descendant) => descendant.descendantId);

    // If category has a parent, add it to the parent's children array
    if (category.parentId) {
      categoryMap.get(category.parentId).child.push(categoryMap.get(category.id));
    } else {
      // If category doesn't have a parent, it's a root category
      rootCategories.push(categoryMap.get(category.id));
    }

    // Handle further hierarchical levels (child-grandchild, etc.)
    descendants.forEach((descendantId) => {
      const descendantCategory = categoryMap.get(descendantId);
      if (descendantCategory) {
        categoryMap.get(category.id).child.push(descendantCategory);
      }
    });
  });

  // Recursively transform to handle multiple levels of hierarchy (child, grandchild, etc.)
  const transformHierarchy = (category: any) => {
    // If category has children, recursively process them
    if (category.child && category.child.length > 0) {
      category.child = category.child.map((child: any) => transformHierarchy(child));
    }
    return category;
  };

  // Process root categories and transform them recursively
  return rootCategories.map((category) => transformHierarchy(category));
}