import * as generics from "~/utils/format/genericDescriptors";


const aminoAcidRatioDescriptors = {
    0: {description: "Very poor amino acid profile", ...generics.POOR},
    0.5: {description: "Poor amino acid profile", ...generics.BAD},
    0.7: {description: "Suboptimal amino acid profile", ...generics.SUBOPTIMAL},
    0.85: {description: "Decent amino acid profile", ...generics.NEUTRAL},
    0.99: {description: "Complete amino acid profile", ...generics.GOOD},
    1.25: {description: "Rich amino acid profile", ...generics.GREAT},
    1.5: {description: "Excellent amino acid profile", ...generics.EXCELLENT},
}

const proteinPerServingDescriptors = {
    0: generics.POOR,
    8: generics.BAD,
    12: generics.SUBOPTIMAL,
    16: generics.NEUTRAL,
    20: generics.OKAY,
    25: generics.GOOD,
    30: generics.GREAT,
    40: generics.EXCELLENT,
    50: generics.OUTSTANDING
}

const proteinPerKcalDescriptors = {
    0: generics.POOR,
    0.05: generics.BAD,
    0.1: generics.SUBOPTIMAL,
    0.13: generics.OKAY,
    0.18: generics.GOOD,
    0.25: generics.GREAT,
    0.35: generics.EXCELLENT,
    0.5: generics.OUTSTANDING
}





export default function proteinToReadable(report: any, isFood: boolean) {
    const items = []
    const qualityItem = generics.getHighestThreshold(report.protein.limitingAA_ratio, aminoAcidRatioDescriptors)
    const proteinPerServingItem = generics.getHighestThreshold(report.protein.total_protein_per_serving, proteinPerServingDescriptors)
    const proteinPerKcalItem = generics.getHighestThreshold(report.protein.protein_kcal_ratio, proteinPerKcalDescriptors)
    items.push(qualityItem)
    items.push({
        ...proteinPerServingItem,
        description: isFood ? (report.protein.total_protein_per_100g.toFixed(0) + "g protein per 100g") : ((report.protein.total_protein_per_serving).toFixed(0) + "g protein per serving"),
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