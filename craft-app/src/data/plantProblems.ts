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
    confidence: 90,
    severity: "Medium",
    description: "The roots are staying too wet and can't get enough oxygen.",
    fix: [
      "Allow the soil to dry before watering again.",
      "Empty any standing water from the saucer.",
      "Check the roots for rot if the problem continues."
    ],
    prevention: [
      "Water only when the top inch or two of soil is dry.",
      "Use a pot with drainage holes."
    ]
  },
  {
    symptom: "yellow_leaves",
    diagnosis: "Underwatering",
    confidence: 75,
    severity: "Low",
    description: "The plant isn't receiving enough water.",
    fix: [
      "Water thoroughly until water drains from the bottom.",
      "Keep a more consistent watering schedule."
    ],
    prevention: [
      "Check the soil weekly.",
      "Don't allow the soil to become bone dry for long periods."
    ]
  },
  {
    symptom: "brown_tips",
    diagnosis: "Low Humidity",
    confidence: 85,
    severity: "Low",
    description: "Dry indoor air is causing the leaf tips to dry out.",
    fix: [
      "Increase humidity around the plant.",
      "Trim the brown tips if desired."
    ],
    prevention: [
      "Use a humidifier or pebble tray.",
      "Keep plants grouped together."
    ]
  },
  {
    symptom: "wilting",
    diagnosis: "Water Stress",
    confidence: 85,
    severity: "Medium",
    description: "The plant is stressed from either too much or too little water.",
    fix: [
      "Check the soil moisture before watering.",
      "Adjust your watering routine."
    ],
    prevention: [
      "Monitor soil moisture regularly."
    ]
  },
  {
    symptom: "pests",
    diagnosis: "Common Houseplant Pests",
    confidence: 95,
    severity: "Medium",
    description: "The plant may have spider mites, aphids, mealybugs, or scale.",
    fix: [
      "Isolate the plant.",
      "Inspect all leaves.",
      "Treat with insecticidal soap or neem oil."
    ],
    prevention: [
      "Inspect plants regularly.",
      "Avoid overcrowding."
    ]
  },
  {
    symptom: "root_rot",
    diagnosis: "Root Rot",
    confidence: 98,
    severity: "High",
    description: "Roots are rotting from consistently wet soil.",
    fix: [
      "Remove the plant from the pot.",
      "Trim black, mushy roots.",
      "Repot in fresh, well-draining soil."
    ],
    prevention: [
      "Never let the plant sit in water.",
      "Ensure proper drainage."
    ]
  }
];