import { PlantAnalysisResponse } from '../types/plantAnalysis';
import { PlantInfo } from '../types/api';

const SCIENTIFIC_NAME_PATTERN = /^[A-Z][a-z]+ [a-z]+/;

function isLikelyScientificName(name: string): boolean {
  return SCIENTIFIC_NAME_PATTERN.test(name.trim());
}

const SCIENTIFIC_TO_COMMON_MAP: Record<string, string> = {
  'Juniperus ashei': 'Ashe Juniper'
};

const NAME_OVERRIDE_RULES: {
  match: RegExp;
  commonName: string;
  scientificName: string;
}[] = [
  {
    match: /quercus\s+virginiana|virginiana\s+quercus|live\s+oak/i,
    commonName: 'Live Oak',
    scientificName: 'Quercus virginiana'
  }
];

function applyNameOverrides(
  raw: string | null | undefined,
  commonName: string,
  scientificName: string
): { commonName: string; scientificName: string } {
  if (!raw) {
    return { commonName, scientificName };
  }

  for (const rule of NAME_OVERRIDE_RULES) {
    if (rule.match.test(raw)) {
      return {
        commonName: rule.commonName,
        scientificName: rule.scientificName
      };
    }
  }

  return { commonName, scientificName };
}

function buildFriendlyNameFromScientific(scientificName: string): string {
  const trimmed = scientificName.trim();
  const parts = trimmed.split(/\s+/);
  if (parts.length < 2) {
    return trimmed || 'Unknown Plant';
  }

  const genus = parts[0];
  const epithet = parts[1];
  const key = `${genus} ${epithet}`;

  if (SCIENTIFIC_TO_COMMON_MAP[key]) {
    return SCIENTIFIC_TO_COMMON_MAP[key];
  }

  let genusDisplay = genus;
  if (genus === 'Juniperus') {
    genusDisplay = 'Juniper';
  }

  let epithetBase = epithet.toLowerCase();
  const stripped = epithetBase.replace(/ii$|i$/, '');
  if (stripped.length > 0) {
    epithetBase = stripped;
  }

  const epithetDisplay = epithetBase.charAt(0).toUpperCase() + epithetBase.slice(1);

  return `${epithetDisplay} ${genusDisplay}`;
}

export function formatPlantDisplayName(scientificName?: string, commonName?: string): string {
  const trimmedCommon = commonName?.trim();
  const trimmedScientific = scientificName?.trim();

  if (trimmedCommon && (!trimmedScientific || trimmedCommon !== trimmedScientific)) {
    return trimmedCommon;
  }

  if (trimmedScientific && isLikelyScientificName(trimmedScientific)) {
    return buildFriendlyNameFromScientific(trimmedScientific);
  }

  return trimmedCommon || trimmedScientific || 'Unknown Plant';
}

export function normalizeNamesFromSpecieIdentified(
  specieIdentified: string | null | undefined
): { scientificName: string; commonName: string } {
  if (!specieIdentified) {
    return { scientificName: 'Unknown', commonName: 'Unknown Plant' };
  }

  const parts = specieIdentified.split(' (');
  const firstPart = parts[0].trim();
  const secondPart = parts.length > 1 ? parts[1].replace(')', '').trim() : '';

  let commonName = 'Unknown Plant';
  let scientificName = 'Unknown';

  const firstIsScientific = isLikelyScientificName(firstPart);
  const secondIsScientific = secondPart ? isLikelyScientificName(secondPart) : false;

  if (firstIsScientific && secondPart) {
    scientificName = firstPart;
    commonName = secondPart;
  } else if (secondIsScientific && !firstIsScientific) {
    commonName = firstPart;
    scientificName = secondPart;
  } else {
    commonName = firstPart;
    scientificName = secondPart || firstPart.split(' ').slice(-2).join(' ');
  }

  const overridden = applyNameOverrides(specieIdentified, commonName, scientificName);
  commonName = overridden.commonName;
  scientificName = overridden.scientificName;

  const displayCommon = formatPlantDisplayName(scientificName, commonName);

  return { scientificName, commonName: displayCommon };
}

export function convertToPlantInfo(response: PlantAnalysisResponse): PlantInfo {
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
    const normalized = normalizeNamesFromSpecieIdentified(response.specieIdentified);
    scientificName = normalized.scientificName;
    commonName = normalized.commonName;
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
