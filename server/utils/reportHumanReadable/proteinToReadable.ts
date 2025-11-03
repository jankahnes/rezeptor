import * as generics from '~/utils/format/genericDescriptors';

const aminoAcidRatioDescriptors = {
  0: { description: 'Very poor amino acid profile', ...generics.POOR },
  0.4: { description: 'Poor amino acid profile', ...generics.BAD },
  0.7: { description: 'Suboptimal amino acid profile', ...generics.SUBOPTIMAL },
  0.85: { description: 'Decent amino acid profile', ...generics.NEUTRAL },
  0.99: { description: 'Complete amino acid profile', ...generics.GOOD },
  1.25: { description: 'Rich amino acid profile', ...generics.GREAT },
  1.5: { description: 'Excellent amino acid profile', ...generics.EXCELLENT },
};

const proteinOfficialStandards = {
  0: { description: 'Not a protein source', ...generics.NEUTRAL },
  5: { description: 'Source of protein', ...generics.OKAY },
  10: { description: 'Good protein source', ...generics.GOOD },
  20: { description: 'High protein', ...generics.GREAT },
};

const proteinDensityDescriptors = {
  0: { description: 'Low protein density', ...generics.BAD },
  0.08: { description: 'Moderate protein density', ...generics.OKAY },
  0.2: { description: 'Good protein density', ...generics.GOOD },
  0.4: { description: 'High protein density', ...generics.GREAT },
};

export default function proteinToReadable(report: any, isFood: boolean) {
  const items = [];
  const qualityItem = generics.getHighestThreshold(
    report.protein.limitingAA_ratio,
    aminoAcidRatioDescriptors
  );
  if (report.protein.limitingAA_ratio < 1) {
    qualityItem.subtitle =
      'Protein quality limited by low ' + report.protein.limitingAA;
  }
  const proteinPer100gItem = generics.getHighestThreshold(
    report.protein.proteinPer100g,
    proteinOfficialStandards
  );
  const proteinDensityItem = generics.getHighestThreshold(
    report.protein.proteinKcalRatio,
    proteinDensityDescriptors
  );
  items.push(qualityItem);
  items.push({
    ...proteinPer100gItem,
    subtitle: isFood
      ? report.protein.proteinPer100g.toFixed(0) + 'g protein per 100g'
      : report.protein.proteinPerServing.toFixed(0) + 'g protein per serving',
  });
  items.push({
    ...proteinDensityItem,
    subtitle:
      (report.protein.proteinKcalRatio * 100).toFixed(0) + '% kcal from protein',
  });

  items.sort((a, b) => b.value - a.value);
  return items;
}
