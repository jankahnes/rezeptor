const removeFormatting = (instruction: string) => {
  return instruction.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
};

export default function removeInstructionFormatting(
  instructions: string[] | null | undefined
) {
  if (!instructions) {
    return [];
  }
  return instructions.map(removeFormatting);
}
