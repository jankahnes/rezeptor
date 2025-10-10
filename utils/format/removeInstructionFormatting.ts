const removeFormatting = (instruction: string) => {
  return instruction.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
};

  export default function removeInstructionFormatting(instructions: string[]) {
    return instructions.map(removeFormatting);
  }