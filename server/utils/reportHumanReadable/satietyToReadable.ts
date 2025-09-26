import * as generics from "~/utils/format/genericDescriptors";


const ffThresholds = {
    0: { description: "Very low", ...generics.POOR},
    1: { description: "Low", ...generics.BAD},
    1.5: { description: "Below average", ...generics.SUBOPTIMAL},
    2: { description: "Decent", ...generics.NEUTRAL},
    2.5: { description: "Moderate", ...generics.OKAY},
    3: { description: "High", ...generics.GREAT},
    3.5: { description: "Very high", ...generics.GREAT},
    4: { description: "Excellent", ...generics.EXCELLENT},
}

const waterThresholds = {
    0: { description: "Minimal", ...generics.NEUTRAL},
    15: { description: "Low", ...generics.NEUTRAL},
    30: { description: "Slightly low", ...generics.OKAY},
    50: { description: "Average", ...generics.OKAY},
    60: { description: "Moderate", ...generics.GOOD},
    70: { description: "High", ...generics.GREAT},
    85: { description: "Very high", ...generics.EXCELLENT},
}

const kcalThresholds = {
    25: { description: "Extremely low", ...generics.OUTSTANDING},
    50: { description: "Very Low", ...generics.EXCELLENT},
    100: { description: "Low", ...generics.GOOD},
    150: { description: "Average", ...generics.OKAY},
    250: { description: "Elevated", ...generics.SUBOPTIMAL},
    300: { description: "High", ...generics.BAD},
    380: { description: "Very high", ...generics.POOR},
}

const giThresholds = {
    "-100": { description: "Low", ...generics.GOOD},
    "0": { description: "Average", ...generics.NEUTRAL},
    10: { description: "High", ...generics.SUBOPTIMAL},
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


export default function satietyToReadable(report: any, isFood: boolean) {
    if(!report.satiety) return []
    const items = []
    for(const [key, value] of Object.entries(scoreDescriptors)) {
        const score = report.satiety[key]
        const item = generics.getHighestThreshold(score, value.descriptor)
        if(!item) continue
        const description = item.description + " " + value.appendName
        items.push({
            description,
            color: item.color,
            icon: item.icon,
            value: item.value
        })
    }
    if(!isFood) {
    const contributors = report.contributors["sidx"]?.contributors || []
    for(const contributor of contributors) {
        if(contributor.totalContribution > 75) {
            items.push({
                description: "Filling from " + contributor.name,
                ...generics.GOOD
            })
        }
    }
}
    items.sort((a, b) => b.value - a.value)
    return items
}
