type ReadableGradeItem = {
    value: number;
    description: string;
    color: string;
    icon: string
    subtitle: string | null
}

type ReadableGrades = ReadableGradeItem[]

const gradeSorters = {
    "F": {
        value: 0,
        ...POOR
    },
    "E": {
        value: 1,
        ...BAD
    },
    "D": {
        value: 2,
        ...SUBOPTIMAL
    },
    "C": {
        value: 3,
        ...NEUTRAL
    },
    "B": {
        value: 4,
        ...GOOD
    },
    "A": {
        value: 5,
        ...GREAT
    },
    "S": {
        value: 6,
        ...EXCELLENT
    },
}


const satietyDescriptors = {
    "F": {description: "Not filling at all", ...POOR},
    "E": {description: "Not very filling", ...BAD},
    "D": {description: "Not very filling", ...SUBOPTIMAL},
    "C": {description: "Somewhat filling", ...OKAY},
    "B": {description: "Filling", ...GOOD},
    "A": {description: "Very filling", ...GREAT},
    "S": {description: "Extremely filling", ...EXCELLENT},
}

const processingLevelDescriptors = {
    "F": {description: "Highly processed ingredients", ...POOR},
    "E": {description: "Very processed ingredients", ...BAD},
    "D": {description: "Mostly processed ingredients", ...SUBOPTIMAL},
    "C": {description: "Moderately processed ingredients", ...OKAY},
    "B": {description: "Mostly whole ingredients", ...GOOD},
    "A": {description: "Minimally processed ingredients", ...GREAT},
    "S": {description: "Whole ingredients", ...EXCELLENT},
}

const scoreDescriptors= {
    mnidx: {
        appendName: "Micronutrients",
        descriptor: positiveAmountDescriptors,
        contributor_col: "mnidx",
        display_subtitle_thresh: 38,
        display_if: "bigger"
    },
    satiety: {
        appendName: "",
        descriptor: satietyDescriptors,
        contributor_col: "sidx",
        display_subtitle_thresh: 38,
        display_if: "bigger"
    },
    fat_profile_score: {
        appendName: "Fatty Acid Profile",
        descriptor: genericDescriptors,
        //contributor_col: "fat_profile_score",
        //display_subtitle_thresh: 38,
        //display_if: "bigger"
    },
    processing_level_score: {
        appendName: "",
        descriptor: processingLevelDescriptors,
    },
    protein_score: {
        appendName: "Protein",
        descriptor: positiveAmountDescriptors,
        contributor_col: "protein",
        display_subtitle_thresh: 38,
        display_if: "bigger"
    },
    sugar_score: {
        appendName: "Added Sugars",
        descriptor: negativeAmountDescriptors,
        contributor_col: "sugar",
        display_subtitle_thresh: 38,
        display_if: "smaller"
    },
    fiber_score: {
        appendName: "Fiber",
        descriptor: positiveAmountDescriptors,
        contributor_col: "fiber",
        display_subtitle_thresh: 38,
        display_if: "bigger"
    },
    salt_score: {
        appendName: "Sodium",
        descriptor: negativeAmountDescriptors,
        contributor_col: "salt",
        display_subtitle_thresh: 38,
        display_if: "smaller"
    },
    protective_score: {
        appendName: "Protective Compounds",
        descriptor: positiveAmountDescriptors,
        contributor_col: "protective_score",
        display_subtitle_thresh: 38,
        display_if: "bigger"
    },
}

export default function gradesToReadable(report, recipe: RecipeProcessed) {
    const readable: ReadableGrades = []
    for (const scoreCategory in scoreDescriptors) {
        const score = recipe[scoreCategory]
        const roundedGrade = getGrade(score)[0]
        const item = scoreDescriptors[scoreCategory]
        const descriptor = item.descriptor[roundedGrade]
        const description = descriptor.description + " " + item.appendName
        const contributors = report?.contributors?.[item.contributor_col]?.contributors || []
        const subtitle = contributorsToReadable(contributors)
        const display_subtitle_thresh = item.display_subtitle_thresh
        const display_if = item.display_if
        const display_subtitle = display_if === "bigger" ? score > display_subtitle_thresh : score < display_subtitle_thresh
        readable.push({
            value: descriptor.value,
            description,
            color: descriptor.color,
            icon: descriptor.icon,
            subtitle: (display_subtitle && subtitle) ? subtitle : null,
        })
    }
    readable.sort((a, b) => b.value - a.value)
    return readable
}