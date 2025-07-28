const thresholds = {
    0: {
        description: "No",
        color: "text-gray-700",
        icon: "remove",
    },
    1: {description: "Trace", color: "text-gray-800", icon: "remove"},
    2: {description: "Some", color: "text-green-700", icon: "stat_1"},
    3: {description: "Moderate", color: "text-green-800", icon: "stat_1"},
    4: {description: "Decent", color: "text-emerald-700", icon: "stat_2"},
    5: {description: "High in", color: "text-emerald-800", icon: "stat_2"},
    6: {description: "Very high in", color: "text-blue-800", icon: "stat_3"},
    7: {description: "Excellent source of", color: "text-blue-900", icon: "stat_3"},
    8: {description: "Exceptional source of", color: "text-purple-800", icon: "star_rate"},
    9: {description: "Superior source of", color: "text-purple-900", icon: "star_rate"},
};

const compounds = ["polyphenols", "carotenoids", "glucosinolates"]

export default function protectiveCompoundsToReadable(report: any) {
    const items = []
    for (const compound of compounds) {
        const value = report.protectiveCompounds[compound]
        const highestThreshold = getHighestThreshold(value, thresholds)
        const description = highestThreshold.description + " " + capitalize(compound)
        items.push({
            description: description,
            color: highestThreshold.color,
            icon: highestThreshold.icon,
            value
        })
    }
    items.sort((a, b) => b.value - a.value)
    return items
}