import { PlantAnalysisResponse } from '../types/plantAnalysis';
import { PlantInfo } from '../types/api';

export function convertToPlantInfo(response: PlantAnalysisResponse): PlantInfo {
  return {
    scientificName: response.specieIdentified?.split(' ').slice(-2).join(' ') || 'Unknown',
    commonName: response.specieIdentified?.split(' (')[0] || 'Unknown Plant',
    isInvasive: response.invasiveOrNot,
    confidenceScore: response.confidenceScore,
    confidenceReasoning: response.confidenceReasoning,
    description: response.specieIdentified
      ? `Identified as ${response.specieIdentified}. Native region: ${response.nativeRegion || 'Unknown'}.`
      : 'Plant identification failed.',
    impact: response.invasiveEffects,
    nativeAlternatives: (response.nativeAlternatives || []).map(alt => ({
      scientificName: alt.scientificName,
      commonName: alt.commonName,
      description: alt.characteristics,
      benefits: (alt.characteristics || '').split('. ').filter(Boolean)
    })),
    controlMethods: response.removeInstructions ? [response.removeInstructions] : [],
    region: response.nativeRegion || 'Unknown'
  };
}