import pluralize from 'pluralize';

export default function singularizeWord(word: string) {
  return pluralize.singular(word);
}
