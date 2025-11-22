export function expectSingleOrNull<T>(data: T[]): T | null {
  if (data.length === 0) {
    return null;
  }
  if (data.length > 1) {
    throw new Error('Expected single item, but got multiple items');
  }
  return data[0];
}
