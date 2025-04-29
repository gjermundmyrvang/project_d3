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