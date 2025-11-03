import * as generics from '~/utils/format/genericDescriptors';

const fiberPer100gThresholds = {
  0: { description: 'Very low', ...generics.POOR },
  0.5: { description: 'Low', ...generics.BAD },
  1: { description: 'Below average', ...generics.SUBOPTIMAL },
  1.5: { description: 'Decent', ...generics.NEUTRAL },
  2: { description: 'Moderate', ...generics.OKAY },
  2.5: { description: 'High', ...generics.GREAT },
  3.5: { description: 'Very high', ...generics.GREAT },
  5: { description: 'Excellent', ...generics.EXCELLENT },
};

const fiberTargetThresholds = {
  0: { description: 'Below recommended intake', ...generics.SUBOPTIMAL },
  0.65: { description: 'Approaching recommended intake', ...generics.OKAY },
  0.85: { description: 'Meeting recommended intake', ...generics.GREAT },
  1.1: { description: 'Exceeding recommended intake', ...generics.EXCELLENT },
};

export default function fiberToReadable(report: any, isFood: boolean) {
  if (!report.fiber) return [];
  const items = [];
  const fiberPer100gItem = generics.getHighestThreshold(
    report.fiber.fiberPer100g,
    fiberPer100gThresholds
  );
  const fiberTargetItem = generics.getHighestThreshold(
    report.fiber.fiberRDAPer2000kcal,
    fiberTargetThresholds
  );
  items.push({
    ...fiberPer100gItem,
    description: fiberPer100gItem.description + ' in Fiber',
    subtitle: report.fiber.fiberTotal.toFixed(1) + (isFood ? 'g fiber per 100g' : 'g fiber per serving'),
  });
  items.push({
    ...fiberTargetItem,
    subtitle: "Aiming for " + (report.fiber.fiberRDAPer2000kcal * 100).toFixed(0) + '% of RDA',
  });
  if (!isFood) {
    const contributors = report.contributors['fiber']?.contributors || [];
    for (const contributor of contributors) {
      if (contributor.totalContribution > 5) {
        items.push({
          description: 'Fiber from ' + contributor.name,
          ...generics.GOOD,
        });
      }
    }
  }
  items.sort((a, b) => b.value - a.value);
  return items;
}
