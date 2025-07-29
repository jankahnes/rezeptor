const totalSugarPer100Thresholds = {
    0: {description: "Minimal", ...OUTSTANDING},
    1: {description: "Very low", ...EXCELLENT},
    2: {description: "Low", ...GREAT},
    3: {description: "Moderately low", ...GOOD},
    4: {description: "Average", ...NEUTRAL},
    6: {description: "Elevated", ...SUBOPTIMAL},
    8: {description: "High", ...BAD},
    10: {description: "Very high", ...POOR},
    20: {description: "Excessive", ...WARNING},
}

const naturalSourceThresholds = {
    0: {description: "All sugar from processed sources", ...POOR},
    0.05: {description: "Almost all sugar from processed sources", ...POOR},
    0.1: {description: "Most sugar from processed sources", ...BAD},
    0.2: {description: "Most sugar from processed sources", ...SUBOPTIMAL},
    0.5: {description: "Half of the sugar from natural sources", ...NEUTRAL},
    0.6: {description: "Majority of sugar from natural sources", ...OKAY},
    0.7: {description: "Vast majority of sugar from natural sources", ...GOOD},
    0.8: {description: "Almost all sugar from natural sources", ...GREAT},
    0.95: {description: "All sugar from natural sources", ...EXCELLENT},
}

const percentOfKcalThresholds = {
    0: {description: "Minimal", ...EXCELLENT},
    0.03: {description: "Very low", ...GREAT},
    0.07: {description: "Low", ...GOOD},
    0.12: {description: "Some", ...OKAY},
    0.18: {description: "Moderate", ...NEUTRAL},
    0.3: {description: "High", ...SUBOPTIMAL},
    0.5: {description: "Very high", ...BAD},
    0.75: {description: "Extremely high", ...POOR},
}


export default function sugarToReadable(report: any) {
    if(!report.sugar) return []
    const items = []
    const totalSugarPer100Item = getHighestThreshold(report.sugar.totalSugarPer100, totalSugarPer100Thresholds)
    const naturalSourceItem = getHighestThreshold(report.sugar.percentContributedFromNaturalScources, naturalSourceThresholds)
    const percentOfKcalItem = getHighestThreshold(report.sugar.percentOfKcal, percentOfKcalThresholds)
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
    const contributors = report.contributors["sugar"]?.contributors || []
    for(const contributor of contributors) {
        if(contributor.value > 0.3) {
            items.push({
                description: "Sugar from " + contributor.name,
                ...SUBOPTIMAL
            })
        }
    }
    items.sort((a, b) => b.value - a.value)
    return items
}