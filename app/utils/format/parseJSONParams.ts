export default function parseJsonParams(query: Record<string, any>) {
  const parsed: Record<string, any> = {};
  for (const key in query) {
    const val = query[key];
    if (typeof val === 'string') {
      try {
        parsed[key] = JSON.parse(val);
      } catch {
        parsed[key] = val;
      }
    } else {
      parsed[key] = val;
    }
  }

  return parsed;
}
