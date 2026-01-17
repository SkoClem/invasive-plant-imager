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

  let commonName =
    (response.commonName ?? undefined) && typeof response.commonName === 'string'
      ? response.commonName
      : 'Unknown Plant';
  let scientificName =
    (response.scientificName ?? undefined) && typeof response.scientificName === 'string'
      ? response.scientificName
      : 'Unknown';

  if ((!response.commonName || !response.scientificName) && response.specieIdentified) {
    const normalized = normalizeNamesFromSpecieIdentified(response.specieIdentified);
    if (!response.scientificName) {
      scientificName = normalized.scientificName;
    }
    if (!response.commonName) {
      commonName = normalized.commonName;
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

export type InvasiveStatus = 'invasive' | 'native' | 'native-invasive';

const NATIVE_INVASIVE_SPECIES_SCIENTIFIC = ['juniperus ashei'];
const NATIVE_INVASIVE_SPECIES_COMMON = ['ashe juniper'];

export function getInvasiveStatus(plant: PlantInfo): InvasiveStatus {
  const scientificName = (plant.scientificName || '').toLowerCase();
  const commonName = (plant.commonName || '').toLowerCase();

  const isExplicitNativeInvasive =
    NATIVE_INVASIVE_SPECIES_SCIENTIFIC.some(name => scientificName.includes(name)) ||
    NATIVE_INVASIVE_SPECIES_COMMON.some(name => commonName.includes(name));

  if (isExplicitNativeInvasive) {
    return 'native-invasive';
  }

  if (!plant.isInvasive) {
    return 'native';
  }

  const scanRegion = (plant.region || '').toLowerCase();
  const nativeRegion = (plant.nativeRegion || '').toLowerCase();

  const isNativeToScanRegion =
    scanRegion &&
    nativeRegion &&
    (nativeRegion.includes(scanRegion) || scanRegion.includes(nativeRegion));

  if (isNativeToScanRegion) {
    return 'native-invasive';
  }

  return 'invasive';
}
