export const mockResources = [
  {
    id: 1,
    name: "Office of Financial Aid",
    category: "financial-aid",
    location: "Room 241, North Building",
    description:
      "Provides assistance for students with demonstrated financial need, scholarships, grants, and financial aid questions.",
    eligibilitySummary:
      "Best for students who need help understanding financial aid, FAFSA, scholarships, grants, or account holds.",
    sourceUrl: "https://hunter.cuny.edu/students/financial-aid",
    eligibilityRules: {
      enrollment: ["Full-Time", "Part-Time"],
      income: ["Under 25k/year", "25k-50k/year"],
      housing: [],
      citizenship: ["US Citizen/Resident", "DACA Undocumented"],
    },
  },
  {
    id: 2,
    name: "The Purple Apron Food Pantry",
    category: "food",
    location: "68th Street Campus, West Building 103",
    description:
      "Provides food support for currently enrolled CUNY students with a valid CUNY ID.",
    eligibilitySummary:
      "All currently enrolled CUNY students with a valid CUNY ID may use this resource.",
    sourceUrl:
      "https://www.hunter.cuny.edu/students/health-wellness/emergency-support",
    eligibilityRules: {
      enrollment: ["Full-Time", "Part-Time", "Non-Degree"],
      income: ["Under 25k/year", "25k-50k/year"],
      housing: ["Renting off campus", "Living at home", "Unstable/at Risk"],
      citizenship: [
        "US Citizen/Resident",
        "International Student",
        "DACA Undocumented",
      ],
    },
  },
  {
    id: 3,
    name: "Dean of Students Emergency Fund",
    category: "financial-aid",
    location: "68th Street Campus",
    description:
      "Emergency support for students facing financial hardship, housing insecurity, food insecurity, or unexpected expenses.",
    eligibilitySummary:
      "Must be enrolled and experiencing an emergency or unexpected financial hardship.",
    sourceUrl:
      "https://hunter.cuny.edu/students/health-wellness/emergency-support-resources",
    eligibilityRules: {
      enrollment: ["Full-Time", "Part-Time"],
      income: ["Under 25k/year", "25k-50k/year"],
      housing: ["Unstable/at Risk", "Renting off campus"],
      citizenship: [
        "US Citizen/Resident",
        "International Student",
        "DACA Undocumented",
      ],
    },
  },
  {
    id: 4,
    name: "Counseling & Wellness Services",
    category: "mental-health",
    location: "Hunter College Campus",
    description:
      "Confidential mental health support, short-term counseling, crisis support, and wellness resources for students.",
    eligibilitySummary:
      "Available to currently enrolled Hunter College students.",
    sourceUrl: "https://hunter.cuny.edu/students/health-wellness",
    eligibilityRules: {
      enrollment: ["Full-Time", "Part-Time"],
      income: [],
      housing: [],
      citizenship: [
        "US Citizen/Resident",
        "International Student",
        "DACA Undocumented",
      ],
    },
  },
  {
    id: 5,
    name: "International Students Office",
    category: "legal-services",
    location: "Hunter College Campus",
    description:
      "Support for international students related to immigration documents, enrollment requirements, and campus resources.",
    eligibilitySummary:
      "Best for international students who need help with visa or enrollment-related questions.",
    sourceUrl: "https://hunter.cuny.edu/students",
    eligibilityRules: {
      enrollment: ["Full-Time", "Part-Time"],
      income: [],
      housing: [],
      citizenship: ["International Student"],
    },
  },
  {
    id: 6,
    name: "Housing Insecurity Support",
    category: "housing",
    location: "Hunter College Campus",
    description:
      "Connects students facing unstable housing situations with emergency support and referral resources.",
    eligibilitySummary:
      "Best for students who are experiencing unstable housing or risk of homelessness.",
    sourceUrl:
      "https://hunter.cuny.edu/students/health-wellness/emergency-support-resources",
    eligibilityRules: {
      enrollment: ["Full-Time", "Part-Time"],
      income: ["Under 25k/year", "25k-50k/year"],
      housing: ["Unstable/at Risk"],
      citizenship: [
        "US Citizen/Resident",
        "International Student",
        "DACA Undocumented",
      ],
    },
  },
];