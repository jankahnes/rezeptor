export default function contributorsToReadable(contributors: {name: string, value: number}[]) {
    if (!Array.isArray(contributors) || contributors.length === 0) {
      return '';
    }
    // Sort descending by contribution
    const sorted = contributors.slice().sort((a, b) => b.value - a.value);
    const top3 = sorted.slice(0, 3);
    const [first, second, third] = top3;
    
    // Threshold helpers
    const dominantThresh = 0.6;
    const majorThresh = 0.35;
    const minorGroupThresh = 0.15;
    
    // 1. Dominant contributor
    if (first.value > dominantThresh) {
      return `From ${first.name}`;
    }
    
    // 2. Strong single contributor
    let parts = [];
    if (first.value > majorThresh) {
      parts.push(`Mostly from ${first.name}`);
    } else {
      parts.push(`From ${first.name}`);
    }
    
    // 3. Handle second and third contributors
    const extras = [second, third].filter(x => x && x.value > minorGroupThresh);
    if (extras.length > 0) {
      // Qualifier based on total share of extras
      const totalExtra = extras.reduce((sum, x) => sum + x.value, 0);
      const qualifier = totalExtra > 0.3 ? 'as well as' : 'some from';
      // List names with commas and final "and"
      const names = extras.map(x => x.name);
      const namesStr = names.length === 1 ? names[0]
                          : names.length === 2 ? `${names[0]} and ${names[1]}`
                          : `${names.slice(0, -1).join(', ')}, and ${names.slice(-1)}`;
      parts.push(`${qualifier} ${namesStr}`);
    }
    
    return parts.join(', ');
  }