const fiberPer100gThresholds = {
    0: { description: "Very low", ...POOR},
    0.5: { description: "Low", ...BAD},
    1: { description: "Below average", ...SUBOPTIMAL},
    1.5: { description: "Decent", ...NEUTRAL},
    2: { description: "Moderate", ...OKAY},
    2.5: { description: "High", ...GREAT},
    3.5: { description: "Very high", ...GREAT},
    5: { description: "Excellent", ...EXCELLENT},
}

const fiberRDAPerServingThresholds = {
    0: { description: "Very low", ...POOR},
    0.1: { description: "Low", ...BAD},
    0.15: { description: "Below average", ...SUBOPTIMAL},
    0.2: { description: "Decent", ...NEUTRAL},
    0.25: { description: "Moderate", ...OKAY},
    0.3: { description: "High", ...GREAT},
    0.4: { description: "Very high", ...GREAT},
    0.5: { description: "Excellent", ...EXCELLENT},
    0.6: { description: "Outstanding", ...OUTSTANDING},
}

export default function fiberToReadable(report: any) {
    if(!report.fiber) return []
    const items = []
    const fiberPer100gItem = getHighestThreshold(report.fiber.fiberPer100g, fiberPer100gThresholds)
    const fiberRDAPerServingItem = getHighestThreshold(report.fiber.fiberRDAPerServing, fiberRDAPerServingThresholds)
    items.push({
        description: fiberPer100gItem.description + " fiber per 100g",
        color: fiberPer100gItem.color,
        icon: fiberPer100gItem.icon,
        value: fiberPer100gItem.value
    })
    items.push({
        description: (report.fiber.fiberRDAPerServing * 100).toFixed(0) + "% of fiber RDA per serving",
        color: fiberRDAPerServingItem.color,
        icon: fiberRDAPerServingItem.icon,
        value: fiberRDAPerServingItem.value
    })
    const contributors = report.contributors["fiber"]?.contributors || []
    for(const contributor of contributors) {
        if(contributor.totalContribution > 75) {
            items.push({
                description: "Fiber from " + contributor.name,
                ...GOOD
            })
        }
    }
    items.sort((a, b) => b.value - a.value)
    return items
}