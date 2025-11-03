import * as generics from '~/utils/format/genericDescriptors';

const saltPer100gThresholds = {
  0: { description: 'Very low salt', ...generics.GREAT },
  0.3: { description: 'Low salt', ...generics.OKAY },
  0.7: { description: 'Normally salted', ...generics.OKAY },
  1.5: { description: 'High Salt', ...generics.BAD }, // according to EU
  3: { description: 'Very High Salt', ...generics.POOR },
};

const saltRDAPerServingThresholds = {
  0: { ...generics.OUTSTANDING },
  0.1: { ...generics.GREAT },
  0.25: { ...generics.GREAT },
  0.4: { ...generics.GOOD },
  0.5: { ...generics.OKAY },
  0.75: { ...generics.NEUTRAL },
  1: { ...generics.SUBOPTIMAL },
  1.5: { ...generics.BAD },
  2: { ...generics.POOR },
};

const naKRatioThresholds = {
  0: { description: 'Optimal', ...generics.EXCELLENT },
  0.5: { description: 'Good', ...generics.GREAT },
  1: { description: 'Fair', ...generics.OKAY },
  1.5: { description: 'Poor', ...generics.SUBOPTIMAL },
  2.5: { description: 'Very Poor', ...generics.BAD },
  4: { description: 'Extremely Poor', ...generics.POOR },
};

export default function saltToReadable(report: any, isFood: boolean) {
  if (!report.salt) return [];
  const items = [];
  const saltPer100gItem = generics.getHighestThreshold(
    report.salt.saltPer100g,
    saltPer100gThresholds
  );
  const saltRDAPerServingItem = generics.getHighestThreshold(
    report.salt.saltRDAPerServing,
    saltRDAPerServingThresholds
  );
  const naKRatioItem = generics.getHighestThreshold(
    report.salt.naKRatio,
    naKRatioThresholds
  );
  items.push({
    ...saltPer100gItem,
    subtitle: report.salt.saltPer100g.toFixed(1) + 'g salt per 100g',
  });
  items.push({
    ...saltRDAPerServingItem,
    description:
      (report.salt.saltRDAPerServing * 100).toFixed(0) +
      (isFood ? '% of Sodium RDA per 100g' : '% of sodium RDA per serving'),
  });
  items.push({
    ...naKRatioItem,
    description: naKRatioItem.description + ' electrolyte balance',
    subtitle: report.salt.naKRatio.toFixed(1) + ' Na/K',
  });
  if (!isFood) {
    const contributors =
      report.contributors['salt_without_added']?.contributors || [];
    for (const contributor of contributors) {
      if (contributor.value > 0.3) {
        items.push({
          description: 'Sodium from ' + contributor.name,
          ...generics.SUBOPTIMAL,
        });
      }
    }
  }
  items.sort((a, b) => b.value - a.value);
  return items;
}
