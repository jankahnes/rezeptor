const wholeFoodThresholds = {
    0: {...POOR},
    0.2: {...BAD},
    0.3: {...SUBOPTIMAL},
    0.4: {...NEUTRAL},
    0.5: {...OKAY},
    0.6: {...GOOD},
    0.75: {...GREAT},
    0.85: {...EXCELLENT},
    0.99: {...OUTSTANDING},
}

const ultraProcessedThresholds = {
    0: {...GOOD},
    1: {...NEUTRAL},
    2: {...SUBOPTIMAL},
    3: {...BAD},
    4: {...POOR}}


export default function processingLevelToReadable(report: any) {
    if(!report.processingLevel) return []
    const items = []
    const roundedGrade = getGrade(report.processingLevel.processing_level_score)[0]
    const overallProcessingItem = genericDescriptors[roundedGrade]
    const wholeFoodItem = getHighestThreshold(report.processingLevel.whole_food_percentage, wholeFoodThresholds)
    const ultraProcessedItem = getHighestThreshold(report.processingLevel.ultra_processed_count, ultraProcessedThresholds)
    items.push({
        ...wholeFoodItem,
        description: (report.processingLevel.whole_food_percentage * 100).toFixed(0) + "% whole food ingredients",
    })
    items.push({
        ...ultraProcessedItem,
        description: report.processingLevel.ultra_processed_count + " ultra-processed ingredients",
    })
    items.push({
        ...overallProcessingItem,
        description: overallProcessingItem.description + " overall processing level",
    })
    items.sort((a, b) => b.value - a.value)
    return items
}