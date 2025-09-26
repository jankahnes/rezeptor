import * as generics from "~/utils/format/genericDescriptors";
import contributorsToReadable from "~/server/utils/reportHumanReadable/contributorsToReadable";


type MicronutrientItem = {
    description: string;
    color: string;
    icon: string;
    rda: number;
}
const rdaThresholds = {
    0: {
        description: "No",
        ...generics.NEUTRAL
    },
    5: {description: "Low source of", ...generics.OKAY},
    15: {description: "Source of", ...generics.GOOD},
    35: {description: "High in", ...generics.GREAT},
    50: {description: "Excellent source of", ...generics.EXCELLENT},
    75: {description: "Exceptionally high in", ...generics.OUTSTANDING},
};

const displayThreshold = 10

export default function micronutrientsToReadable(report: any, isFood: boolean) { 
    if(!report.micronutrients) return [];
    const reportMicronutrients = report.micronutrients?.details as MicronutrientItem[]
    const items = []
    for(const nutrient of reportMicronutrients) {
        const rda = nutrient.rdaPer100
        if(rda < displayThreshold) {
            continue
        }
        const highestThreshold = generics.getHighestThreshold(rda, rdaThresholds)
        let subtitle = null
        if(!isFood) {
        const contributors = report.contributors[nutrient.name]?.contributors || []
        subtitle = contributorsToReadable(contributors)
        }
        const description = highestThreshold.description + " " + nutrient.displayName
        items.push({
            description,
            color: highestThreshold.color,
            icon: highestThreshold.icon,
            value: rda,
            subtitle
        })

    }
    items.sort((a, b) => b.value - a.value)
    return items
}