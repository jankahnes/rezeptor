export const WARNING = {icon: "warning", color: "text-red-900", value: -1};
export const POOR = {icon: "stat_minus_3", color: "text-red-900", value: 0};
export const BAD = {icon: "stat_minus_2", color: "text-red-800", value: 1};
export const SUBOPTIMAL = {icon: "stat_minus_1", color: "text-orange-800", value: 2};

export const NEUTRAL = {icon: "remove", color: "text-gray-800", value: 3};

export const OKAY = {icon: "check", color: "text-green-800", value: 4};
export const GOOD = {icon: "stat_1", color: "text-emerald-700", value: 5};
export const GREAT = {icon: "stat_2", color: "text-emerald-800", value: 6};
export const EXCELLENT = {icon: "stat_3", color: "text-blue-800", value: 7};
export const OUTSTANDING = {icon: "star_rate", color: "text-purple-800", value: 8};


export const genericDescriptors = {
    "F": {description: "Very bad", ...POOR},
    "E": {description: "Bad", ...BAD},
    "D": {description: "Suboptimal", ...SUBOPTIMAL},
    "C": {description: "Decent", ...OKAY},
    "B": {description: "Good", ...GOOD},
    "A": {description: "Very good", ...GREAT},
    "S": {description: "Excellent", ...EXCELLENT},
}

export const positiveAmountDescriptors = {
    "F": {description: "Not a source of", ...POOR},
    "E": {description: "Very low in", ...BAD},
    "D": {description: "Low in", ...SUBOPTIMAL},
    "C": {description: "Decent source of", ...OKAY},
    "B": {description: "Good source of", ...GOOD},
    "A": {description: "Very good source of", ...GREAT},
    "S": {description: "Excellent source of", ...EXCELLENT},
}

export const negativeAmountDescriptors = {
    "F": {description: "Excessive", ...POOR},
    "E": {description: "High in", ...BAD},
    "D": {description: "Elevated", ...SUBOPTIMAL},
    "C": {description: "Normal amount of", ...OKAY},
    "B": {description: "Low in", ...GOOD},
    "A": {description: "Very low in", ...GREAT},
    "S": {description: "Minimal", ...EXCELLENT},
}

export const wholeSpectrumColors = {
    "F": "text-red-950",
    "E": "text-red-900",
    "D": "text-orange-900",
    "C": "text-gray-700",
    "B": "text-green-800",
    "A": "text-emerald-800",
    "S": "text-blue-800",
}

export const wholeSpectrumIcons = {
    "F": "arrow_cool_down",
    "E": "keyboard_arrow_down",
    "D": "keyboard_arrow_down",
    "C": "remove",
    "B": "check",
    "A": "star_rate",
    "S": "star_shine",
}

export const gradeValues = {
    "F": 0,
    "E": 1,
    "D": 2,
    "C": 3,
    "B": 4,
    "A": 5,
    "S": 6,
}

export const genericThresholds = {
    0:   { description: "Poor", ...POOR },
    15:  { description: "Subpar", ...BAD },
    30:  { description: "Suboptimal", ...SUBOPTIMAL },
    45:  { description: "Acceptable", ...OKAY },
    60:  { description: "Good", ...GOOD },
    80:  { description: "Excellent", ...GREAT },
    100: { description: "Ideal", ...EXCELLENT }
  };

export function getHighestThreshold(value: number, thresholds: Record<number, any>) {
    let highestThreshold = thresholds[0]
    for(const threshold of Object.keys(thresholds)) {
        if(value >= Number(threshold)) {
            highestThreshold = thresholds[Number(threshold)]
        }
    }
    return highestThreshold
}