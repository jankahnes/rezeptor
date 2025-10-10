export default function groupIngredients<
  T extends { category?: string | null }
>(items: T[]): Record<string, T[]> {
  const grouped: Record<string, T[]> = {};

  for (const item of items) {
    const category =
      item.category && item.category.toLowerCase() !== 'uncategorized'
        ? item.category
        : 'uncategorized';

    if (!grouped[category]) {
      grouped[category] = [];
    }

    grouped[category].push(item);
  }

  return grouped;
}
