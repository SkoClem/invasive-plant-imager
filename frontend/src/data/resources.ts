export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'program' | 'guide' | 'incentive' | 'nursery' | 'organization';
  url?: string;
  phone?: string;
  address?: string;
  hours?: string;
  eligibility?: string;
  benefits?: string[];
}

export const localResources: Resource[] = [
  {
    id: 'npep',
    title: 'Native Plant Exchange Program (NPEP)',
    description: 'Austin\'s program to encourage replacing invasive plants with native alternatives through plant exchanges and educational workshops. *Note: Program is run by Travis County.*',
    type: 'program',
    url: 'https://www.traviscountytx.gov/tnr/nr/bcp/npep', 
    benefits: [
      'Free native plants for invasive plant removal',
      'Educational workshops and resources',
      'Community plant exchange events',
      'Technical assistance for landscape conversion'
    ]
  },
  {
    id: 'grow-green',
    title: 'Grow Green Guide',
    description: 'Comprehensive guide to sustainable landscaping with native plants, water conservation, and invasive species management. *Note: This is the department\'s homepage, which links to the actual guide PDF/database.*',
    type: 'guide',
    url: 'https://www.austintexas.gov/department/grow-green',
    benefits: [
      'Plant selection guides for Central Texas',
      'Water-wise landscaping techniques',
      'Pest and disease management',
      'Seasonal maintenance calendars'
    ]
  },
  {
    id: 'water-conservation-rebate',
    title: 'Water Conservation Rebate Program',
    description: 'Rebates for replacing water-intensive invasive plants with native, drought-tolerant alternatives.',
    type: 'incentive',
    url: 'https://www.austintexas.gov/department/rebates-tools-programs',
    eligibility: 'Austin Water customers',
    benefits: [
      'Rebates for landscape conversion',
      'Free irrigation system evaluations',
      'Rainwater harvesting incentives',
      'Free native plant coupons'
    ]
  },
  {
    id: 'balcones-canyonlands',
    title: 'Balcones Canyonlands Preserve',
    description: 'Information about conservation efforts and invasive species management in our local preserve. *Note: Managed by Travis County/City of Austin partnership.*',
    type: 'organization',
    url: 'https://www.traviscountytx.gov/tnr/nr/bcp',
    benefits: [
      'Volunteer opportunities for invasive species removal',
      'Educational programs and guided hikes',
      'Conservation research updates',
      'Habitat restoration projects'
    ]
  },
  {
    id: 'lady-bird-wildflower-center',
    title: 'Lady Bird Johnson Wildflower Center',
    description: 'Premier native plant research and education center with extensive gardens and educational programs.',
    type: 'organization',
    // Correction: This URL is correct.
    url: 'https://www.wildflower.org',
    address: '4801 La Crosse Ave, Austin, TX 78739',
    phone: '(512) 232-0100',
    benefits: [
      'Native plant sales and information',
      'Educational programs and workshops',
      'Extensive demonstration gardens',
      'Online plant database'
    ]
  },
  {
    id: 'natural-gardener',
    title: 'The Natural Gardener',
    description: 'Local nursery specializing in organic gardening supplies and native plants.',
    type: 'nursery',
    address: '8648 Old Bee Caves Rd, Austin, TX 78735',
    phone: '(512) 288-6113',
    hours: 'Mon-Sat 8:30am-6pm, Sun 10am-5pm',
    // URL omitted as it's a physical nursery, but can be added if you have it.
    benefits: [
      'Extensive selection of native plants',
      'Organic gardening supplies',
      'Knowledgeable staff',
      'Workshops and classes'
    ]
  },
  {
    id: 'barton-springs-nursery',
    title: 'Barton Springs Nursery',
    description: 'Specializes in native and adapted plants for Central Texas landscapes.',
    type: 'nursery',
    address: '3601 Bee Caves Rd, Austin, TX 78746',
    phone: '(512) 328-6655',
    hours: 'Mon-Sat 9am-6pm, Sun 10am-5pm',
    // URL omitted as it's a physical nursery, but can be added if you have it.
    benefits: [
      'Focus on native and adapted plants',
      'Expert advice for Central Texas',
      'Sustainable gardening practices',
      'Landscape design services'
    ]
  },
  {
    id: 'texas-invasive-species-institute',
    title: 'Texas Invasive Species Institute',
    description: 'Research and education organization focused on invasive species in Texas.',
    type: 'organization',
    url: 'https://www.texasinvasives.org/',
    benefits: [
      'Comprehensive invasive species database',
      'Research publications',
      'Educational resources',
      'Reporting tools for invasive species'
    ]
  }
];

export const getResourcesByType = (type: string) => {
  return localResources.filter(resource => resource.type === type);
};

export const getResourceById = (id: string) => {
  return localResources.find(resource => resource.id === id);
};