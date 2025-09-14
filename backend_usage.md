# Backend API Usage Guide

This guide explains how to use the invasive plant imager backend API from a TypeScript React frontend.

## API Endpoint

### Analyze Plant Image

**URL:** `http://your-server-url/api/analyze-plant`
**Method:** `POST`
**Content-Type:** `multipart/form-data`

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `image` | File | Yes | The plant image file to analyze (PNG, JPG, etc.) |
| `region` | String | No | Geographic region for analysis (default: "North America") |

### Supported Regions

- "North America"
- "Europe"
- "Asia"
- "Australia"
- Or any other geographic region

## TypeScript Implementation

### 1. Define TypeScript Interfaces

```typescript
// src/types/plantAnalysis.ts

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
  region?: string;
}
```

### 2. Create API Service

```typescript
// src/services/plantAnalysisService.ts

import { PlantAnalysisResponse, PlantAnalysisRequest } from '../types/plantAnalysis';

const API_BASE_URL = 'http://your-server-url'; // Replace with your actual server URL

class PlantAnalysisService {
  async analyzePlant(request: PlantAnalysisRequest): Promise<PlantAnalysisResponse> {
    const formData = new FormData();

    // Append the image file
    formData.append('image', request.image);

    // Append the region (with default value)
    formData.append('region', request.region || 'North America');

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze-plant`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header when using FormData - browser sets it automatically with boundary
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PlantAnalysisResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error analyzing plant:', error);
      throw error;
    }
  }
}

export const plantAnalysisService = new PlantAnalysisService();
```

### 3. React Component Example

```typescript
// src/components/PlantAnalyzer.tsx

import React, { useState } from 'react';
import { plantAnalysisService } from '../services/plantAnalysisService';
import { PlantAnalysisResponse } from '../types/plantAnalysis';

const PlantAnalyzer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [region, setRegion] = useState<string>('North America');
  const [analysis, setAnalysis] = useState<PlantAnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setAnalysis(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select an image file');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await plantAnalysisService.analyzePlant({
        image: selectedFile,
        region
      });
      setAnalysis(result);
    } catch (err) {
      setError('Failed to analyze plant. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="plant-analyzer">
      <h2>Plant Analysis</h2>

      <div className="upload-section">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={loading}
        />

        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          disabled={loading}
        >
          <option value="North America">North America</option>
          <option value="Europe">Europe</option>
          <option value="Asia">Asia</option>
          <option value="Australia">Australia</option>
        </select>

        <button
          onClick={handleAnalyze}
          disabled={!selectedFile || loading}
        >
          {loading ? 'Analyzing...' : 'Analyze Plant'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {analysis && (
        <div className="analysis-results">
          <h3>Analysis Results</h3>

          {analysis.specieIdentified && (
            <div className="result-item">
              <strong>Plant Identified:</strong> {analysis.specieIdentified}
            </div>
          )}

          {analysis.nativeRegion && (
            <div className="result-item">
              <strong>Native Region:</strong> {analysis.nativeRegion}
            </div>
          )}

          <div className="result-item">
            <strong>Invasive Status:</strong>
            <span className={analysis.invasiveOrNot ? 'invasive' : 'non-invasive'}>
              {analysis.invasiveOrNot ? 'Invasive' : 'Non-Invasive'}
            </span>
          </div>

          {analysis.invasiveEffects && (
            <div className="result-item">
              <strong>Effects:</strong> {analysis.invasiveEffects}
            </div>
          )}

          {analysis.nativeAlternatives.length > 0 && (
            <div className="result-item">
              <strong>Native Alternatives:</strong>
              <ul>
                {analysis.nativeAlternatives.map((alt, index) => (
                  <li key={index}>
                    <strong>{alt.commonName}</strong> ({alt.scientificName})
                    <br />
                    <small>{alt.characteristics}</small>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.removeInstructions && (
            <div className="result-item">
              <strong>Removal Instructions:</strong> {analysis.removeInstructions}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlantAnalyzer;
```

### 4. CSS Styling (Optional)

```css
/* src/components/PlantAnalyzer.css */

.plant-analyzer {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.upload-section input,
.upload-section select,
.upload-section button {
  padding: 10px;
  font-size: 16px;
}

.upload-section button {
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

.upload-section button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  background-color: #f8d7da;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.analysis-results {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.result-item {
  margin-bottom: 15px;
}

.result-item strong {
  display: inline-block;
  min-width: 150px;
}

.invasive {
  color: #dc3545;
  font-weight: bold;
}

.non-invasive {
  color: #28a745;
  font-weight: bold;
}

.result-item ul {
  margin-top: 5px;
  padding-left: 20px;
}

.result-item li {
  margin-bottom: 8px;
}
```

## Response Format

The API returns a JSON object with the following structure:

```json
{
  "specieIdentified": "Chinaberry Tree (Melia azedarach)",
  "nativeRegion": "Southeast Asia and northern Australia",
  "invasiveOrNot": true,
  "invasiveEffects": "Considered invasive in many parts of North America...",
  "nativeAlternatives": [
    {
      "commonName": "Eastern Redbud",
      "scientificName": "Cercis canadensis",
      "characteristics": "offers a comparable appearance..."
    }
  ],
  "removeInstructions": "For small seedlings, hand-pull ensuring..."
}
```

## Error Handling

The API may return errors in the following cases:

- **400 Bad Request**: Missing image file or invalid file type
- **500 Internal Server Error**: Server processing error

Always wrap your API calls in try-catch blocks and handle errors gracefully in your UI.

## File Upload Limitations

- Supported formats: PNG, JPG, JPEG, GIF
- Recommended file size: < 10MB
- The backend will validate that uploaded files are images

## Testing the API

You can test the API using curl:

```bash
curl -X POST \
  http://your-server-url/api/analyze-plant \
  -F "image=@/path/to/your/plant-image.jpg" \
  -F "region=North America"
```

Replace `http://your-server-url` with your actual backend server URL.