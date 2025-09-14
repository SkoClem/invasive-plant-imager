export interface PlantIdentificationResponse {
  success: boolean;
  plant?: PlantInfo;
  error?: string;
}

export interface PlantInfo {
  scientificName: string;
  commonName: string;
  isInvasive: boolean;
  confidence: number;
  description: string;
  impact: string;
  nativeAlternatives: NativeAlternative[];
  controlMethods: string[];
  region: string;
  imageUrl?: string;
}

export interface NativeAlternative {
  scientificName: string;
  commonName: string;
  description: string;
  benefits: string[];
  imageUrl?: string;
}

export interface AnalysisRequest {
  image: File;
  region: string;
}