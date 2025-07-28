const saltPer100gThresholds = {
    0: { description: "Very low", ...EXCELLENT},
    0.3: { description: "Low", ...GOOD},
    0.7: { description: "Average", ...OKAY},
    1.4: { description: "Elevated", ...SUBOPTIMAL},
    2: { description: "High", ...BAD},
}

const saltRDAPerServingThresholds = {
    0: {...OUTSTANDING},
    0.1: {...GREAT},
    0.2: {...GREAT},
    0.3: {...GOOD},
    0.4: {...OKAY},
    0.5: {...NEUTRAL},
    0.6: {...SUBOPTIMAL},
    0.7: {...BAD},
    0.9: {...POOR},
}

export default function saltToReadable(report: any) {
    if(!report.salt) return []
    const items = []
    const saltPer100gItem = getHighestThreshold(report.salt.saltPer100g, saltPer100gThresholds)
    const saltRDAPerServingItem = getHighestThreshold(report.salt.saltRDAPerServing, saltRDAPerServingThresholds)
    items.push({
        ...saltPer100gItem,
        description: saltPer100gItem.description + " sodium per 100g",
    })
    items.push({
        ...saltRDAPerServingItem,
        description: (report.salt.saltRDAPerServing * 100).toFixed(0) + "% of sodium RDA per serving",
    })
    const contributors = report.contributors["salt_without_added"]?.contributors || []
    for(const contributor of contributors) {
        if(contributor.value > 0.3) {
            items.push({
                description: "Sodium from " + contributor.name,
                ...SUBOPTIMAL
            })
        }
    }
    items.sort((a, b) => b.value - a.value)
    return items
}