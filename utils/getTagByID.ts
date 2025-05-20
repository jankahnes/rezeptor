export function getTagByID(id: number) {
  for (const category of Object.keys(tags) as (keyof typeof tags)[]) {
    const found = tags[category].find((tag) => tag.id === id);
    if (found) {
      return { ...found, category };
    }
  }
  return undefined;
}
