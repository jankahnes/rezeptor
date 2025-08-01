export function getTagByID(id: number) {
    const found = TAGS.find((tag) => tag.id === id);
    if (found) {
    return found;
  }
  return undefined;
}
