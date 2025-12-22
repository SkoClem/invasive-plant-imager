def optimized_analysis(region, date=None, season=None):
    """Single-step optimized analysis that outputs JSON directly"""
    
    context = f"Region: {region}"
    if date:
        context += f", Date: {date}"
    if season:
        context += f", Season: {season}"

    return f"""Expert botanist for {region} invasive species. Analyze plant image with context: {context}. Return ONLY valid JSON:

{{
  "specieIdentified": "species name or null",
  "nativeRegion": "native region/country", 
  "invasiveOrNot": boolean,
  "confidenceScore": 0-100,
  "confidenceReasoning": "explanation for confidence score based on visual traits and context (season, region)",
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

Always include native region. Focus on {region} invasive species. Consider the season and date for identification accuracy. Be concise, accurate. JSON only."""

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

def plant_expert_chat(question, context=None):
    """Generate a response as a plant expert"""
    plant_context = ""
    if context:
        species = context.get('species', 'this plant')
        region = context.get('region', 'your area')
        is_invasive = context.get('invasiveOrNot', False)
        plant_context = f"The user is asking about {species}, which is {'invasive' if is_invasive else 'not invasive'} in {region}."
        
    return f"""You are an expert botanist and invasive species specialist. 
{plant_context}

The user is asking: "{question}"

Provide a helpful, educational, and accurate response. 
If the question is about threat level, explain the ecological impact.
If about harms, detail specific negative effects on local flora/fauna.
If about lookalikes, mention native plants that look similar.
If about action, recommend specific removal or management techniques.
If asked about native replacements, list 3-5 specific native plants that would thrive in the same conditions and support the local ecosystem.

Keep the answer concise (under 3 paragraphs) and easy to understand for a general audience.
"""