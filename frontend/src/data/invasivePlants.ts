export interface InvasivePlant {
  id: string;
  commonName: string;
  scientificName: string;
  description: string;
  identificationTips: string[];
  impact: string;
  controlMethods: string[];
  nativeAlternatives: NativeAlternative[];
  images: string[];
  region: string;
  category: 'aquatic' | 'terrestrial' | 'woody' | 'herbaceous';
}

export interface NativeAlternative {
  commonName: string;
  scientificName: string;
  description: string;
  benefits: string[];
}

export const austinInvasivePlants: InvasivePlant[] = [
  {
    id: 'giant-reed',
    commonName: 'Giant Reed',
    scientificName: 'Arundo donax',
    description: 'A tall, bamboo-like perennial grass that forms dense stands along waterways, displacing native vegetation and increasing fire risk.',
    identificationTips: [
      'Grows 6-20 feet tall',
      'Hollow stems with bamboo-like appearance',
      'Gray-green leaves up to 2 feet long',
      'Large, feathery flower plumes',
      'Forms dense colonies along streams'
    ],
    impact: 'Consumes large amounts of water, increases fire risk, displaces native riparian vegetation, and alters stream ecosystems.',
    controlMethods: [
      'Mechanical removal for small infestations',
      'Herbicide application for larger stands',
      'Repeated cutting to exhaust root reserves',
      'Professional removal recommended for large areas'
    ],
    nativeAlternatives: [
      {
        commonName: 'Switchgrass',
        scientificName: 'Panicum virgatum',
        description: 'Native perennial grass that provides excellent wildlife habitat and erosion control.',
        benefits: ['Drought tolerant', 'Wildlife habitat', 'Erosion control']
      },
      {
        commonName: 'Eastern Gamagrass',
        scientificName: 'Tripsacum dactyloides',
        description: 'Tall native grass that thrives in moist areas and provides excellent cover for wildlife.',
        benefits: ['Moisture tolerant', 'Wildlife cover', 'Erosion control']
      }
    ],
    images: [],
    region: 'Austin/Travis County',
    category: 'aquatic'
  },
  {
    id: 'japanese-honeysuckle',
    commonName: 'Japanese Honeysuckle',
    scientificName: 'Lonicera japonica',
    description: 'A vigorous climbing vine that smothers native vegetation and forms dense ground cover, preventing native plant regeneration.',
    identificationTips: [
      'Twining woody vine',
      'Fragrant white to yellow flowers',
      'Black berries in fall',
      'Evergreen in mild climates',
      'Forms dense mats on ground'
    ],
    impact: 'Smothers native vegetation, prevents tree regeneration, and reduces biodiversity in forest understories.',
    controlMethods: [
      'Hand-pulling for small vines',
      'Cut and treat with herbicide',
      'Repeated mowing for ground cover',
      'Monitor for regrowth'
    ],
    nativeAlternatives: [
      {
        commonName: 'Coral Honeysuckle',
        scientificName: 'Lonicera sempervirens',
        description: 'Native vine with beautiful red flowers that attract hummingbirds and butterflies.',
        benefits: ['Hummingbird attractor', 'Native wildlife support', 'Non-invasive']
      },
      {
        commonName: 'Cross Vine',
        scientificName: 'Bignonia capreolata',
        description: 'Native climbing vine with spectacular orange-red flowers that thrives in similar conditions.',
        benefits: ['Showy flowers', 'Wildlife habitat', 'Drought tolerant']
      }
    ],
    images: [],
    region: 'Austin/Travis County',
    category: 'woody'
  },
  {
    id: 'chinese-tallow',
    commonName: 'Chinese Tallow',
    scientificName: 'Triadica sebifera',
    description: 'A fast-growing tree that forms dense stands, outcompeting native vegetation and altering soil chemistry.',
    identificationTips: [
      'Heart-shaped leaves',
      'Yellow fall color',
      'White waxy seeds',
      'Fast growth rate',
      'Forms pure stands'
    ],
    impact: 'Forms monocultures that exclude native plants, alters soil chemistry, and reduces wildlife habitat quality.',
    controlMethods: [
      'Cut stump herbicide treatment',
      'Basal bark herbicide application',
      'Mechanical removal of saplings',
      'Prevent seed production'
    ],
    nativeAlternatives: [
      {
        commonName: 'Texas Redbud',
        scientificName: 'Cercis canadensis var. texensis',
        description: 'Small native tree with beautiful pink spring flowers and heart-shaped leaves.',
        benefits: ['Spring flowers', 'Drought tolerant', 'Wildlife value']
      },
      {
        commonName: 'Mexican Plum',
        scientificName: 'Prunus mexicana',
        description: 'Small native tree with fragrant white flowers and edible fruit for wildlife.',
        benefits: ['Fragrant flowers', 'Wildlife food', 'Adaptable']
      }
    ],
    images: [],
    region: 'Austin/Travis County',
    category: 'woody'
  },
  {
    id: 'heavenly-bamboo',
    commonName: 'Heavenly Bamboo',
    scientificName: 'Nandina domestica',
    description: 'An evergreen shrub that spreads aggressively and produces toxic berries that can harm wildlife.',
    identificationTips: [
      'Bamboo-like stems',
      'Compound leaves',
      'Red berries in winter',
      'Evergreen foliage',
      'Forms dense thickets'
    ],
    impact: 'Forms dense stands that exclude native plants, and its berries are toxic to birds and other wildlife.',
    controlMethods: [
      'Dig out entire root system',
      'Cut and treat with herbicide',
      'Remove berries to prevent spread',
      'Monitor for seedlings'
    ],
    nativeAlternatives: [
      {
        commonName: 'Possumhaw Holly',
        scientificName: 'Ilex decidua',
        description: 'Native deciduous holly with beautiful red berries that provide winter food for birds.',
        benefits: ['Winter berries', 'Bird habitat', 'Drought tolerant']
      },
      {
        commonName: 'American Beautyberry',
        scientificName: 'Callicarpa americana',
        description: 'Native shrub with stunning purple berries that attract birds and butterflies.',
        benefits: ['Showy berries', 'Wildlife food', 'Easy to grow']
      }
    ],
    images: [],
    region: 'Austin/Travis County',
    category: 'woody'
  },
  {
    id: 'ligustrum',
    commonName: 'Ligustrum (Privet)',
    scientificName: 'Ligustrum spp.',
    description: 'Fast-growing shrubs and small trees that form dense thickets, shading out native understory plants.',
    identificationTips: [
      'Opposite, glossy leaves',
      'Fragrant white flowers',
      'Dark purple berries',
      'Forms dense stands',
      'Evergreen to semi-evergreen'
    ],
    impact: 'Forms impenetrable thickets that exclude native vegetation and reduce habitat for ground-nesting birds and other wildlife.',
    controlMethods: [
      'Cut stump herbicide treatment',
      'Basal bark herbicide application',
      'Mechanical removal of small plants',
      'Prevent berry production'
    ],
    nativeAlternatives: [
      {
        commonName: 'Yaupon Holly',
        scientificName: 'Ilex vomitoria',
        description: 'Native evergreen shrub with red berries that provide excellent wildlife habitat.',
        benefits: ['Evergreen', 'Wildlife food', 'Drought tolerant']
      },
      {
        commonName: 'Wax Myrtle',
        scientificName: 'Morella cerifera',
        description: 'Native evergreen shrub with aromatic leaves and berries that attract birds.',
        benefits: ['Aromatic foliage', 'Bird habitat', 'Adaptable']
      }
    ],
    images: [],
    region: 'Austin/Travis County',
    category: 'woody'
  }
];

export const getPlantsByCategory = (category: string) => {
  return austinInvasivePlants.filter(plant => plant.category === category);
};

export const getPlantById = (id: string) => {
  return austinInvasivePlants.find(plant => plant.id === id);
};