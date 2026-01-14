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
  "confidenceReasoning": "brief explanation for confidence score based on visual traits and context",
  "invasiveEffects": "brief key effects or empty string",
  "nativeAlternatives": [
    {{
      "commonName": "name",
      "scientificName": "scientific name", 
      "characteristics": "very brief description"
    }}
  ],
  "removeInstructions": "concise removal steps or empty string"
}}

Always include native region. Focus on {region} invasive species. Consider the season and date for identification accuracy. Keep descriptions concise and to the point. JSON only."""

def paragraph_analysis(region):
    """Generate paragraph analysis of plant image - now focused specifically on Texas"""
    return f"""Expert in {region} invasive plants. Identify plant from image.

Common {region} invasives: Giant Salvinia, Japanese Honeysuckle, Giant Hogweed, Japanese Climbing Fern, Water Hyacinth, Kudzu, Chinese Privet, Japanese Knotweed, Purple Loosestrife, Johnsongrass, King Ranch Bluestem, Arundo, Chinese Tallow Tree.

Include: species ID, native region, {region} invasiveness, ecosystem effects, native alternatives, removal methods.

Provide a concise, factual paragraph response. Avoid flowery language."""

def json_information(analysis_text):
    """Convert analysis text to structured JSON"""
    return f"""Extract info from plant analysis, format as JSON:

{analysis_text}

Return ONLY valid JSON:
    {{
      "specieIdentified": "species name",
      "nativeRegion": "native region",
      "invasiveOrNot": boolean,
      "invasiveEffects": "concise effects or empty string",
      "nativeAlternatives": [
        {{
          "commonName": "name",
          "scientificName": "scientific name",
          "characteristics": "brief description"
        }}
      ],
      "removeInstructions": "concise removal instructions"
    }}

    JSON only, no explanations."""

def plant_expert_chat(question, context=None):
    """Generate a response as a plant expert"""
    plant_context = ""
    target_region = "Texas" # Default region
    user_role = "Student" # Default role

    if context:
        species = context.get('species', 'this plant')
        # Use provided region if available and not empty, otherwise keep default
        if context.get('region'):
            target_region = context.get('region')
        
        if context.get('userRole'):
            user_role = context.get('userRole')
            
        is_invasive = context.get('invasiveOrNot', False)
        plant_context = f"The user is currently viewing details about {species}, which is classified as {'invasive' if is_invasive else 'not invasive'} in {target_region}."

    role_instruction = ""
    if user_role == "Homeowner":
        role_instruction = "- Frame your answer for a homeowner: focus on property value, garden maintenance, aesthetics, and cost-effective control methods."
    elif user_role == "Land Manager":
        role_instruction = "- Frame your answer for a land manager: focus on large-scale impact, long-term management strategies, economic efficiency, and regulatory compliance."
    else: # Student
        role_instruction = "- Frame your answer for a student: focus on educational value, ecological concepts, biological mechanisms, and scientific accuracy."
        
    return f"""You are an expert botanist and invasive species specialist, with a specific focus on {target_region}. 
{plant_context}
The user is identified as a: {user_role}.

The user is asking: "{question}"

Important Context:
- The user is located in or asking about {target_region}.
- Interpret all questions within the context of {target_region}'s ecosystem, native plants, and invasive species regulations unless explicitly asked about another area.

Provide a concise, direct, and helpful response.
- Answer the specific question immediately.
{role_instruction}
- Use as few words as possible.
- Limit response to 3-4 sentences.
- If asked about harms or threats, you MUST include economic damages (costs, crop loss, infrastructure damage) relevant to {target_region}, ideally supported by specific statistics or dollar amounts if available.
- If asked about native replacements, list exactly 3 specific plants native to {target_region}.
- Avoid generic filler phrases like "That is a great question" or "As an expert botanist".
- Focus only on key actionable information.

Keep it short and to the point.
"""