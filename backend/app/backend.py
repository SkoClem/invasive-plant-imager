from app.llm_framework import LLM, Gemini, ImageLLM
import base64
import json
import re
llm = LLM()
from app.prompts import paragraph_analysis, json_information
from dotenv import load_dotenv
#TODO: get environment variables without dotenv package
load_dotenv(override=True)
print(llm)

class Generate:
    def __init__(self):
        self.LLM = LLM()
        self.key,self.name,self.url=self.LLM.initialize_llm(KEY='LLM_KEY',
                                                            NAME='LLM_NAME',
                                                            URL='LLM_URL')
        
    def __call__(self,
                 prompt:str,
                 system_prompt:str|None=None,
                 max_tokens:int|None=None,
                 mode:str="default")->str:
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

    def analyze_plant_image(self, image_path_or_data: str)->dict:
        """Analyze plant image for invasive species using two-step approach"""
        # Step 1: Get paragraph analysis
        paragraph_response = self._get_paragraph_analysis(image_path_or_data)

        # Step 2: Convert to JSON
        json_response = self._convert_to_json(paragraph_response)

        return json_response

    def _get_paragraph_analysis(self, image_path_or_data: str)->str:
        """Get paragraph analysis from LLM"""
        # Check if input is base64 data or file path
        if image_path_or_data.startswith('data:image') or len(image_path_or_data) > 100:  # Likely base64
            image_data = image_path_or_data
        else:  # Likely file path
            image_data = self._image_to_base64(image_path_or_data)

        prompt = paragraph_analysis(self.region)

        contents = self.image_llm.llm_contents(
            key=self.key,
            name=self.name,
            prompt=prompt,
            image_data=image_data,
            max_tokens=4000
        )

        return self.image_llm.get_output(url=self.url, llm_contents=contents)

    def _convert_to_json(self, analysis_text: str)->dict:
        """Convert paragraph analysis to structured JSON"""
        prompt = json_information(analysis_text)

        contents = self.image_llm.llm_contents(
            key=self.key,
            name=self.name,
            prompt=prompt,
            max_tokens=2000
        )

        json_response = self.image_llm.get_output(url=self.url, llm_contents=contents)
        return self.parse_llm_response(json_response)

    def _image_to_base64(self, image_path: str) -> str:
        """Convert image file to base64 string"""
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')

    def parse_llm_response(self, llm_response: str) -> dict:
        """Parse LLM response to extract structured data - simplified for clean JSON"""
        try:
            cleaned_response = llm_response.strip()
            
            # Debug: Print the raw response to see what we're getting
            print(f"DEBUG - Raw LLM Response: {cleaned_response}")

            # Try to parse as JSON directly
            try:
                return json.loads(cleaned_response)
            except json.JSONDecodeError:
                pass

            # Look for JSON in markdown blocks
            if "```json" in cleaned_response:
                json_part = cleaned_response.split("```json")[1]
                json_content = json_part.split("```")[0].strip()
                print(f"DEBUG - Extracted JSON: {json_content}")
                return json.loads(json_content)

            # If all else fails, return minimal structure
            print(f"DEBUG - Failed to parse JSON, returning fallback")
            return {
                "specieIdentified": None,
                "nativeRegion": None,
                "invasiveOrNot": False,
                "invasiveEffects": "Could not parse JSON response",
                "nativeAlternatives": [],
                "removeInstructions": ""
            }

        except Exception as e:
            print(f"DEBUG - Exception in parse_llm_response: {str(e)}")
            return {
                "specieIdentified": None,
                "nativeRegion": None,
                "invasiveOrNot": False,
                "invasiveEffects": f"Error: {str(e)}",
                "nativeAlternatives": [],
                "removeInstructions": ""
            }
