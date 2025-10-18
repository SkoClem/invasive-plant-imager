def paragraph_analysis(region):
    """Generate paragraph analysis of plant image"""
    # Focus specifically on Texas invasive species when region is Texas
    if "texas" in region.lower():
        return f"""

**IDENTITY**
You are an expert at identifying invasive plant species, with specialized knowledge of Texas invasive flora.

**TASK**
The user has provided an image of a plant from Texas.
Your task is to identify if the plant is invasive to Texas specifically and provide a detailed paragraph analysis.

**TEXAS-SPECIFIC FOCUS:**
Focus on invasive species commonly found in Texas, including but not limited to:
- Giant Salvinia (Salvinia molesta)
- Japanese Honeysuckle (Lonicera japonica)
- Giant Hogweed (Heracleum mantegazzianum)
- Japanese Climbing Fern (Lygodium japonicum)
- Water Hyacinth (Eichhornia crassipes)
- Kudzu (Pueraria montana)
- Chinese Privet (Ligustrum sinense)
- Japanese Knotweed (Fallopia japonica)
- Purple Loosestrife (Lythrum salicaria)
- Alarmingly invasive grasses and aquatic plants

**REQUIRED INFORMATION TO INCLUDE:**
- What species of plant is shown in the image?
- What specific regions of the world is the plant native to?
- Is the plant invasive to Texas specifically?
- If the plant is invasive to Texas, what harmful effects does it have on Texas ecosystems, agriculture, or native species?
- What are some native Texas alternative plants that are similar in appearance, size, growth habitat?
- How can the user safely remove the plant if needed, considering Texas climate and regulations?

**RESPONSE FORMAT**
Provide your response as a single, well-structured paragraph that includes all the required information. Be specific and detailed about Texas ecosystems and native flora.
"""
    else:
        return f"""

**IDENTITY**
You are an expert at identifying invasive plant species

**TASK**
The user has provided an image of a plant from {region}.
Your task is to identify if the plant is invasive or not and provide a detailed paragraph analysis.

**REQUIRED INFORMATION TO INCLUDE:**
- What species of plant is shown in the image?
- What specific regions of the world is the plant native to?
- Is the plant invasive to {region}?
- If the plant is invasive to {region}, what harmful effects does it have?
- What are some native alternative plants that are similar in appearance, size, growth habitat?
- How can the user safely remove the plant if needed?

**RESPONSE FORMAT**
Provide your response as a single, well-structured paragraph that includes all the required information. Be specific and detailed.
"""

def json_information(analysis_text):
    """Convert analysis text to structured JSON"""
    return f"""

**TASK**
You have been given a plant analysis paragraph. Your task is to extract the information and format it as a JSON object.

**ANALYSIS TEXT:**
{analysis_text}

**JSON FORMAT REQUIREMENTS**
You must return ONLY a valid JSON object with the following structure. No additional text, no explanations, just the JSON.

{{
  "specieIdentified": "species name",
  "nativeRegion": "native region description",
  "invasiveOrNot": boolean,
  "invasiveEffects": "description of effects if invasive, otherwise empty string",
  "nativeAlternatives": [
    {{
      "commonName": "common name",
      "scientificName": "scientific name",
      "characteristics": "brief description"
    }}
  ],
  "removeInstructions": "removal instructions"
}}

**IMPORTANT:**
- Return ONLY the JSON object, nothing else
- Ensure the JSON is valid and properly formatted
- Use true/false for boolean values
- Use empty strings "" for non-applicable fields
- For nativeAlternatives, include at least one alternative even if the plant is not invasive
"""