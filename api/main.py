from fastapi import FastAPI
app = FastAPI()

@app.get("/api/agent/status")
def get_status():
    return {"status": "active"}