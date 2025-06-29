export default function unpluralize(word: string) {
  return word.replace(/s$/, '');
}