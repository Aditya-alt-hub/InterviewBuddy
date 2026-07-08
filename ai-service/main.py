# import uvicorn
# import os
# import io
# import json
# import tempfile
# from fastapi import FastAPI,HTTPException,UploadFile,File
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from dotenv import load_dotenv
# from typing import Optional
# import ollama
# import whisper
# from pydub import AudioSegment

# load_dotenv()

# AI_SERVICE_PORT= int(os.getenv("AI_SERVICE_PORT",8000))
# OLLAMA_MODEL_NAME=os.getenv("OLLAMA_MODEL_NAME","mistral")

# app=FastAPI(title="AI Interviewer Microservice",version="1.0")

# origins=["*"]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# WHISPER_MODEL=None

# try:
#     print("Loading Whisper Model...")
#     WHISPER_MODEL=whisper.load_model("base.en")
#     print("Whisper Model Loaded Successfully")
# except Exception as e:
#     print("Error while loading Whisper Model")
#     print(e)

# class QuestionRequest(BaseModel):
#     role:str="MERN Stack Developer"
#     level:str="Junior"
#     count:int=10
#     interview_type:str="coding"

# class QuestionResponse(BaseModel):
#     questions:list[str]
#     model_used:str

# class EvaluationRequest(BaseModel):
#     question:str
#     question_type:str
#     role: str = "MERN Stack Developer"
#     level:str
#     user_answer:Optional[str]=None
#     user_code:Optional[str]=None

# class EvaluationResponse(BaseModel):
#     technicalScore:int
#     confidenceScore:int
#     AIFeedback:str
#     idealAnswer:str


# @app.get("/")
# async def root():
#     return { "message":"Hello from AI Interviewer Microservice !","model":OLLAMA_MODEL_NAME}


# @app.post("/generate-questions",response_model=QuestionResponse)
# async def generate_questions(request:QuestionRequest):

#     try:
#         if request.interview_type=="coding":
#             coding_count=int(request.count*0.2)
#             hr_count = int(request.count * 0.2)
#             technical_count = int(request.count) - int(coding_count) - int(hr_count)


#             instruction=(
#                 f"The first {coding_count} questions MUST be coding challenge requiring function implementation."
#                 f"The first {hr_count} questions MUST be hr interview questions."
#                 f"The remaining {technical_count} questions MUST be conceptual technical questions."
#             )
#         else:
#             instruction="All questions MUST be conceptual technical questions. Do Not generate any coding or implementation challenges."
        
#         system_prompt=(
#             "you are a professional technical interviewer. "
#             "Task: Generate interview questions. No conversational text or numbering. "
#             f"Crucial : {instruction}"
#             "Output exactly one question per line. "
#         )


#         user_prompt=(
#             f"Generate exactly {request.count} unique interview questions for a {request.level} level {request.role} "
#         )
#         response=ollama.generate(
#             model=OLLAMA_MODEL_NAME,
#             prompt=user_prompt,
#             system=system_prompt,
#             options={"temperature":0.6}
#         )

#         raw_text=response['response'].strip()
#         questions=[q.strip() for q in raw_text.split('\n') if q.strip()]
#         return QuestionResponse(questions=questions[:request.count],model_used=OLLAMA_MODEL_NAME)
    
#     except Exception as e:
#         raise HTTPException(status_code=500,detail=str(e))

# @app.post("/transcribe")
# async def transcribe_audio(file:UploadFile=File(...)):
#     try:
#         audio_bytes=await file.read()
#         audio_in_memory=io.BytesIO(audio_bytes)
#         audio_segment=AudioSegment.from_file(audio_in_memory)
#         with tempfile.NamedTemporaryFile(delete=False,suffix=".mp3") as tmp:
#             temp_audio_path=tmp.name
#             audio_segment.export(temp_audio_path,format="mp3")
#         if not WHISPER_MODEL:
#             raise HTTPException(status_code=503,detail="Whisper Model is not loaded")
        
#         result=WHISPER_MODEL.transcribe(temp_audio_path)

#         os.remove(temp_audio_path)
#         return {"transcription":result["text"].strip()}
    
#     except Exception as e:
#         if 'temp_audio_path' in locals() and os.path.exists(temp_audio_path):
#             os.remove(temp_audio_path)
#         raise HTTPException(status_code=500,detail=str(e))
    

# @app.post("/evaluate",response_model=EvaluationResponse)
# async def evaluate(request:EvaluationRequest):
#     try:
#         if request.question_type=="Technical":
#             assessment_instruction=(
#                 "This is a conceptual Technical question. Focus purely on candidate's verbal explanation. "
#                 "Ignore any code blocks. "
#                 "CRITICAL: If the transcript is empty, nonsense (e.g. 'blah blah','testing') or irrelevent to the question, Score 0."
#             )
#         elif request.question_type=="HR":
#             assessment_instruction=(
#             "This is a Introduction and behavioral HR question.Focus purely on candidate's veral explanation. "
#             "Ignore any code blocks. "
#             "CRITICAL: If the transcript is empty, nonsense (e.g. 'blah blah','testing') or irrelevent to the question, SCORE 0."
#             )
#         else:
#             assessment_instruction=(
#                 "This is a coding challenge question. Evaluate the code logic and efficiency. "
#                 "Use the transcription only for insight into their thought process. "
#                 "CRITICAL: If the code is 'udefined',empty, just random comments, or random characters, SCORE 0."
#             )
        
#         system_prompt=(
#              "You are a sstrict technical interviewer. "
#             "Do NOT hallucinate positive reviews for bad input. "
#             "RULE 1: If the answer is gibberish, irrelevant, or missing, return 'technicalScore':0 and 'confidenceScore':0. "
#             "RULE 2: For 'idealAnswer', provide a clean Markdown string.Do NOT return a nested JSON object. "
#             f"Context:{assessment_instruction}"
#             "Respond ONLY with a JSON object. "
#             # "Required keys: 'technicalScore' (0-100), 'confidenceScore' (0-100), 'aiFeedback', 'idealAnswer'. "
#             "Required keys: 'technicalScore' (0-100), 'confidenceScore' (0-100), 'AIFeedback', 'idealAnswer'. "
#         )
#         user_prompt=(
#             f"Role: {request.role}\n"
#             f"Question: {request.question}\n"
#             f"Level: {request.level}\n"
#             f"Verbal Answer: {request.user_answer or 'No verbal answer provided'}\n"
#             f"Code Answer: {request.user_code or 'No code provided'}\n"
#         )

#         response=ollama.generate(
#             model=OLLAMA_MODEL_NAME,
#             prompt=user_prompt,
#             system=system_prompt,
#             format="json",
#             options={"temperature":0.1}
#         )

#         response_text=response['response'].strip()
#         try:
#             evaluation_data=json.loads(response_text)
#             if 'idealAnswer' in evaluation_data and not isinstance(evaluation_data['idealAnswer'],str):
#                 evaluation_data['idealAnswer']=json.dumps(evaluation_data['idealAnswer'])
#             return EvaluationResponse(**evaluation_data)
#         except json.JSONDecodeError:
#             import re
#             fixed_text=re.sub(r'[\r\n\t]',' ',response_text)
#             try:
#                 evaluation_data=json.loads(fixed_text)
#                 if "aiFeedback" in evaluation_data and "AIFeedback" not in evaluation_data:
#                  evaluation_data["AIFeedback"] = evaluation_data["aiFeedback"]
#                 if 'idealAnswer' in evaluation_data and not isinstance(evaluation_data['idealAnswer'],str):
#                     evaluation_data['idealAnswer']=json.dumps(evaluation_data['idealAnswer'])
#                 return EvaluationResponse(**evaluation_data)
#             except :
#                 print(f"Failed to parse response: {response_text}")
#                 return EvaluationResponse(technicalScore=0,confidenceScore=0,AIFeedback="failed to parse response",idealAnswer="Failed to parse response")
    
#     except Exception as e:
#         print(f"Failed to generate response: {e}")
#         raise HTTPException(status_code=500,detail=str(e))
# if __name__=="__main__":
#     uvicorn.run(app,host="0.0.0.0",port=AI_SERVICE_PORT)

import uvicorn
import os
import io
import json
import tempfile
import re

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import Optional

from google import genai
from google.genai import types

# import whisper
# from pydub import AudioSegment

load_dotenv()

AI_SERVICE_PORT = int(os.getenv("AI_SERVICE_PORT", 8000))
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

client = genai.Client(api_key=GEMINI_API_KEY)

app = FastAPI(title="AI Interviewer Microservice", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WHISPER_MODEL = None

# try:
#     print("Loading Whisper Model...")
#     WHISPER_MODEL = whisper.load_model("base.en")
#     print("Whisper Model Loaded Successfully")
# except Exception as e:
#     print("Error while loading Whisper Model")
#     print(e)


class QuestionRequest(BaseModel):
    role: str = "MERN Stack Developer"
    level: str = "Junior"
    count: int = 10
    interview_type: str = "coding"


class QuestionResponse(BaseModel):
    questions: list[str]
    model_used: str


class EvaluationRequest(BaseModel):
    question: str
    question_type: str
    role: str = "MERN Stack Developer"
    level: str
    user_answer: Optional[str] = None
    user_code: Optional[str] = None


class EvaluationResponse(BaseModel):
    technicalScore: int
    confidenceScore: int
    AIFeedback: str
    idealAnswer: str


def ask_gemini(prompt: str, system_prompt: str, temperature: float = 0.5, json_mode: bool = False):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is missing")

    config_data = {
        "temperature": temperature,
        "system_instruction": system_prompt,
    }

    if json_mode:
        config_data["response_mime_type"] = "application/json"

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(**config_data),
    )

    return response.text.strip()


@app.get("/")
async def root():
    return {
        "message": "Hello from AI Interviewer Microservice!",
        "model": GEMINI_MODEL,
    }


# @app.post("/generate-questions", response_model=QuestionResponse)
# async def generate_questions(request: QuestionRequest):
#     try:
#         if request.interview_type == "coding":
#             coding_count = int(request.count * 0.2)
#             hr_count = int(request.count * 0.2)
#             technical_count = request.count - coding_count - hr_count

#             instruction = (
#                 f"Generate exactly {request.count} questions. "
#                 f"First {coding_count} questions must be coding challenge questions. "
#                 f"Next {technical_count} questions must be conceptual technical questions. "
#                 f"Last {hr_count} questions must be HR/behavioral questions. "
#             )
#         else:
#             instruction = (
#                 f"Generate exactly {request.count} conceptual technical questions only. "
#                 "Do not generate coding or HR questions."
#             )

#         system_prompt = (
#             "You are a professional technical interviewer. "
#             "Generate interview questions only. "
#             "No explanation. No numbering. "
#             "Output exactly one question per line. "
#             f"{instruction}"
#         )

#         user_prompt = (
#             f"Role: {request.role}\n"
#             f"Level: {request.level}\n"
#             f"Total Questions: {request.count}\n"
#         )

#         raw_text = ask_gemini(
#             prompt=user_prompt,
#             system_prompt=system_prompt,
#             temperature=0.6,
#             json_mode=False,
#         )

#         questions = [q.strip("-•0123456789. ").strip() for q in raw_text.split("\n") if q.strip()]

#         return QuestionResponse(
#             questions=questions[:request.count],
#             model_used=GEMINI_MODEL,
#         )

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-questions", response_model=QuestionResponse)
async def generate_questions(request: QuestionRequest):
    try:
        interview_type = request.interview_type.lower()

        if interview_type == "coding":
            instruction = (
                f"Generate exactly {request.count} coding challenge questions only. "
                "Do not generate conceptual technical or HR questions. "
                "Questions should require writing code, solving logic, algorithms, or implementation."
            )

        elif interview_type == "coding" and request.role == "Data Structures and Algorithms":
            instruction = (
               f"""Generate exactly {request.count} Data Structures and Algorithms coding interview questions only. "

                Each question MUST follow this exact format:

                Problem Statement:
                - Write a clear and detailed problem description.

                Input Format:
                - Explain the input.

                Output Format:
                - Explain the expected output.

                Constraints:
                - Include realistic interview constraints.

                Example 1:
                Input:
                ...

                Output:
                ...

                Explanation:
                ...

                Example 2:
                Input:
                ...

                Output:
                ...

                Explanation:
                ...

                Hint:
                - Give only one small hint.
                - Do NOT reveal the algorithm or complete approach.

                Requirements:
                - Do NOT provide the solution.
                - Do NOT provide code.
                - Do NOT provide time or space complexity.
                - Questions should be suitable for {request.level} level.
                - Questions should match the role: {request.role}.
                - Every question should be independent.
                """
            )
            
        elif interview_type == "technical":
            instruction = (
                f"Generate exactly {request.count} conceptual technical questions only. "
                "Do not generate coding challenge or HR questions. "
                "Questions should test concepts, theory, architecture, tools, and practical understanding."
            )

        elif interview_type == "hr":
            instruction = (
                f"Generate exactly {request.count} HR or behavioral interview questions only. "
                "Do not generate coding or conceptual technical questions. "
                "Questions should test communication, attitude, teamwork, conflict handling, and career goals."
            )

        else:
            raise HTTPException(status_code=400, detail="Invalid interview_type. Use coding, Technical, or HR")

        system_prompt = (
            "You are a professional interviewer. "
            "Generate interview questions only. "
            "No explanation. No numbering. "
            "Output exactly one question per line. "
            f"{instruction}"
        )

        user_prompt = (
            f"Role: {request.role}\n"
            f"Level: {request.level}\n"
            f"Interview Type: {request.interview_type}\n"
            f"Total Questions: {request.count}\n"
        )

        raw_text = ask_gemini(
            prompt=user_prompt,
            system_prompt=system_prompt,
            temperature=0.6,
            json_mode=False,
        )

        questions = [
            q.strip("-•0123456789. ").strip()
            for q in raw_text.split("\n")
            if q.strip()
        ]

        return QuestionResponse(
            questions=questions[:request.count],
            model_used=GEMINI_MODEL,
        )

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# @app.post("/transcribe")
# async def transcribe_audio(file: UploadFile = File(...)):
#     try:
#         audio_bytes = await file.read()
#         audio_in_memory = io.BytesIO(audio_bytes)

#         audio_segment = AudioSegment.from_file(audio_in_memory)

#         with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
#             temp_audio_path = tmp.name
#             audio_segment.export(temp_audio_path, format="mp3")

#         if not WHISPER_MODEL:
#             raise HTTPException(status_code=503, detail="Whisper Model is not loaded")

#         result = WHISPER_MODEL.transcribe(temp_audio_path)

#         os.remove(temp_audio_path)

#         return {"transcription": result["text"].strip()}

#     except Exception as e:
#         if "temp_audio_path" in locals() and os.path.exists(temp_audio_path):
#             os.remove(temp_audio_path)

#         raise HTTPException(status_code=500, detail=str(e))

# @app.post("/transcribe")
# async def transcribe_audio(file: UploadFile = File(...)):
#     temp_audio_path = None

#     try:
#         audio_bytes = await file.read()

#         suffix = os.path.splitext(file.filename or "")[1] or ".mp3"

#         with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
#             temp_audio_path = tmp.name
#             tmp.write(audio_bytes)

#         if not WHISPER_MODEL:
#             raise HTTPException(status_code=503, detail="Whisper Model is not loaded")

#         result = WHISPER_MODEL.transcribe(temp_audio_path)

#         return {"transcription": result["text"].strip()}

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

#     finally:
#         if temp_audio_path and os.path.exists(temp_audio_path):
#             os.remove(temp_audio_path)

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    raise HTTPException(
        status_code=503,
        detail="Voice transcription is temporarily disabled on the deployed server."
    )


@app.post("/evaluate", response_model=EvaluationResponse)
async def evaluate(request: EvaluationRequest):
    try:
        if request.question_type == "Technical":
            assessment_instruction = (
                "This is a conceptual technical question. "
                "Evaluate only the candidate's explanation. "
                "Ignore code blocks. "
                "If answer is empty, nonsense, or irrelevant, score 0."
            )

        elif request.question_type == "HR":
            assessment_instruction = (
                "This is an HR or behavioral question. "
                "Evaluate communication, confidence, relevance, and structure. "
                "If answer is empty, nonsense, or irrelevant, score 0."
            )

        else:
            assessment_instruction = (
                "This is a coding challenge question. "
                "Evaluate code correctness, logic, edge cases, and efficiency. "
                "If code is empty, undefined, random comments, or invalid, score 0."
            )

        system_prompt = (
            "You are a strict technical interviewer. "
            "Do not give positive feedback for bad input. "
            "Return only valid JSON. "
            "Required keys: technicalScore, confidenceScore, AIFeedback, idealAnswer. "
            "technicalScore and confidenceScore must be numbers from 0 to 100. "
            "idealAnswer must be a plain string, not an object. "
            f"Context: {assessment_instruction}"
        )

        user_prompt = (
            f"Role: {request.role}\n"
            f"Level: {request.level}\n"
            f"Question Type: {request.question_type}\n"
            f"Question: {request.question}\n"
            f"Verbal Answer: {request.user_answer or 'No verbal answer provided'}\n"
            f"Code Answer: {request.user_code or 'No code provided'}\n"
        )

        response_text = ask_gemini(
            prompt=user_prompt,
            system_prompt=system_prompt,
            temperature=0.1,
            json_mode=True,
        )

        try:
            evaluation_data = json.loads(response_text)
        except json.JSONDecodeError:
            fixed_text = re.sub(r"```json|```", "", response_text).strip()
            evaluation_data = json.loads(fixed_text)

        if "aiFeedback" in evaluation_data and "AIFeedback" not in evaluation_data:
            evaluation_data["AIFeedback"] = evaluation_data["aiFeedback"]

        if "idealAnswer" in evaluation_data and not isinstance(evaluation_data["idealAnswer"], str):
            evaluation_data["idealAnswer"] = json.dumps(evaluation_data["idealAnswer"])

        return EvaluationResponse(**evaluation_data)

    except Exception as e:
        print(f"Failed to generate response: {e}")
        return EvaluationResponse(
            technicalScore=0,
            confidenceScore=0,
            AIFeedback="Failed to evaluate answer.",
            idealAnswer="Failed to generate ideal answer.",
        )


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=AI_SERVICE_PORT)

