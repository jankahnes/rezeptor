import * as generics from '~/utils/format/genericDescriptors';
import contributorsToReadable from '~/server/utils/reportHumanReadable/contributorsToReadable';
import { getGrade } from '~/utils/constants/grades';

type ReadableGradeItem = {
  value: number;
  description: string;
  bgColor: string;
  color: string;
  icon: string;
  subtitle?: string | null;
};

type ReadableGrades = ReadableGradeItem[];

const satietyDescriptors = {
  F: { description: 'Not filling at all', ...generics.POOR },
  E: { description: 'Not very filling', ...generics.BAD },
  D: { description: 'Not very filling', ...generics.SUBOPTIMAL },
  C: { description: 'Somewhat filling', ...generics.OKAY },
  B: { description: 'Filling', ...generics.GOOD },
  A: { description: 'Very filling', ...generics.GREAT },
  S: { description: 'Extremely filling', ...generics.EXCELLENT },
};

const processingLevelDescriptors = {
  F: { description: 'Ultra-processed ingredients', ...generics.POOR },
  E: { description: 'Very processed ingredients', ...generics.BAD },
  D: { description: 'Mostly processed ingredients', ...generics.SUBOPTIMAL },
  C: { description: 'Moderately processed ingredients', ...generics.OKAY },
  B: { description: 'Mostly unprocessed ingredients', ...generics.GOOD },
  A: { description: 'Mostly whole ingredients', ...generics.GREAT },
  S: { description: 'Whole ingredients', ...generics.EXCELLENT },
};

const processingLevelDescriptorsFood = {
  4: { description: 'Ultra-processed', ...generics.POOR },
  3: { description: 'Processed Food', ...generics.SUBOPTIMAL },
  2: { description: 'Traditionally processed', ...generics.OKAY },
  1: { description: 'Unprocessed Food', ...generics.GREAT },
};

type ScoreDescriptor = {
  appendName: string;
  descriptor: any;
  contributor_col?: string;
  display_subtitle_thresh?: number;
  display_if?: string;
};

const scoreDescriptors: Record<string, ScoreDescriptor> = {
  mnidx: {
    appendName: 'Micronutrients',
    descriptor: generics.positiveAmountDescriptors,
    contributor_col: 'mnidx',
    display_subtitle_thresh: 38,
    display_if: 'bigger',
  },
  satiety: {
    appendName: '',
    descriptor: satietyDescriptors,
    contributor_col: 'sidx',
    display_subtitle_thresh: 38,
    display_if: 'bigger',
  },
  fat_profile_score: {
    appendName: 'Fatty Acid Profile',
    descriptor: generics.genericDescriptors,
    //contributor_col: "fat_profile_score",
    //display_subtitle_thresh: 38,
    //display_if: "bigger"
  },
  processing_level_score: {
    appendName: '',
    descriptor: processingLevelDescriptors,
  },
  protein_score: {
    appendName: 'Protein',
    descriptor: generics.positiveAmountDescriptors,
    contributor_col: 'protein',
    display_subtitle_thresh: 38,
    display_if: 'bigger',
  },
  sugar_score: {
    appendName: 'Sugar',
    descriptor: generics.negativeAmountDescriptors,
    contributor_col: 'sugar',
    display_subtitle_thresh: 38,
    display_if: 'smaller',
  },
  fiber_score: {
    appendName: 'Fiber',
    descriptor: generics.positiveAmountDescriptors,
    contributor_col: 'fiber',
    display_subtitle_thresh: 38,
    display_if: 'bigger',
  },
  salt_score: {
    appendName: 'Sodium',
    descriptor: generics.negativeAmountDescriptors,
    contributor_col: 'salt',
    display_subtitle_thresh: 38,
    display_if: 'smaller',
  },
  protective_score: {
    appendName: 'Protective Compounds',
    descriptor: generics.positiveAmountDescriptors,
    contributor_col: 'protective_score',
    display_subtitle_thresh: 38,
    display_if: 'bigger',
  },
};

export default function gradesToReadable(
  report: any,
  recipe: Recipe | FullFoodRow | InsertableRecipe,
  isFood: boolean
) {
  // Create a copy to avoid mutating the global object
  const descriptors = isFood
    ? Object.fromEntries(
        Object.entries(scoreDescriptors).filter(
          ([key]) => key !== 'processing_level_score'
        )
      )
    : scoreDescriptors;

  const readable: ReadableGrades = [];
  for (const scoreCategory in descriptors) {
    const score = (recipe as any)[scoreCategory];
    const roundedGrade = getGrade(score, 'single')[0];
    const item = descriptors[scoreCategory as keyof typeof scoreDescriptors];
    let descriptor =
      item.descriptor[roundedGrade as keyof typeof item.descriptor];
    if (!descriptor) {
      throw new Error(
        `No descriptor found for score category: ${scoreCategory} for ${roundedGrade}`
      );
    }
    const description = descriptor.description + ' ' + item.appendName;
    let subtitle = null;
    let display_subtitle = false;
    if (!isFood) {
      const contributors =
        report?.contributors?.[item?.contributor_col ?? '']?.contributors || [];
      subtitle = contributorsToReadable(contributors);
      const display_subtitle_thresh = item.display_subtitle_thresh;
      const display_if = item.display_if;
      display_subtitle =
        display_if === 'bigger'
          ? score > (display_subtitle_thresh ?? 0)
          : score < (display_subtitle_thresh ?? 0);
    }
    readable.push({
      value: descriptor.value,
      description,
      bgColor: descriptor.bgColor,
      color: descriptor.color,
      icon: descriptor.icon,
      subtitle: display_subtitle && subtitle ? subtitle : null,
    });
  }
  if (isFood) {
    if ((recipe as FullFoodRow).aisle === 'Produce') {
      processingLevelDescriptorsFood[1].description = 'Whole Food';
    }
    readable.push(processingLevelDescriptorsFood[(recipe as FullFoodRow).nova]);
  }
  readable.sort((a, b) => b.value - a.value);
  return readable;
}
