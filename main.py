from fastapi import FastAPI, HTTPException, Request
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
import os
from openai import OpenAI
from dotenv import dotenv_values
import uvicorn

app = FastAPI(title="RAG API", version="1.0.0")

env_vals = dotenv_values(".env")
os.environ['PINECONE_API_KEY'] = env_vals.get("PINECONE_API_KEY")

pc = Pinecone(api_key=env_vals.get("PINECONE_API_KEY"))
pinecone_index = pc.Index("codebase-rag")

client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=env_vals.get("GROQ_API_KEY")
)

model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")

def get_huggingface_embeddings(text):
    return model.encode(text)

def perform_rag(query: str):
    raw_query_embedding = get_huggingface_embeddings(query)
    top_matches = pinecone_index.query(
        vector=raw_query_embedding.tolist(),
        top_k=5,
        include_metadata=True,
        namespace="https://github.com/CoderAgent/SecureAgent"
    )
    contexts = [item['metadata']['text'] for item in top_matches['matches']]
    augmented_query = "<CONTEXT>\n" + "\n\n-------\n\n".join(contexts[:10]) + "\n-------\n</CONTEXT>\n\n\n\nMY QUESTION:\n" + query
    system_prompt = """You are a Senior Software Engineer, specializing in TypeScript.
    Answer any questions I have about the codebase, based on the code provided. Always consider all of the context provided when forming a response."""
    llm_response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": augmented_query}
        ]
    )
    return llm_response.choices[0].message.content

@app.post("/rag")
async def rag_endpoint(request: Request):
    try:
        body = await request.json()
        query = body.get("text")
        if not query:
            raise HTTPException(status_code=400, detail="Query text is required")
        response = perform_rag(query)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
