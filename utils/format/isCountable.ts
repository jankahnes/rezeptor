const nonCountableUnits = ["G", "g", "ML", "ml", "TSP", "tsp", "TBSP", "tbsp", "CUP", "cup", "OZ", "oz", "LB", "lb", "L", "l", "KG", "kg", "FREE", "free"];


export default function isCountable(unit: string) {
    return !nonCountableUnits.includes(unit);}