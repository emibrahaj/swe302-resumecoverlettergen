from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.db import get_db

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"status": "success", "message": "Hello World from FastAPI!"}


@app.get("/db-test")
async def test_db():
    try:
        supabase = get_db()
        response = supabase.table("profiles").select("*").execute()
        return {"data": response.data}
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))