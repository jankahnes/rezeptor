import * as generics from '~/utils/format/genericDescriptors';

const transFatThresholds = {
  0: {
    description: 'No Trans Fat',
    ...generics.OKAY,
  },
  0.01: { description: 'Trace Trans Fats', ...generics.SUBOPTIMAL },
  0.02: { description: 'Contains Trans Fats', ...generics.BAD },
  0.05: { description: 'High in Trans Fats', ...generics.POOR },
  0.08: { description: 'Very high in Trans Fats', ...generics.POOR },
  0.2: { description: 'Extremely high in Trans Fats', ...generics.WARNING },
};

const saturatedFatThresholds = {
  0: { description: 'Very low Saturated Fat', ...generics.EXCELLENT },
  0.15: { description: 'Low Saturated Fat', ...generics.GREAT },
  0.25: { description: 'Moderate Saturated Fat', ...generics.GOOD },
  0.33: { description: 'Elevated Saturated Fat', ...generics.SUBOPTIMAL },
  0.5: { description: 'High Saturated Fat', ...generics.BAD },
  0.67: { description: 'Very high Saturated Fat', ...generics.POOR },
};

const mufaThresholds = {
  0: { description: 'Low Monounsaturated Fat', ...generics.NEUTRAL },
  0.1: { description: 'Moderate Monounsaturated Fat', ...generics.GOOD },
  0.3: { description: 'Good source of Monounsaturated Fat', ...generics.GOOD },
  0.5: { description: 'High in Monounsaturated Fat', ...generics.GREAT },
  0.7: { description: 'Very high in Monounsaturated Fat', ...generics.GREAT },
};

const omega3Thresholds = {
  0: { description: 'Minimal Omega-3s', ...generics.NEUTRAL },
  0.005: { description: 'Some Omega-3s', ...generics.OKAY },
  0.015: { description: 'Moderate Omega-3s', ...generics.GOOD },
  0.025: { description: 'Good Omega-3s', ...generics.GREAT },
  0.05: { description: 'High Omega-3s', ...generics.EXCELLENT },
  0.1: {
    description: 'Exceptional source of Omega-3s',
    ...generics.OUTSTANDING,
  },
};

const omega6Thresholds = {
  0: { description: 'Low Omega-6s', ...generics.NEUTRAL },
  0.1: { description: 'Moderate Omega-6s', ...generics.GOOD },
  0.3: { description: 'High in Omega-6s', ...generics.GOOD },
  0.5: { description: 'Very high in Omega-6s', ...generics.GOOD },
};

const scoreDescriptors = {
  satFatPercent: saturatedFatThresholds,
  mufaPercent: mufaThresholds,
  o3Percent: omega3Thresholds,
  o6Percent: omega6Thresholds,
  transFatPercent: transFatThresholds,
};

export default function fatProfileToReadable(report: any) {
  const items = [];
  for (const [key, value] of Object.entries(scoreDescriptors)) {
    const fattyAcidPct = report.fatProfile[key];
    const item = generics.getHighestThreshold(fattyAcidPct / 100, value);
    items.push({ ...item, subtitle: (fattyAcidPct ?? 0).toFixed(0) + '%' });
  }
  items.sort((a, b) => b.value - a.value);
  return items;
}
