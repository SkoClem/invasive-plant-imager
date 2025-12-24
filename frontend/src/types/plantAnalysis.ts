export interface NativeAlternative {
  commonName: string;
  scientificName: string;
  characteristics: string;
}

export interface PlantAnalysisResponse {
  specieIdentified: string | null;
  nativeRegion: string | null;
  invasiveOrNot: boolean;
  confidenceScore?: number;
  confidenceReasoning?: string;
  invasiveEffects: string;
  nativeAlternatives: NativeAlternative[];
  removeInstructions: string;
  coins?: number;
  coinAwarded?: boolean;
  region?: string; // The region where the scan was performed
}

export interface PlantAnalysisRequest {
  image: File;
  region: string;
}