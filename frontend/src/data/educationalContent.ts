export interface EducationalContent {
  id: string;
  title: string;
  description: string;
  gradeLevel: 'elementary' | 'middle' | 'high' | 'all';
  type: 'activity' | 'lesson' | 'resource' | 'video';
  duration?: string;
  materials?: string[];
  objectives?: string[];
  url?: string;
}

export const educationalMaterials: EducationalContent[] = [
  {
    id: 'plant-identification-scavenger-hunt',
    title: 'Plant Identification Scavenger Hunt',
    description: 'Outdoor activity where students learn to identify common native and invasive plants in their local environment.',
    gradeLevel: 'elementary',
    type: 'activity',
    duration: '45-60 minutes',
    materials: [
      'Plant identification cards',
      'Clipboards',
      'Pencils',
      'Magnifying glasses',
      'Sample plant specimens'
    ],
    objectives: [
      'Learn to identify 5 common native plants',
      'Recognize 2-3 invasive species',
      'Understand basic plant characteristics',
      'Develop observation skills'
    ]
  },
  {
    id: 'ecosystem-connections',
    title: 'Ecosystem Connections',
    description: 'Lesson exploring how plants, animals, and humans are interconnected in local ecosystems.',
    gradeLevel: 'middle',
    type: 'lesson',
    duration: '2 class periods',
    materials: [
      'Ecosystem diagram handouts',
      'Case studies',
      'Group discussion prompts',
      'Research materials'
    ],
    objectives: [
      'Understand food webs and energy flow',
      'Identify keystone species in local ecosystems',
      'Explain how invasive species disrupt ecosystems',
      'Propose solutions for ecosystem restoration'
    ]
  },
  {
    id: 'climate-resilience-native-plants',
    title: 'Climate Resilience and Native Plants',
    description: 'Advanced lesson on how native plants contribute to climate resilience and adaptation.',
    gradeLevel: 'high',
    type: 'lesson',
    duration: '3 class periods',
    materials: [
      'Climate data sets',
      'Plant adaptation research',
      'Case studies of restoration projects',
      'GIS mapping tools'
    ],
    objectives: [
      'Analyze climate data for Central Texas',
      'Evaluate plant adaptations to climate stress',
      'Design climate-resilient landscapes',
      'Calculate carbon sequestration potential'
    ]
  },
  {
    id: 'citizen-science-project',
    title: 'Citizen Science: Invasive Species Mapping',
    description: 'Project where students contribute to real scientific research by mapping invasive species in their community.',
    gradeLevel: 'all',
    type: 'activity',
    duration: 'Ongoing project',
    materials: [
      'Smartphones with GPS',
      'Data collection forms',
      'Online mapping platform access',
      'Plant identification guides'
    ],
    objectives: [
      'Collect and record scientific data',
      'Use technology for environmental monitoring',
      'Contribute to community science efforts',
      'Analyze spatial patterns of invasive species'
    ]
  },
  {
    id: 'native-plant-propagation',
    title: 'Native Plant Propagation Workshop',
    description: 'Hands-on workshop teaching students how to propagate native plants from seeds and cuttings.',
    gradeLevel: 'middle',
    type: 'activity',
    duration: '90 minutes',
    materials: [
      'Native plant seeds',
      'Potting soil and containers',
      'Pruning shears',
      'Rooting hormone',
      'Plant labels'
    ],
    objectives: [
      'Learn plant propagation techniques',
      'Understand plant life cycles',
      'Practice sustainable gardening methods',
      'Take home propagated plants'
    ]
  }
];

export const climateResilienceContent = {
  title: 'Native Plants and Climate Resilience',
  sections: [
    {
      title: 'Carbon Sequestration',
      content: 'Native plants, especially deep-rooted perennials and trees, store significant amounts of carbon in their biomass and soil, helping mitigate climate change.'
    },
    {
      title: 'Water Conservation',
      content: 'Native plants are adapted to local rainfall patterns and require less irrigation, reducing water consumption and strain on municipal water systems.'
    },
    {
      title: 'Heat Island Reduction',
      content: 'Native vegetation helps cool urban areas through evapotranspiration and shading, reducing the urban heat island effect.'
    },
    {
      title: 'Soil Health',
      content: 'Native plant root systems improve soil structure, increase water infiltration, and reduce erosion during extreme weather events.'
    },
    {
      title: 'Biodiversity Support',
      content: 'Healthy native plant communities support diverse wildlife populations that are better able to adapt to changing climate conditions.'
    }
  ]
};

export const communityImpactContent = {
  title: 'Individual Actions, Collective Impact',
  sections: [
    {
      title: 'Cumulative Effect',
      content: 'When many individuals make small changes in their yards and communities, the collective impact can transform entire watersheds and ecosystems.'
    },
    {
      title: 'Wildlife Corridors',
      content: 'Individual native plant gardens create stepping stones and corridors that allow wildlife to move safely through urban and suburban areas.'
    },
    {
      title: 'Water Quality',
      content: 'Reduced pesticide use and increased native vegetation on individual properties collectively improve water quality in local streams and aquifers.'
    },
    {
      title: 'Community Education',
      content: 'Each person who learns about invasive species becomes an educator who can influence friends, family, and neighbors.'
    },
    {
      title: 'Policy Influence',
      content: 'Community-wide action demonstrates public support for conservation policies and funding for invasive species management programs.'
    }
  ]
};

export const getContentByGradeLevel = (gradeLevel: string) => {
  return educationalMaterials.filter(content => content.gradeLevel === gradeLevel || content.gradeLevel === 'all');
};

export const getContentByType = (type: string) => {
  return educationalMaterials.filter(content => content.type === type);
};