from agents import Agent, Runner, function_tool, run_demo_loop ,SQLiteSession 
import requests
from connection import config
from qdrant_rag import QdrantRAGClient
from openai.types.responses import ResponseTextDeltaEvent
import asyncio
from dotenv import load_dotenv
from pydantic import ValidationError
load_dotenv()

# Initialize the Qdrant RAG client
rag_client = QdrantRAGClient()

session = SQLiteSession("my_first_conversation")

# @function_tool
# def search_documentation(query: str) -> str:

@function_tool
def search_documentation(query: str) -> str:
    print("TOOL CALLED WITH QUERY:", query)

    try:
        results = rag_client.search(query, limit=3)
        print("QDRANT RESULTS:", results)

        if not results:
            return "No relevant documentation found for your query."

        formatted_results = []
        for i, result in enumerate(results, 1):
            formatted_results.append(
                f"Document {i} (Score: {result['score']:.3f}, File: {result['file_name']}):\n"
                f"{result['content'][:500]}..."
            )

        return "\n\n".join(formatted_results)

    except Exception as e:
        print("🔥 QDRANT ERROR:", repr(e))   # 👈 MOST IMPORTANT
        raise e   # 👈 re-raise so uv shows full traceback

    """
    Search the Physical AI & Humanoid Robotics documentation for relevant information.
    """
    try:
        results = rag_client.search(query, limit=3)
        print("DEBUG QDRANT RESULTS:", results)
    except Exception as e:
        return f"ERROR while searching documentation: {str(e)}"

    if not results:
        return "No relevant documentation found for your query."

    # Format the results
    formatted_results = []
    for i, result in enumerate(results, 1):
        formatted_results.append(
            f"Document {i} (Score: {result['score']:.3f}, File: {result['file_name']}):\n"
            f"{result['content'][:500]}..."  # Limit content length
        )

    return "\n\n".join(formatted_results)

# Create the RAG agent
rag_agent = Agent(
    name="Physical AI & Humanoid Robotics Documentation Assistant",
    instructions="You are an AI assistant that helps users with questions about Physical AI and Humanoid Robotics based on the official documentation. Always search the documentation first using the search_documentation tool when a user asks a question. Provide accurate answers based on the retrieved documentation. If the documentation doesn't contain the answer, politely say you don't have enough information. Cite the source file when providing information from the documentation. Be helpful and provide clear, concise answers related to robotics, AI, ROS 2, Isaac, etc.",
    tools=[search_documentation]
    
)

async def main():
#  with trace("RAG Chatbot"):
    """
    Main function to run the RAG chatbot
    """
    print("Physical AI & Humanoid Robotics Documentation Assistant")
    print("Ask me anything about robotics, AI, ROS 2, Isaac, etc.")
    print("Type 'quit' to exit.\n")
    while True:

      user_input = input("chat some thing : ")

    # Run the agent in an interactive demo loop
      result =  Runner.run_streamed(
      rag_agent,
      user_input,
      run_config=config,
      session=session
      )

      try:
        async for event in result.stream_events():
         if event.type == "raw_response_event" and isinstance(event.data, ResponseTextDeltaEvent):
            print(event.data.delta, end="", flush=True)
      except ValidationError as validation_error:
            print("Validation error:", validation_error)
      except Exception as e:
            print("An unhandled error occurred:", e)       


if __name__ == "__main__":
    asyncio.run(main())