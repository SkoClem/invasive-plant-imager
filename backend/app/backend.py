from app.llm_framework import LLM, Gemini, ImageLLM
import os
import base64
llm = LLM()
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
    def __init__(self):
        self.llm_info = LLM().initialize_llm(KEY='LLM_KEY',NAME='LLM_NAME',URL='LLM_URL')
        self.key, self.name, self.url = self.llm_info
        self.region = "North America"  # Default region, can be changed
        self.image_llm = ImageLLM()

    def analyze_plant_image(self, image_path: str)->str:
        """Analyze plant image for invasive species"""
        image_data = self._image_to_base64(image_path)
        prompt = f"Based on the image of the plant, is the plant invasive species in {self.region}?"

        contents = self.image_llm.llm_contents(
            key=self.key,
            name=self.name,
            prompt=prompt,
            image_data=image_data,
            max_tokens=300
        )

        return self.image_llm.get_output(url=self.url, llm_contents=contents)

    def _image_to_base64(self, image_path: str) -> str:
        """Convert image file to base64 string"""
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')

    def chat_response(self, image_data: str)->str:
        """Analyze plant image from base64 data for invasive species"""
        prompt = f"Based on the image of the plant, is the plant invasive species in {self.region}? Please respond with a structured analysis including whether it's invasive, confidence level, and explanation."

        contents = self.image_llm.llm_contents(
            key=self.key,
            name=self.name,
            prompt=prompt,
            image_data=image_data,
            max_tokens=300
        )

        return self.image_llm.get_output(url=self.url, llm_contents=contents)
