import * as generics from "~/utils/format/genericDescriptors";


const fiberPer100gThresholds = {
    0: { description: "Very low", ...generics.POOR},
    0.5: { description: "Low", ...generics.BAD},
    1: { description: "Below average", ...generics.SUBOPTIMAL},
    1.5: { description: "Decent", ...generics.NEUTRAL},
    2: { description: "Moderate", ...generics.OKAY},
    2.5: { description: "High", ...generics.GREAT},
    3.5: { description: "Very high", ...generics.GREAT},
    5: { description: "Excellent", ...generics.EXCELLENT},
}

const fiberRDAPerServingThresholds = {
    0: { description: "Very low", ...generics.POOR},
    0.1: { description: "Low", ...generics.BAD},
    0.15: { description: "Below average", ...generics.SUBOPTIMAL},
    0.2: { description: "Decent", ...generics.NEUTRAL},
    0.25: { description: "Moderate", ...generics.OKAY},
    0.3: { description: "High", ...generics.GREAT},
    0.4: { description: "Very high", ...generics.GREAT},
    0.5: { description: "Excellent", ...generics.EXCELLENT},
    0.6: { description: "Outstanding", ...generics.OUTSTANDING},
}

export default function fiberToReadable(report: any, isFood: boolean) {
    if(!report.fiber) return []
    const items = []
    const fiberPer100gItem = generics.getHighestThreshold(report.fiber.fiberPer100g, fiberPer100gThresholds)
    const fiberRDAPerServingItem = generics.getHighestThreshold(report.fiber.fiberRDAPerServing, fiberRDAPerServingThresholds)
    items.push({
        description: fiberPer100gItem.description + (isFood ? " fiber per 100g" : " fiber per serving"),
        color: fiberPer100gItem.color,
        icon: fiberPer100gItem.icon,
        value: fiberPer100gItem.value
    })
    if(!isFood) {
    items.push({
        description: (report.fiber.fiberRDAPerServing * 100).toFixed(0) + "% of fiber RDA per 100g",
        color: fiberRDAPerServingItem.color,
            icon: fiberRDAPerServingItem.icon,
            value: fiberRDAPerServingItem.value
            })
        }
    if(!isFood) {
    const contributors = report.contributors["fiber"]?.contributors || []
    for(const contributor of contributors) {
        if(contributor.totalContribution > 75) {
            items.push({
                description: "Fiber from " + contributor.name,
                ...generics.GOOD
            })
            }
        }
    }
    items.sort((a, b) => b.value - a.value)
    return items
}