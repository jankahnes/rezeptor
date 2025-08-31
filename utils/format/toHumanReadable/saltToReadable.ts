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

const naKRatioThresholds = {
    0: {description: "Optimal", ...EXCELLENT},
    0.5: {description: "Very Good", ...GREAT},
    1: {description: "Good", ...GOOD},
    1.5: {description: "Okay", ...OKAY},
    2: {description: "Bad", ...SUBOPTIMAL},
    2.5: {description: "Poor", ...BAD},
    3: {description: "Very Poor", ...POOR},
}

export default function saltToReadable(report: any, isFood: boolean) {
    if(!report.salt) return []
    const items = []
    const saltPer100gItem = getHighestThreshold(report.salt.saltPer100g, saltPer100gThresholds)
    const saltRDAPerServingItem = getHighestThreshold(report.salt.saltRDAPerServing, saltRDAPerServingThresholds)
    const naKRatioItem = getHighestThreshold(report.salt.na_k_ratio, naKRatioThresholds)
    items.push({
        ...saltPer100gItem,
        description: saltPer100gItem.description + " sodium per 100g",
    })
    items.push({
        ...saltRDAPerServingItem,
        description: (report.salt.saltRDAPerServing * 100).toFixed(0) + (isFood ? "% of Sodium RDA per 100g" : "% of sodium RDA per serving"),
    })
    items.push({
        ...naKRatioItem,
        description: naKRatioItem.description + " sodium/potassium ratio"
    })
    if(!isFood) {
    const contributors = report.contributors["salt_without_added"]?.contributors || []
    for(const contributor of contributors) {
        if(contributor.value > 0.3) {
            items.push({
                description: "Sodium from " + contributor.name,
                ...SUBOPTIMAL
            })
        }
    }
}
    items.sort((a, b) => b.value - a.value)
    return items
}