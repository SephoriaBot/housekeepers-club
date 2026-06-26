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

export const PLANT_PROBLEMS = [
  {
    symptom: 'yellow_leaves',
    diagnosis: 'Overwatering',
    description: 'Roots staying too wet causing stress.',
    fix: [
      'Let soil dry out before next watering',
      'Check drainage holes',
      'Remove damaged leaves'
    ],
    prevention: [
      'Water only when top 2 inches are dry',
      'Use well-draining soil'
    ],
    confidence: 80,
    severity: 'medium'
  },
  {
    symptom: 'yellow_leaves',
    diagnosis: 'Underwatering',
    description: 'Plant not receiving enough moisture.',
    fix: [
      'Water deeply until soil is fully moist',
      'Soak if soil is hydrophobic'
    ],
    prevention: [
      'Check soil weekly',
      'Don’t let it fully dry out too often'
    ],
    confidence: 70,
    severity: 'medium'
  },
  {
    symptom: 'drooping',
    diagnosis: 'Water stress',
    description: 'Either too much or too little water.',
    fix: [
      'Check soil moisture first',
      'Adjust watering schedule accordingly'
    ],
    prevention: [
      'Monitor soil before watering'
    ],
    confidence: 75,
    severity: 'low'
  }
]