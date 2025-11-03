import * as generics from '~/utils/format/genericDescriptors';

const avgNOVAThresholds = {
  1: { description: 'Unprocessed ingredients', ...generics.GREAT },
  1.5: { description: 'Mostly unprocessed ingredients', ...generics.GOOD },
  2: { description: 'Culinary processed ingredients', ...generics.OKAY },
  3: { description: 'Processed ingredients', ...generics.SUBOPTIMAL },
  3.5: { description: 'Ultra-processed ingredients', ...generics.BAD },
};

const pctWholeThresholds = {
  0: { ...generics.POOR },
  20: { ...generics.BAD },
  30: { ...generics.SUBOPTIMAL },
  40: { ...generics.NEUTRAL },
  50: { ...generics.OKAY },
  60: { ...generics.GOOD },
  75: { ...generics.GREAT },
  85: { ...generics.GREAT },
  99: { ...generics.EXCELLENT },
};

const pctUPFThresholds = {
  0: { ...generics.OKAY },
  1: { ...generics.OKAY },
  10: { ...generics.SUBOPTIMAL },
  25: { ...generics.BAD },
  50: { ...generics.POOR },
};

const novaDescriptorsFood = {
  1: { description: 'NOVA Classifiaction: Whole (1)', ...generics.GOOD },
  2: {
    description: 'NOVA Classifiaction: Traditionally processed (2)',
    ...generics.OKAY,
  },
  3: {
    description: 'NOVA Classifiaction: Processed (3)',
    ...generics.SUBOPTIMAL,
  },
  4: {
    description: 'NOVA Classifiaction: Ultra-processed (4)',
    ...generics.BAD,
  },
};

export default function processingLevelToReadable(
  report: any,
  isFood: boolean
) {
  if (!report.processingLevel) return [];
  if (isFood) {
    return [
      novaDescriptorsFood[
        report.processingLevel.nova as keyof typeof novaDescriptorsFood
      ],
    ];
  }
  const items = [];
  const avgNOVAItem = generics.getHighestThreshold(
    report.processingLevel.avgNOVA,
    avgNOVAThresholds
  );
  const pctUPFItem = generics.getHighestThreshold(
    report.processingLevel.pctUPF,
    pctUPFThresholds
  );
  const pctWholeItem = generics.getHighestThreshold(
    report.processingLevel.pctWhole,
    pctWholeThresholds
  );
  items.push(avgNOVAItem);
  items.push({
    ...pctUPFItem,
    description:
      report.processingLevel.upfCount +
      ' ' +
      (report.processingLevel.upfCount > 1
        ? 'ultra-processed ingredients'
        : 'ultra-processed ingredient'),
    subtitle: report.processingLevel.upfIngredients.join(', ') || null,
  });
  items.push({
    ...pctWholeItem,
    description:
      report.processingLevel.wholeCount +
      ' ' +
      (report.processingLevel.wholeCount > 1
        ? 'whole ingredients'
        : 'whole ingredient'),
    subtitle: report.processingLevel.wholeIngredients.join(', ') || null,
  });
  items.sort((a, b) => b.value - a.value);
  return items;
}
