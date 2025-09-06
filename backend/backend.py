from app.llm_framework import LLM
from app.prompt_utils import QuizPrompts, ConversationPrompts, PdfPrompts, SystemPrompts
import os
from dotenv import load_dotenv
import pymupdf
import random
import json
from typing import Dict, Any
llm = LLM()
quiz_prompts = QuizPrompts()
conv_prompts = ConversationPrompts()
pdf_prompts = PdfPrompts()
system_prompts = SystemPrompts()

load_dotenv(override=True)
API_KEY,API_NAME,API_URL = llm.initialize_llm(KEY='LLM_KEY',NAME='LLM_NAME',URL='LLM_URL')
print(llm)
DELIMETER = os.getenv('DELIMETER')

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
        self.prompt = ConversationPrompts()
        self.system = SystemPrompts()

    def chat_response(self,conversation)->str:
        print(self.prompt.conversation(conversation))
        return self.gen(prompt=self.prompt.conversation(conversation),
                        system_prompt=self.system.conversation(),
                        max_tokens=300)
    
    def chat_summary(self,chat_log)->str:
        return self.gen(prompt=self.prompt.conversation_summary(conv=chat_log))
    
class Quiz:
    def __init__(self):
        self.gen = Generate()
        self.prompt = QuizPrompts()
    
    def multiple_choice_from_chat(self,summary:str)->str:
        return self.gen(prompt=quiz_prompts.quiz_from_details(details=summary),
                        system_prompt = system_prompts.quiz())
    
    def multiple_choice_from_transcript(self,number:int,transcript:str)->str:
        return self.gen(prompt = quiz_prompts.quiz_from_transcript(quantity=number,text=transcript),
                        system_prompt = system_prompts.quiz())

class Utils:
    def __init__(self):
        pass

    def remove_empty(self,x:list)->list:
        removed = [line.strip() for line in x if line.strip()]
        return removed
    
    def raw_quiz_to_json(self,raw_quiz:str)->Dict[int,Dict[str,Any]]:
        raw_quiz = raw_quiz.split('\n')
        raw_quiz = self.remove_empty(raw_quiz)
        all_question_data = {}
        for index,question in enumerate(raw_quiz):
            curr_individual_q = question.split(DELIMETER)
            choices = curr_individual_q[1:]
            random.shuffle(choices)
            self.remove_empty(choices)
            correct_index = choices.index(curr_individual_q[1])
            all_question_data[index]={
                'QUESTION':curr_individual_q[0],
                'ANSWER':correct_index,
                'CHOICES':choices
            }
        return all_question_data
    
    def clear_json(self,path:str)->None:
        with open(path, 'w') as f:
            json.dump({},f)
            
    def validate(self,set_num,pindex,choice): #outdated, not used
        with open(f'question_set{set_num}.json', 'r') as f:
            data = json.load(f)
            if choice == data[str(pindex)]["ANSWER"]:
                return True
        return False
class PDFtools:
    def __init__(self):
        self.gen = Generate()
        self.prompt=PdfPrompts()

    def text_summary(self,text:str)->str:
        return self.gen(prompt=self.prompt.summary(text),)
    
    def _extract_text(self,file_path:str,start:int,end:int)->list:
        doc = pymupdf.open(file_path)
        text=[]
        for i in range(start,end):
            page=doc[i]
            text.append(page.get_text())
        return text
    
    def _split_to_calls(self,text:list)->list:
        total_pages = len(text)
        if total_pages<1:
            return [["error"]]
        if total_pages>25:
            return [["too large"]]
        if total_pages>=1 and total_pages <=10:
            return [[0,total_pages]]
        if total_pages>=11 and total_pages <=18:
            n=total_pages//2
            return [
                [0,n],
                [n+1,total_pages]
                ]
        if total_pages>=19 and total_pages <=25:
            n=total_pages//3
            return [
                [0,n],
                [n+1,2*n],
                [(2*n)+1,3*n],
            ]
        
    def summarize_pdf(self,file_path:str,start:int,end:int):
        text = self._extract_text(file_path=file_path,start=start,end=end)
        split_intervals = self._split_to_calls(text=text)

        summary = []
        for i in range(len(split_intervals)):
            start= split_intervals[i][0]
            end = split_intervals[i][1]
            summary.append(self.gen.text_summary(text[start:end]))
        return summary