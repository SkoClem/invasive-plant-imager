import { PlantAnalysisResponse } from '../types/plantAnalysis';
import { PlantInfo } from '../types/api';

export function convertToPlantInfo(response: PlantAnalysisResponse): PlantInfo {
  // Handle non-plant case explicitly to avoid parsing issues
  if (response.specieIdentified === "Not a Plant") {
    return {
      scientificName: "Non-Plant Object",
      commonName: "Not a Plant",
      isInvasive: false,
      confidenceScore: response.confidenceScore || 0,
      confidenceReasoning: response.confidenceReasoning || "The AI filter determined this image does not contain a plant.",
      description: "Our system analyzed the image and determined it does not contain a plant. No further analysis was performed.",
      impact: response.invasiveEffects || "N/A",
      nativeAlternatives: [],
      controlMethods: [response.removeInstructions || "Please upload a valid plant image."],
      region: response.region || 'Unknown',
      nativeRegion: "N/A"
    };
  }

  let commonName = 'Unknown Plant';
  let scientificName = 'Unknown';
  
  if (response.specieIdentified) {
    const parts = response.specieIdentified.split(' (');
    const firstPart = parts[0].trim();
    const secondPart = parts.length > 1 ? parts[1].replace(')', '').trim() : '';

    // Heuristic: Scientific names are typically 2+ words, first capitalized, second lowercase (e.g., "Taraxacum officinale")
    // We check if the first part looks like a scientific name
    const isFirstPartScientific = /^[A-Z][a-z]+ [a-z]+/.test(firstPart);

    if (isFirstPartScientific && secondPart) {
      // Format: Scientific (Common) -> Swap
      scientificName = firstPart;
      commonName = secondPart;
    } else if (secondPart && /^[A-Z][a-z]+ [a-z]+/.test(secondPart)) {
      // Format: Common (Scientific) -> Keep as is
      commonName = firstPart;
      scientificName = secondPart;
    } else {
      // Ambiguous or single name
      commonName = firstPart;
      scientificName = secondPart || (firstPart.split(' ').slice(-2).join(' '));
    }
  }

  return {
    scientificName,
    commonName,
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
    region: response.region || 'Unknown',
    nativeRegion: response.nativeRegion || 'Unknown'
  };
}