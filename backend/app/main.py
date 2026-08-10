from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import tickets
from app.database import Base, engine
from typing import List

app = FastAPI(
    title="SupportFlow API",
    description="Customer Support Ticket CRM",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create database tables
Base.metadata.create_all(bind=engine)

# Register routes
app.include_router(tickets.router)


@app.get("/")
def home():
    return {
        "message": "Welcome to SupportFlow API"
    }