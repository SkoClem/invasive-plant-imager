export interface NativeAlternative {
  commonName: string;
  scientificName: string;
  characteristics: string;
}

export interface PlantAnalysisResponse {
  specieIdentified: string | null;
  nativeRegion: string | null;
  invasiveOrNot: boolean;
  invasiveEffects: string;
  nativeAlternatives: NativeAlternative[];
  removeInstructions: string;
}

export interface PlantAnalysisRequest {
  image: File;
  region: string;
}