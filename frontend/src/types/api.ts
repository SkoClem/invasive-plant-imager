export interface PlantIdentificationResponse {
  success: boolean;
  plant?: PlantInfo;
  error?: string;
}

export interface PlantInfo {
  scientificName: string;
  commonName: string;
  isInvasive: boolean;
  confidenceScore?: number;
  confidenceReasoning?: string;
  description: string;
  impact: string;
  nativeAlternatives: NativeAlternative[];
  controlMethods: string[];
  region: string; // The region where the scan was performed (User's region)
  nativeRegion?: string; // The native region of the plant
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

export interface MapMarker {
  id: string;
  user_id: string;
  user_name: string;
  latitude: number;
  longitude: number;
  plant_name: string;
  is_invasive: boolean;
  timestamp: string;
  scan_id?: string;
}

export interface CreateMarkerRequest {
  latitude: number;
  longitude: number;
  plant_name: string;
  is_invasive: boolean;
  scan_id?: string;
}
