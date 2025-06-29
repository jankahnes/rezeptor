export function getTagByID(id: number) {
  for (const category of Object.keys(TAGS) as (keyof typeof TAGS)[]) {
    const found = TAGS[category].find((tag) => tag.id === id);
    if (found) {
      return { ...found, category };
    }
  }
  return undefined;
}
