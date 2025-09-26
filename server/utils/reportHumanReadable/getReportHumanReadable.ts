import gradesToReadable from "~/utils/format/gradesToReadable";
import processingLevelToReadable from "~/server/utils/reportHumanReadable/processingLevelToReadable";
import proteinToReadable from "~/server/utils/reportHumanReadable/proteinToReadable";
import saltToReadable from "~/server/utils/reportHumanReadable/saltToReadable";
import fiberToReadable from "~/server/utils/reportHumanReadable/fiberToReadable";
import satietyToReadable from "~/server/utils/reportHumanReadable/satietyToReadable";
import sugarToReadable from "~/server/utils/reportHumanReadable/sugarToReadable";
import micronutrientsToReadable from "~/server/utils/reportHumanReadable/micronutrientsToReadable";
import fatProfileToReadable from "~/server/utils/reportHumanReadable/fatProfileToReadable";
import protectiveCompoundsToReadable from "~/server/utils/reportHumanReadable/protectiveCompoundsToReadable";


type ReportHumanReadableItem = {
    description: string;
    subtitle: string | null;
    value: number;
    color: string;
    icon: string | null;
    tooltip: string | null;
}

type ReportHumanReadable = {
    overall: ReportHumanReadableItem[];
    micronutrients: ReportHumanReadableItem[];
    fatProfile: ReportHumanReadableItem[];
    processingLevel: ReportHumanReadableItem[];
    protein: ReportHumanReadableItem[];
    sugar: ReportHumanReadableItem[];
    salt: ReportHumanReadableItem[];
    fiber: ReportHumanReadableItem[];
    satiety: ReportHumanReadableItem[];
    protectiveCompounds: ReportHumanReadableItem[];
}

export default function getReportHumanReadable(report: any, recipeComputed: any, isFood: boolean) {
    const humanReadable: ReportHumanReadable = {
        overall: [],
        micronutrients: [],
        fatProfile: [],
        processingLevel: [],
        protein: [],
        sugar: [],
        salt: [],
        fiber: [],
        satiety: [],
        protectiveCompounds: [],
    }
    humanReadable.overall = gradesToReadable(report, recipeComputed, isFood) as ReportHumanReadableItem[]
    humanReadable.processingLevel = processingLevelToReadable(report, isFood) as ReportHumanReadableItem[]
    humanReadable.protein = proteinToReadable(report, isFood) as ReportHumanReadableItem[]
    humanReadable.salt = saltToReadable(report, isFood) as ReportHumanReadableItem[]
    humanReadable.fiber = fiberToReadable(report, isFood) as ReportHumanReadableItem[]
    humanReadable.satiety = satietyToReadable(report, isFood) as ReportHumanReadableItem[]
    humanReadable.sugar = sugarToReadable(report, isFood) as ReportHumanReadableItem[]
    humanReadable.micronutrients = micronutrientsToReadable(report, isFood) as ReportHumanReadableItem[]
    humanReadable.fatProfile = fatProfileToReadable(report) as ReportHumanReadableItem[]
    humanReadable.protectiveCompounds = protectiveCompoundsToReadable(report) as ReportHumanReadableItem[]
    return humanReadable
}