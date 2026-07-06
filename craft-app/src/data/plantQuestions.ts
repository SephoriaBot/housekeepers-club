export interface QuestionOption {
  value: string;
  label: string;
}

export interface TroubleshootQuestion {
  id: string;
  question: string;
  options: QuestionOption[];
}

export const SYMPTOMS: QuestionOption[] = [
  { value: "yellow_leaves", label: "Yellow leaves" },
  { value: "brown_tips", label: "Brown leaf tips" },
  { value: "brown_spots", label: "Brown spots" },
  { value: "wilting", label: "Wilting" },
  { value: "dropping_leaves", label: "Leaves falling off" },
  { value: "curling_leaves", label: "Curling leaves" },
  { value: "leggy_growth", label: "Leggy growth" },
  { value: "slow_growth", label: "Slow or no growth" },
  { value: "sunburn", label: "Burned or bleached leaves" },
  { value: "pests", label: "Bugs or pests" },
  { value: "mold", label: "Mold or fungus" },
  { value: "root_rot", label: "Root or stem is mushy" },
];

export const FOLLOW_UP_QUESTIONS: TroubleshootQuestion[] = [
  {
    id: "soil",
    question: "How does the soil feel?",
    options: [
      { value: "dry", label: "Dry" },
      { value: "slightly_moist", label: "Slightly moist" },
      { value: "wet", label: "Very wet" }
    ]
  },
  {
    id: "light",
    question: "How much light does the plant receive?",
    options: [
      { value: "low", label: "Low light" },
      { value: "bright_indirect", label: "Bright indirect light" },
      { value: "direct", label: "Direct sun" }
    ]
  },
  {
    id: "watering",
    question: "When was it last watered?",
    options: [
      { value: "today", label: "Today" },
      { value: "few_days", label: "A few days ago" },
      { value: "week_plus", label: "Over a week ago" }
    ]
  },
  {
    id: "drainage",
    question: "Does the pot have drainage holes?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" }
    ]
  }
];

export interface PlantProblem {
  symptom: string;
  diagnosis: string;
  confidence: number;
  severity: "Low" | "Medium" | "High";
  description: string;
  fix: string[];
  prevention: string[];
}

export const PLANT_PROBLEMS: PlantProblem[] = [
  {
    symptom: "yellow_leaves",
    diagnosis: "Overwatering",
    confidence: 80,
    severity: "Medium",
    description: "Roots staying too wet causing oxygen deprivation.",
    fix: ["Let soil dry out before next watering", "Check drainage holes", "Remove damaged leaves"],
    prevention: ["Water only when top 2 inches are dry", "Use well-draining soil"]
  },
  {
    symptom: "yellow_leaves",
    diagnosis: "Underwatering",
    confidence: 70,
    severity: "Medium",
    description: "Plant not receiving enough moisture.",
    fix: ["Water deeply until soil is fully moist", "Soak if soil is hydrophobic"],
    prevention: ["Check soil weekly", "Don't let it fully dry out too often"]
  },
  {
    symptom: "brown_tips",
    diagnosis: "Low Humidity",
    confidence: 85,
    severity: "Low",
    description: "Dry indoor air is causing leaf tips to dry out.",
    fix: ["Increase humidity with a humidifier or pebble tray", "Trim brown tips if desired"],
    prevention: ["Group plants together", "Mist occasionally"]
  },
  {
    symptom: "brown_tips",
    diagnosis: "Fluoride or Salt Buildup",
    confidence: 70,
    severity: "Low",
    description: "Minerals from tap water or fertilizer accumulating in the soil.",
    fix: ["Flush soil thoroughly with water", "Switch to filtered or distilled water"],
    prevention: ["Flush soil every few months", "Avoid over-fertilizing"]
  },
  {
    symptom: "brown_spots",
    diagnosis: "Fungal Leaf Spot",
    confidence: 80,
    severity: "Medium",
    description: "Fungal infection causing brown or black spots on leaves.",
    fix: ["Remove affected leaves", "Apply a fungicide", "Improve air circulation"],
    prevention: ["Avoid wetting leaves when watering", "Don't overcrowd plants"]
  },
  {
    symptom: "brown_spots",
    diagnosis: "Sunburn",
    confidence: 75,
    severity: "Low",
    description: "Direct or intense light is scorching the leaves.",
    fix: ["Move plant out of direct sun", "Remove badly damaged leaves"],
    prevention: ["Acclimate plants gradually to brighter light"]
  },
  {
    symptom: "wilting",
    diagnosis: "Underwatering",
    confidence: 85,
    severity: "Medium",
    description: "Plant is drooping due to lack of water.",
    fix: ["Water thoroughly right away", "Check soil moisture before next watering"],
    prevention: ["Water on a consistent schedule", "Check soil weekly"]
  },
  {
    symptom: "wilting",
    diagnosis: "Overwatering / Root Rot",
    confidence: 75,
    severity: "High",
    description: "Roots may be rotting, preventing water uptake even when soil is wet.",
    fix: ["Check roots for rot", "Repot in fresh dry soil if roots are mushy", "Trim damaged roots"],
    prevention: ["Never let plant sit in standing water", "Ensure drainage"]
  },
  {
    symptom: "dropping_leaves",
    diagnosis: "Environmental Stress",
    confidence: 80,
    severity: "Medium",
    description: "Sudden changes in temperature, light, or humidity cause leaf drop.",
    fix: ["Move plant to a stable location", "Avoid cold drafts or heat vents"],
    prevention: ["Keep plant in consistent conditions", "Avoid moving it frequently"]
  },
  {
    symptom: "dropping_leaves",
    diagnosis: "Overwatering",
    confidence: 70,
    severity: "Medium",
    description: "Waterlogged roots can cause leaves to yellow and drop.",
    fix: ["Let soil dry out", "Check drainage"],
    prevention: ["Water only when soil is partially dry"]
  },
  {
    symptom: "curling_leaves",
    diagnosis: "Underwatering or Low Humidity",
    confidence: 80,
    severity: "Low",
    description: "Leaves curl inward to conserve moisture.",
    fix: ["Water thoroughly", "Increase humidity"],
    prevention: ["Keep soil consistently moist for humidity-loving plants"]
  },
  {
    symptom: "curling_leaves",
    diagnosis: "Heat or Light Stress",
    confidence: 70,
    severity: "Low",
    description: "Too much heat or direct sun causes leaves to curl.",
    fix: ["Move away from direct sun or heat sources"],
    prevention: ["Keep plant in bright indirect light"]
  },
  {
    symptom: "leggy_growth",
    diagnosis: "Insufficient Light",
    confidence: 90,
    severity: "Low",
    description: "Plant is stretching toward a light source due to low light conditions.",
    fix: ["Move to a brighter location", "Rotate the pot regularly"],
    prevention: ["Provide bright indirect light", "Supplement with a grow light if needed"]
  },
  {
    symptom: "slow_growth",
    diagnosis: "Low Light or Nutrients",
    confidence: 75,
    severity: "Low",
    description: "Plant isn't getting enough light or nutrients to grow actively.",
    fix: ["Move to brighter light", "Feed with a balanced fertilizer during growing season"],
    prevention: ["Fertilize monthly in spring and summer"]
  },
  {
    symptom: "slow_growth",
    diagnosis: "Root Bound",
    confidence: 65,
    severity: "Low",
    description: "Roots have outgrown the pot and have no room to expand.",
    fix: ["Repot into a container 1-2 inches larger", "Refresh soil"],
    prevention: ["Repot every 1-2 years"]
  },
  {
    symptom: "sunburn",
    diagnosis: "Sun Scorch",
    confidence: 90,
    severity: "Low",
    description: "Leaves exposed to intense direct sunlight develop bleached or crispy patches.",
    fix: ["Move plant out of direct sun", "Remove damaged leaves"],
    prevention: ["Acclimate slowly to brighter conditions", "Use sheer curtains to diffuse light"]
  },
  {
    symptom: "pests",
    diagnosis: "Common Houseplant Pests",
    confidence: 95,
    severity: "Medium",
    description: "May be spider mites, aphids, mealybugs, fungus gnats, or scale.",
    fix: ["Isolate the plant immediately", "Inspect all leaves top and bottom", "Treat with insecticidal soap or neem oil"],
    prevention: ["Inspect new plants before bringing them home", "Avoid overcrowding"]
  },
  {
    symptom: "mold",
    diagnosis: "Fungal Growth / Overwatering",
    confidence: 85,
    severity: "Medium",
    description: "White mold on soil or leaves indicates excess moisture and poor air circulation.",
    fix: ["Remove moldy soil layer and replace", "Reduce watering frequency", "Improve air circulation"],
    prevention: ["Avoid overwatering", "Don't let water sit on leaves"]
  },
  {
    symptom: "root_rot",
    diagnosis: "Root Rot",
    confidence: 98,
    severity: "High",
    description: "Roots are rotting from consistently wet soil, often with a foul smell.",
    fix: ["Remove plant from pot", "Trim all black or mushy roots", "Repot in fresh well-draining soil"],
    prevention: ["Never let plant sit in standing water", "Ensure pot has drainage holes"]
  }
]
