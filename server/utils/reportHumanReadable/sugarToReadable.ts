import * as generics from "~/utils/format/genericDescriptors";


const totalSugarPer100Thresholds = {
    0: {description: "Minimal", ...generics.OUTSTANDING},
    1: {description: "Very low", ...generics.EXCELLENT},
    2: {description: "Low", ...generics.GREAT},
    3: {description: "Moderately low", ...generics.GOOD},
    4: {description: "Average", ...generics.NEUTRAL},
    6: {description: "Elevated", ...generics.SUBOPTIMAL},
    8: {description: "High", ...generics.BAD},
    10: {description: "Very high", ...generics.POOR},
    20: {description: "Excessive", ...generics.WARNING},
}

const naturalSourceThresholds = {
    0: {description: "All sugar from processed sources", ...generics.POOR},
    0.05: {description: "Almost all sugar from processed sources", ...generics.POOR},
    0.1: {description: "Most sugar from processed sources", ...generics.BAD},
    0.2: {description: "Most sugar from processed sources", ...generics.SUBOPTIMAL},
    0.5: {description: "Half of the sugar from natural sources", ...generics.NEUTRAL},
    0.6: {description: "Majority of sugar from natural sources", ...generics.OKAY},
    0.7: {description: "Vast majority of sugar from natural sources", ...generics.GOOD},
    0.8: {description: "Almost all sugar from natural sources", ...generics.GREAT},
    0.95: {description: "All sugar from natural sources", ...generics.EXCELLENT},
}

const percentOfKcalThresholds = {
    0: {description: "Minimal", ...generics.EXCELLENT},
    0.03: {description: "Very low", ...generics.GREAT},
    0.07: {description: "Low", ...generics.GOOD},
    0.12: {description: "Some", ...generics.OKAY},
    0.18: {description: "Moderate", ...generics.NEUTRAL},
    0.3: {description: "High", ...generics.SUBOPTIMAL},
    0.5: {description: "Very high", ...generics.BAD},
    0.75: {description: "Extremely high", ...generics.POOR},
}


export default function sugarToReadable(report: any, isFood: boolean) {
    if(!report.sugar) return []
    const items = []
    const totalSugarPer100Item = generics.getHighestThreshold(report.sugar.totalSugarPer100, totalSugarPer100Thresholds)
    const naturalSourceItem = generics.getHighestThreshold(report.sugar.percentContributedFromNaturalScources, naturalSourceThresholds)
    const percentOfKcalItem = generics.getHighestThreshold(report.sugar.percentOfKcal, percentOfKcalThresholds)
    items.push({
        ...totalSugarPer100Item,
        description: totalSugarPer100Item.description + " sugar per 100g"
    })
    items.push({
        ...naturalSourceItem,
        description: naturalSourceItem.description,
    })
    items.push({
        ...percentOfKcalItem,
        description: percentOfKcalItem.description + " impact on calories from sugar",
    })
    if(!isFood) {
    const contributors = report.contributors["sugar"]?.contributors || []
    for(const contributor of contributors) {
        if(contributor.value > 0.3) {
            items.push({
                description: "Sugar from " + contributor.name,
                ...generics.SUBOPTIMAL
            })
        }
    }
}
    items.sort((a, b) => b.value - a.value)
    return items
}