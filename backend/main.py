# main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import router

app = FastAPI()
# MUST BE CHANGED DURING PRODUCTION
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # must be False if using "*" for origins
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(router)