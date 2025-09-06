from llm_framework import LLM
import os
llm = LLM()

load_dotenv(override=True)
API_KEY,API_NAME,API_URL = llm.initialize_llm(KEY='LLM_KEY',NAME='LLM_NAME',URL='LLM_URL')
print(llm)

class Generate:
    def __init__(self):
        self.key=API_KEY
        self.name=API_NAME
        self.url=API_URL

        self.LLM=LLM()
    def __call__(self,
                 prompt:str,
                 system_prompt:str|None=None,
                 max_tokens:int|None=None):
        contents = self.LLM.llm_contents(key=self.key,
                                         name=self.name,
                                         prompt=prompt,
                                         system_prompt=system_prompt,
                                         max_tokens=max_tokens)
        return self.LLM.get_output(url=self.url, llm_contents=contents)
    
class Conversation:
    def __init__(self):
        self.gen = Generate()
        self.prompt = "prompt"
        self.system = "system"
    def chat_response(self,conversation)->str:
        print(self.prompt.conversation(conversation))
        return self.gen(prompt=self.prompt,
                        system_prompt=self.system,
                        max_tokens=300)
