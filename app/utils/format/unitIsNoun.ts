const nonNouns = ["large", "small", "medium", "big", "sized"]


export default function unitIsNoun(unit: string) {
    if(!unit) return false;
    const wordSplit = unit.split(" ");
    const relevantWord = wordSplit[wordSplit.length - 1];
    return !nonNouns.includes(relevantWord);
}