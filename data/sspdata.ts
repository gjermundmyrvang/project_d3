export interface SspScenario {
    scenarioActivity: string;
    effectOnGlobalTempC: number;
    timeframe: number;
  }

export interface SspDescription {
    ssp: number;
    name: string;
    summary: string;
  }

  export interface ClimateImpact {
    id: number;
    warmingLevelC: number;
    sspRange: string;
    impacts: string[];
    description: string;
  }

export interface SSPFactors {
  fossilFuelUse: number;        // 0 (low) to 1 (high)
  cooperation: number;          // 0 (strong) to 1 (weak)
  techDevelopment: number;      // 0 (slow) to 1 (fast)
  sustainabilityFocus: number;  // 0 (low) to 1 (high)
  equity: number;               // 0 (low) to 1 (high)
};

export interface SSPQuestion {
  qid: keyof SSPFactors;
  question: string;
  labels: string[]
}

export const sspScenarios = [
    {
      scenarioActivity: "SSP1-1.9 (Sustainability)",
      effectOnGlobalTempC: 1.5,
      timeframe: 2100,
    },
    {
      scenarioActivity: "SSP2-4.5 (Middle of the Road)",
      effectOnGlobalTempC: 2.7,
      timeframe: 2100,
    },
    {
      scenarioActivity: "SSP3-7.0 (Regional Rivalry)",
      effectOnGlobalTempC: 3.6,
      timeframe: 2100,
    },
    {
      scenarioActivity: "SSP5-8.5 (Fossil-fueled Development)",
      effectOnGlobalTempC: 4.4,
      timeframe: 2100,
    },
    {
      scenarioActivity: "Continued Current Emissions",
      effectOnGlobalTempC: 3.1,
      timeframe: 2100,
    },
    {
        scenarioActivity: "Immediate Global Emission Reductions",
        effectOnGlobalTempC: 1.5,
        timeframe: 2030,
      },
      {
        scenarioActivity: "Deforestation (e.g., Amazon)",
        effectOnGlobalTempC: 0.25,
        timeframe: -1,
      },
  ];

export const sspDescriptions = [
  {
      ssp: 1,
      title: "Sustainability",
      description: "A world that shifts toward sustainability and equity. Low emissions, renewable energy, and strong international cooperation. Climate change is mitigated early.",
  },
  {
      ssp: 2,
      title: "Continuation",
      description: "Continuation of current trends. Some progress on sustainability, but uneven. Moderate emissions and adaptation challenges.",
  },
  {
      ssp: 3,
      title: "Regional Conflicts",
      description: "Fragmented world with regional conflicts. Weak global cooperation, slow tech development, and high emissions. Difficult to mitigate or adapt.",
  },
  {
      ssp: 4,
      title: "Inequality",
      description: "Growing inequality. Rich countries adapt and mitigate; poor regions struggle. Advanced tech is unevenly distributed. Moderate-to-high emissions.",
  },
  {
      ssp: 5,
      title: "Fossil-fueled Development",
      description: "Rapid economic growth, energy-intensive lifestyles, and heavy use of fossil fuels. Technological innovation is high, but emissions skyrocket.",
  },
];


export const sspImpacts: ClimateImpact[] = [
    {
      id: 1,
      warmingLevelC: 1.5,
      sspRange: "SSP1-2.6",
      impacts: [
        "More frequent extreme heat events (1.5x more likely than today)",
        "Coral reefs decline by 70-90%",
        "Arctic sea ice loss during summer once per century",
        "Small island and coastal flooding risks rise",
        "Reduced crop yields in tropical regions",
        "Species extinction risk increases (moderate)",
        "Economic damages begin rising, but remain regionally manageable",
      ],
      description: "A world that shifts toward sustainability and equity. Low emissions, renewable energy, and strong international cooperation. Climate change is mitigated early."
    },
    {
      id: 2,
      warmingLevelC: 2.0,
      sspRange: "SSP2-4.5",
      impacts: [
        "Extreme heat events 2.5x more likely",
        "99% of coral reefs severely degraded",
        "Arctic sea ice likely lost at least once per decade",
        "Increased droughts and floods globally",
        "Major reductions in agricultural yields globally",
        "Significant loss of biodiversity",
        "Higher risks to food security and human health",
      ],
      description: "Continuation of current trends. Some progress on sustainability, but uneven. Moderate emissions and adaptation challenges.",
    },
    {
      id: 3,
      warmingLevelC: 3.0,
      sspRange: "SSP3-7.0",
      impacts: [
        "Severe and frequent extreme weather events",
        "Large-scale loss of ecosystems (e.g., Amazon rainforest turning to savannah)",
        "Glacier mass loss accelerating sea level rise",
        "Hundreds of millions displaced by coastal flooding",
        "Increased conflict over water and food resources",
        "Very high risk to human health and livability in some regions (e.g., Middle East)",
      ],
      description: "Fragmented world with regional conflicts. Weak global cooperation, slow tech development, and high emissions. Difficult to mitigate or adapt.",
    },
    {
      id: 4,
      warmingLevelC: 4.0,
      sspRange: "SSP5-8.5",
      impacts: [
        "Massive biodiversity collapse",
        "Sea level rise threatening major coastal cities (New York, Shanghai, Mumbai)",
        "Ocean acidification disrupting marine food chains",
        "Widespread desertification of southern Europe, Africa, Australia",
        "Critical thresholds for habitability crossed in several regions",
        "Major agricultural collapse risks in tropics and subtropics",
        "Major strain on global economy and migration systems",
      ],
      description: "Growing inequality. Rich countries adapt and mitigate; poor regions struggle. Advanced tech is unevenly distributed. Moderate-to-high emissions. Rapid economic growth, energy-intensive lifestyles, and heavy use of fossil fuels. Technological innovation is high, but emissions skyrocket.",
    },
  ];

  export const sspProfiles: Record<string, SSPFactors> = {
    "SSP1-2.6": {
      fossilFuelUse: 0.1,
      cooperation: 0.1,
      techDevelopment: 0.6,
      sustainabilityFocus: 1.0,
      equity: 1.0,
    },
    "SSP2-4.5": {
      fossilFuelUse: 0.5,
      cooperation: 0.5,
      techDevelopment: 0.5,
      sustainabilityFocus: 0.4,
      equity: 0.5,
    },
    "SSP3-7.0": {
      fossilFuelUse: 0.9,
      cooperation: 0.9,
      techDevelopment: 0.3,
      sustainabilityFocus: 0.1,
      equity: 0.2,
    },
    "SSP5-8.5": {
      fossilFuelUse: 1.0,
      cooperation: 0.3,
      techDevelopment: 1.0,
      sustainabilityFocus: 0.1,
      equity: 0.2,
    }
  };

  export const sspQuestions: SSPQuestion[] = [
    {
      qid: "fossilFuelUse",
      question: "How reliant will the world be on fossil fuels in the future?",
      labels: [
        "Widespread clean energy adoption",
        "Balanced mix of fossil and renewables",
        "Heavy fossil fuel dependence"
      ]
    },
    {
      qid: "cooperation",
      question: "How strong will international cooperation on climate and sustainability be?",
      labels: [
        "Strong global collaboration",
        "Regional partnerships",
        "National self-interest dominates",
      ]
    },
    {
      qid: "sustainabilityFocus",
      question: "What will be prioritized in economic growth?",
      labels: [
        "Sustainability",
        "Balanced",
        "Maximum economic output"
      ]
    },
    {
      qid: "techDevelopment",
      question: "How rapidly will green and climate technology advance?",
      labels: [
        "Slow",
        "Moderate",
        "Rapid innovation"
      ]
    },
    {
      qid: "equity",
      question: "How much global inequality will exist?",
      labels: [
        "Low (more equity and fair development)",
        "Medium",
        "High (unequal development paths)"
      ]
    },
  ];