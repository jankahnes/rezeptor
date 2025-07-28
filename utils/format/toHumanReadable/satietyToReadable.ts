const ffThresholds = {
    0: { description: "Very low", ...POOR},
    1: { description: "Low", ...BAD},
    1.5: { description: "Below average", ...SUBOPTIMAL},
    2: { description: "Decent", ...NEUTRAL},
    2.5: { description: "Moderate", ...OKAY},
    3: { description: "High", ...GREAT},
    3.5: { description: "Very high", ...GREAT},
    4: { description: "Excellent", ...EXCELLENT},
}

const waterThresholds = {
    0: { description: "Minimal", ...NEUTRAL},
    15: { description: "Low", ...NEUTRAL},
    30: { description: "Slightly low", ...OKAY},
    50: { description: "Average", ...GOOD},
    70: { description: "High", ...GREAT},
    85: { description: "Very high", ...EXCELLENT},
}

const kcalThresholds = {
    25: { description: "Extremely low", ...OUTSTANDING},
    50: { description: "Very Low", ...EXCELLENT},
    100: { description: "Low", ...GOOD},
    150: { description: "Average", ...OKAY},
    250: { description: "Elevated", ...SUBOPTIMAL},
    300: { description: "High", ...BAD},
    380: { description: "Very high", ...POOR},
}

const giThresholds = {
    "-100": { description: "Low", ...GOOD},
    "0": { description: "Average", ...NEUTRAL},
    10: { description: "High", ...SUBOPTIMAL},
}

const scoreDescriptors = {
    "ff": {
        appendName: "Fullness Factor",
        descriptor: ffThresholds,
    },
    "water": {
        appendName: "Water Content",
        descriptor: waterThresholds,
    },
    "kcal": {
        appendName: "Calories",
        descriptor: kcalThresholds,
    },
    "giProxy": {
        appendName: "Estimated Glycemic Index",
        descriptor: giThresholds,
    }
}


export default function satietyToReadable(report: any) {
    if(!report.satiety) return []
    const items = []
    for(const [key, value] of Object.entries(scoreDescriptors)) {
        const score = report.satiety[key]
        const item = getHighestThreshold(score, value.descriptor)
        if(!item) continue
        const description = item.description + " " + value.appendName
        items.push({
            description,
            color: item.color,
            icon: item.icon,
            value: item.value
        })
    }
    const contributors = report.contributors["sidx"]?.contributors || []
    for(const contributor of contributors) {
        if(contributor.totalContribution > 75) {
            items.push({
                description: "Filling from " + contributor.name,
                ...GOOD
            })
        }
    }
    items.sort((a, b) => b.value - a.value)
    return items
}
