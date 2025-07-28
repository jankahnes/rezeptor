const transScoreDescriptor = {
    0: {
        description: "Excessive",
        ...WARNING
    },
    10: {description: "Very high in", ...POOR},
    20: {description: "High in", ...BAD},
    30: {description: "Notable", ...SUBOPTIMAL},
    40: {description: "Some", ...SUBOPTIMAL},
    49: {description: "No", ...OKAY},
}

const positiveAmountDescriptors = {
    0:   {description: "Minimal", ...NEUTRAL},
    20:  {description: "Some", ...OKAY},
    40:  {description: "Moderate", ...GOOD},
    60:  {description: "Good source of", ...GREAT},
    80:  {description: "Excellent source of", ...EXCELLENT},
    100: {description: "Outstanding source of", ...OUTSTANDING}
  };


  const negativeAmountDescriptors = {
    0:  {description: "Too high in", ...POOR},
    20: {description: "High in", ...BAD},
    35: {description: "Moderate", ...SUBOPTIMAL},
    50: {description: "Average", ...NEUTRAL},
    60: {description: "Low in", ...GOOD},
    80: {description: "Very low in", ...GREAT},
    100:{description: "Minimal in", ...EXCELLENT}
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
        descriptor: genericThresholds,
    },
    "trans_score": {
        appendName: "Trans Fats",
        descriptor: transScoreDescriptor,
    }
}

export default function fatProfileToReadable(report) {
    const items = []
    for(const [key, value] of Object.entries(scoreDescriptors)) {
        const score = report.fatProfile[key]
        const item = getHighestThreshold(score, value.descriptor)
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
