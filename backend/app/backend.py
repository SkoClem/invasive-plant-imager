from app.llm_framework import LLM, Gemini, ImageLLM
import base64
import json
import re
llm = LLM()
from app.prompts import paragraph_analysis, json_information, optimized_analysis, plant_expert_chat
from dotenv import load_dotenv
#TODO: get environment variables without dotenv package
load_dotenv(override=True)
print(llm)
from typing import Optional

class Generate:
    def __init__(self):
        self.LLM = LLM()
        self.key,self.name,self.url=self.LLM.initialize_llm(KEY='LLM_KEY',
                                                            NAME='LLM_NAME',
                                                            URL='LLM_URL')
        
    def __call__(self,
                 prompt:str,
                 system_prompt:Optional[str]=None,
                 max_tokens:Optional[int]=None,
                 mode:str="default")->str:
        # Auto-detect Gemini mode if URL suggests it
        if "generativelanguage.googleapis.com" in self.url:
            mode = "gemini"
            
        if mode == "gemini":
            self.LLM = Gemini()
        contents = self.LLM.llm_contents(key=self.key,
                                         name=self.name,
                                         prompt=prompt,
                                         system_prompt=system_prompt,
                                         max_tokens=max_tokens)
        return self.LLM.get_output(url=self.url, llm_contents=contents)
    
class Imager:
    def __init__(self, region: str = "North America"):
        self.llm_info = LLM().initialize_llm(KEY='LLM_KEY',NAME='LLM_NAME',URL='LLM_URL')
        self.key, self.name, self.url = self.llm_info
        self.region = region
        self.image_llm = ImageLLM()
        print(self.name, self.url)

    def set_region(self, region: str):
        """Update the region for analysis"""
        self.region = region

    def chat_response(self, message: str, context: dict = None) -> str:
        """Get chat response from expert botanist persona"""
        prompt = plant_expert_chat(message, context)
        
        # Use regular LLM for text chat, not ImageLLM
        generator = Generate()
        response = generator(
            prompt=prompt,
            max_tokens=4000  # Increased to prevent mid-sentence cutoffs; brevity enforced via prompt
        )
        return response

    def analyze_plant_image(self, image_path_or_data: str, date: str = None, season: str = None)->dict:
        """Analyze plant image for invasive species using optimized single-step approach"""
        return self._get_optimized_analysis(image_path_or_data, date, season)

    def analyze_plant_image_legacy(self, image_path_or_data: str)->dict:
        """Legacy two-step analysis (kept for fallback)"""
        # Step 1: Get paragraph analysis
        paragraph_response = self._get_paragraph_analysis(image_path_or_data)

        # Step 2: Convert to JSON
        json_response = self._convert_to_json(paragraph_response)

        return json_response

    def _get_optimized_analysis(self, image_path_or_data: str, date: str = None, season: str = None)->dict:
        """Get optimized single-step analysis that returns JSON directly"""
        # Check if input is base64 data or file path
        if image_path_or_data.startswith('data:image') or len(image_path_or_data) > 100:  # Likely base64
            image_data = image_path_or_data
        else:  # Likely file path
            image_data = self._image_to_base64(image_path_or_data)

        prompt = optimized_analysis(self.region, date, season)

        contents = self.image_llm.llm_contents(
            key=self.key,
            name=self.name,
            prompt=prompt,
            image_data=image_data,
            max_tokens=8000  # Increased significantly to prevent truncation issues
        )

        json_response = self.image_llm.get_output(url=self.url, llm_contents=contents)
        return self.parse_llm_response(json_response)

    def _get_paragraph_analysis(self, image_path_or_data: str)->str:
        """Get paragraph analysis from image"""
        prompt = paragraph_analysis(self.region)

        contents = self.image_llm.llm_contents(
            key=self.key,
            name=self.name,
            prompt=prompt,
            image_data=image_path_or_data,
            max_tokens=8000
        )

        output = self.image_llm.get_output(url=self.url, llm_contents=contents)
        return output

    def _convert_to_json(self, paragraph_response: str)->dict:
        """Convert paragraph response to JSON format using optimized prompts"""
        prompt = json_information(paragraph_response)
        generator = Generate()
        json_response = generator(
            prompt=prompt,
            system_prompt=None,
            max_tokens=8000,
            mode="default"
        )
        return self.parse_llm_response(json_response)

    def parse_llm_response(self, response_text: str)->dict:
        """Parse LLM response and extract JSON content"""
        try:
            cleaned_response = response_text.strip()
            cleaned_response = re.sub(r"```json|```", "", cleaned_response)
            cleaned_response = cleaned_response.replace('\n', ' ').replace('\r', ' ')
            
            # If response looks like JSON, parse it immediately
            if cleaned_response.startswith('{') and cleaned_response.endswith('}'):
                return json.loads(cleaned_response)

            # Try to find JSON anywhere in the response
            json_match = re.search(r"\{.*\}", cleaned_response)
            if json_match:
                possible_json = json_match.group(0)
                # Attempt to parse it, and handle any trailing commas or minor issues
                possible_json = re.sub(r",\s*\}", "}", possible_json)
                return json.loads(possible_json)

            # If no JSON found, return a structured error
            return {
                "specieIdentified": "Parsing error",
                "nativeRegion": "Unknown",
                "invasiveOrNot": False,
                "invasiveEffects": f"Unable to parse the analysis response. Raw error: {cleaned_response[:200]}...",
                "nativeAlternatives": [],
                "removeInstructions": "Unable to provide removal instructions due to parsing error."
            }

        except json.JSONDecodeError as e:
            print(f"DEBUG - JSON parsing failed: {e}")
            print(f"DEBUG - Attempted to parse: {response_text[:200]}...")
            return {
                "specieIdentified": "Parsing error",
                "nativeRegion": "Unknown",
                "invasiveOrNot": False,
                "invasiveEffects": "Unable to parse the analysis response. Please try again.",
                "nativeAlternatives": [],
                "removeInstructions": "Unable to provide removal instructions due to parsing error."
            }
        except Exception as e:
            print(f"DEBUG - Exception in parse_llm_response: {e}")
            return {
                "specieIdentified": "Error",
                "nativeRegion": "Unknown", 
                "invasiveOrNot": False,
                "invasiveEffects": f"An error occurred during analysis: {str(e)}",
                "nativeAlternatives": [],
                "removeInstructions": "Unable to provide removal instructions due to error."
            }

    def _image_to_base64(self, image_path: str)->str:
        """Convert image file to base64 string"""
        try:
            with open(image_path, "rb") as image_file:
                encoded_string = base64.b64encode(image_file.read()).decode("utf-8")
                return encoded_string
        except Exception as e:
            return f"Error reading image file: {e}"
