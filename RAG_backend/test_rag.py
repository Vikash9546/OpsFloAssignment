import asyncio
from app.rag.rag_pipeline import RAGPipeline

async def main():
    try:
        pipeline = RAGPipeline()
        res = await pipeline.process_query("What is maintenance?")
        print("Success:", res)
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
