import * as generics from "~/utils/format/genericDescriptors";


const transScoreDescriptor = {
    0: {
        description: "Excessive",
        ...generics.WARNING
    },
    10: {description: "Very high in", ...generics.POOR},
    20: {description: "High in", ...generics.BAD},
    30: {description: "Notable", ...generics.SUBOPTIMAL},
    40: {description: "Some", ...generics.SUBOPTIMAL},
    49: {description: "No", ...generics.OKAY},
}

const positiveAmountDescriptors = {
    0:   {description: "Minimal", ...generics.NEUTRAL},
    20:  {description: "Some", ...generics.OKAY},
    40:  {description: "Moderate", ...generics.GOOD},
    60:  {description: "Good source of", ...generics.GREAT},
    80:  {description: "Excellent source of", ...generics.EXCELLENT},
    100: {description: "Outstanding source of", ...generics.OUTSTANDING}
  };


  const negativeAmountDescriptors = {
    0:  {description: "Too high in", ...generics.POOR},
    20: {description: "High in", ...generics.BAD},
    35: {description: "Moderate", ...generics.SUBOPTIMAL},
    50: {description: "Average", ...generics.NEUTRAL},
    60: {description: "Low in", ...generics.GOOD},
    80: {description: "Very low in", ...generics.GREAT},
    100:{description: "Minimal in", ...generics.EXCELLENT}
  };

const scoreDescriptors = {
    "saturated_score": {
        appendName: "Saturated Fats",
        descriptor: negativeAmountDescriptors,
    },
    "mufa_score": {
        appendName: "Monounsaturated Fats",
        descriptor: positiveAmountDescriptors,
    },
    "omega3_score": {
        appendName: "Omega-3 Fatty Acids",
        descriptor: positiveAmountDescriptors,
    },
    "omega6_score": {
        appendName: "Omega-6 Fatty Acids",
        descriptor: positiveAmountDescriptors,
    },
    "ratio_score": {
        appendName: "Omega-6/Omega-3 Ratio",
        descriptor: generics.genericThresholds,
    },
    "trans_score": {
        appendName: "Trans Fats",
        descriptor: transScoreDescriptor,
    }
}

export default function fatProfileToReadable(report: any) {
    const items = []
    console.log(report.fatProfile)
    for(const [key, value] of Object.entries(scoreDescriptors)) {
        const score = report.fatProfile[key]
        const item = generics.getHighestThreshold(score, value.descriptor)
        const description = item.description + " " + value.appendName
        items.push({
            description,
            color: item.color,
            icon: item.icon,
            value: item?.value ?? score/10,
        })
    }
    items.sort((a, b) => b.value - a.value)
    return items
}
