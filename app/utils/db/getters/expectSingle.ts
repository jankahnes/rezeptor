export function expectSingle<T>(data: T[]): T {
  if (data.length === 0) {
    throw new Error('Expected single item, but got empty array');
  }
  if (data.length > 1) {
    throw new Error('Expected single item, but got multiple items');
  }
  return data[0];
}
