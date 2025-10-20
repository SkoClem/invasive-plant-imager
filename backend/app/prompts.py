def optimized_analysis(region):
    """Single-step optimized analysis that outputs JSON directly"""
    return f"""Expert botanist for {region} invasive species. Analyze plant image, return ONLY valid JSON:

{{
  "specieIdentified": "species name or null",
  "nativeRegion": "native region/country", 
  "invasiveOrNot": boolean,
  "invasiveEffects": "effects or empty string",
  "nativeAlternatives": [
    {{
      "commonName": "name",
      "scientificName": "scientific name", 
      "characteristics": "brief description"
    }}
  ],
  "removeInstructions": "removal instructions or empty string"
}}

Always include native region. Focus on {region} invasive species. Be concise, accurate. JSON only."""

def paragraph_analysis(region):
    """Generate paragraph analysis of plant image - now focused specifically on Texas"""
    return f"""Expert in {region} invasive plants. Identify plant from image.

Common {region} invasives: Giant Salvinia, Japanese Honeysuckle, Giant Hogweed, Japanese Climbing Fern, Water Hyacinth, Kudzu, Chinese Privet, Japanese Knotweed, Purple Loosestrife, Johnsongrass, King Ranch Bluestem, Arundo, Chinese Tallow Tree.

Include: species ID, native region, {region} invasiveness, ecosystem effects, native alternatives, removal methods.

Single detailed paragraph response."""

def json_information(analysis_text):
    """Convert analysis text to structured JSON"""
    return f"""Extract info from plant analysis, format as JSON:

{analysis_text}

Return ONLY valid JSON:
{{
  "specieIdentified": "species name",
  "nativeRegion": "native region",
  "invasiveOrNot": boolean,
  "invasiveEffects": "effects or empty string",
  "nativeAlternatives": [
    {{
      "commonName": "name",
      "scientificName": "scientific name",
      "characteristics": "brief description"
    }}
  ],
  "removeInstructions": "removal instructions"
}}

JSON only, no explanations."""