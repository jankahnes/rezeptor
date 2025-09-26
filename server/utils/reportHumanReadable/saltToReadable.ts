import * as generics from "~/utils/format/genericDescriptors";


const saltPer100gThresholds = {
    0: { description: "Very low", ...generics.EXCELLENT},
    0.3: { description: "Low", ...generics.GOOD},
    0.7: { description: "Average", ...generics.OKAY},
    1.4: { description: "Elevated", ...generics.SUBOPTIMAL},
    2: { description: "High", ...generics.BAD},
}

const saltRDAPerServingThresholds = {
    0: {...generics.OUTSTANDING},
    0.1: {...generics.GREAT},
    0.2: {...generics.GREAT},
    0.3: {...generics.GOOD},
    0.4: {...generics.OKAY},
    0.5: {...generics.NEUTRAL},
    0.6: {...generics.SUBOPTIMAL},
    0.7: {...generics.BAD},
    0.9: {...generics.POOR},
}

const naKRatioThresholds = {
    0: {description: "Optimal", ...generics.EXCELLENT},
    0.5: {description: "Very Good", ...generics.GREAT},
    1: {description: "Good", ...generics.GOOD},
    1.5: {description: "Okay", ...generics.OKAY},
    2: {description: "Bad", ...generics.SUBOPTIMAL},
    2.5: {description: "Poor", ...generics.BAD},
    3: {description: "Very Poor", ...generics.POOR},
}

export default function saltToReadable(report: any, isFood: boolean) {
    if(!report.salt) return []
    const items = []
    const saltPer100gItem = generics.getHighestThreshold(report.salt.saltPer100g, saltPer100gThresholds)
    const saltRDAPerServingItem = generics.getHighestThreshold(report.salt.saltRDAPerServing, saltRDAPerServingThresholds)
    const naKRatioItem = generics.getHighestThreshold(report.salt.na_k_ratio, naKRatioThresholds)
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
                ...generics.SUBOPTIMAL
            })
        }
    }
}
    items.sort((a, b) => b.value - a.value)
    return items
}