const aminoAcidRatioDescriptors = {
    0: {description: "Very poor amino acid profile", ...POOR},
    0.5: {description: "Poor amino acid profile", ...BAD},
    0.7: {description: "Suboptimal amino acid profile", ...SUBOPTIMAL},
    0.85: {description: "Decent amino acid profile", ...NEUTRAL},
    0.99: {description: "Complete amino acid profile", ...GOOD},
    1.25: {description: "Rich amino acid profile", ...GREAT},
    1.5: {description: "Excellent amino acid profile", ...EXCELLENT},
}

const proteinPerServingDescriptors = {
    0: POOR,
    8: BAD,
    12: SUBOPTIMAL,
    16: NEUTRAL,
    20: OKAY,
    25: GOOD,
    30: GREAT,
    40: EXCELLENT,
    50: OUTSTANDING
}

const proteinPerKcalDescriptors = {
    0: POOR,
    0.05: BAD,
    0.1: SUBOPTIMAL,
    0.13: OKAY,
    0.18: GOOD,
    0.25: GREAT,
    0.35: EXCELLENT,
    0.5: OUTSTANDING
}





export default function proteinToReadable(report) {
    const items = []
    const qualityItem = getHighestThreshold(report.protein.limitingAA_ratio, aminoAcidRatioDescriptors)
    const proteinPerServingItem = getHighestThreshold(report.protein.total_protein_per_serving, proteinPerServingDescriptors)
    const proteinPerKcalItem = getHighestThreshold(report.protein.protein_kcal_ratio, proteinPerKcalDescriptors)

    items.push(qualityItem)
    items.push({
        ...proteinPerServingItem,
        description: (report.protein.total_protein_per_serving).toFixed(0) + "g protein per serving",
    })
    items.push({
        ...proteinPerKcalItem,
        description: (report.protein.protein_kcal_ratio * 100).toFixed(0) + "% kcal from protein",
    })

    if(report.protein.limitingAA_ratio < 1) {
        items.push({
            ...qualityItem,
            description: "Protein quality limited by low " + report.protein.limitingAA,
        })
    }

    items.sort((a, b) => b.value - a.value)
    return items
}