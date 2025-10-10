import * as generics from "~/utils/format/genericDescriptors";
import { getGrade } from "~/utils/constants/grades";



const wholeFoodThresholds = {
    0: {...generics.POOR},
    0.2: {...generics.BAD},
    0.3: {...generics.SUBOPTIMAL},
    0.4: {...generics.NEUTRAL},
    0.5: {...generics.OKAY},
    0.6: {...generics.GOOD},
    0.75: {...generics.GREAT},
    0.85: {...generics.EXCELLENT},
    0.99: {...generics.OUTSTANDING},
}

const ultraProcessedThresholds = {
    0: {...generics.GOOD},
    1: {...generics.NEUTRAL},
    2: {...generics.SUBOPTIMAL},
    3: {...generics.BAD},
    4: {...generics.POOR}}


const novaDescriptorsFood = {
    1: {description: "NOVA Classifiaction: Whole (1)", ...generics.GOOD},
    2: {description: "NOVA Classifiaction: Traditionally processed (2)", ...generics.OKAY},
    3: {description: "NOVA Classifiaction: Processed (3)", ...generics.SUBOPTIMAL},
    4: {description: "NOVA Classifiaction: Ultra-processed (4)", ...generics.BAD},
}

export default function processingLevelToReadable(report: any, isFood: boolean) {
    if(!report.processingLevel) return []
    if(isFood) {
        return [
            novaDescriptorsFood[report.processingLevel.nova as keyof typeof novaDescriptorsFood]
        ]
    }
    const items = []
    const roundedGrade = getGrade(report.processingLevel.processing_level_score)[0]
    const overallProcessingItem = generics.genericDescriptors[roundedGrade as keyof typeof generics.genericDescriptors]
    const wholeFoodItem = generics.getHighestThreshold(report.processingLevel.whole_food_percentage, wholeFoodThresholds)
    const ultraProcessedItem = generics.getHighestThreshold(report.processingLevel.ultra_processed_count, ultraProcessedThresholds)
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