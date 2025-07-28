type MicronutrientItem = {
    description: string;
    color: string;
    icon: string;
    rda: number;
}
const rdaThresholds = {
    0: {
        description: "No",
        ...NEUTRAL
    },
    5: {description: "Low source of", ...OKAY},
    15: {description: "Source of", ...GOOD},
    35: {description: "High in", ...GREAT},
    50: {description: "Excellent source of", ...EXCELLENT},
    75: {description: "Exceptionally high in", ...OUTSTANDING},
};

const displayThreshold = 10

export default function micronutrientsToReadable(report) {
    if(!report.micronutrients) return [];
    const reportMicronutrients = report.micronutrients?.details as MicronutrientItem[]
    const items = []
    for(const nutrient of reportMicronutrients) {
        const rda = nutrient.rdaPer100
        if(rda < displayThreshold) {
            continue
        }
        const highestThreshold = getHighestThreshold(rda, rdaThresholds)
        const contributors = report.contributors[nutrient.name]?.contributors || []
        const subtitle = contributorsToReadable(contributors)
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