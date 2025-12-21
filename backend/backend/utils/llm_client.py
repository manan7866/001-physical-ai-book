from openai import OpenAI
from dotenv import load_dotenv
import os
from typing import List, Dict, Any
import logging

load_dotenv()

logger = logging.getLogger(__name__)

class LLMClient:
    def __init__(self):
        gemini_api_key = os.getenv("GEMINI_API_KEY")

        if not gemini_api_key:
            raise ValueError("GEMINI_API_KEY is not set. Please ensure it is defined in your .env file.")

        # Initialize OpenAI client with Gemini endpoint
        self.client = OpenAI(
            api_key=gemini_api_key,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        )
        self.model = "gemini-2.5-flash"

    def generate_response(self, user_message: str, context: List[Dict] = None, chat_history: List[Dict] = None, user_profile: Dict = None) -> str:
        """
        Generate a response using the LLM with RAG context and user preferences
        """
        try:
            # Prepare the system message with context and user preferences
            system_message = self._build_system_message(user_profile)

            # Prepare messages for the conversation
            messages = [{"role": "system", "content": system_message}]

            # Add chat history if provided
            if chat_history:
                for msg in chat_history:
                    # Check if it's a dict (from frontend) or ChatMessage object (from Pydantic model)
                    if hasattr(msg, 'role') and hasattr(msg, 'content'):
                        # It's a ChatMessage object from Pydantic
                        role = msg.role
                        content = msg.content
                    else:
                        # It's a dict
                        role = msg.get("role", "user") if isinstance(msg, dict) else "user"
                        content = msg.get("content", "") if isinstance(msg, dict) else ""
                    messages.append({"role": role, "content": content})

            # Add context information
            if context:
                context_str = "Here is relevant information from the documentation:\n\n"
                for i, doc in enumerate(context, 1):
                    context_str += f"Document {i} (File: {doc.get('file_name', 'Unknown')}):\n{doc.get('content', '')}\n\n"

                messages.append({"role": "system", "content": context_str})

            # Add user message
            messages.append({"role": "user", "content": user_message})

            # Generate response
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=1000
            )

            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Error generating LLM response: {str(e)}")
            # If LLM fails, create a simple response using the context
            if context:
                response = "Based on the documentation:\n\n"
                for doc in context[:2]:  # Use first 2 documents
                    response += f"From {doc.get('file_name', 'Unknown')}:\n{doc.get('content', '')[:300]}...\n\n"
                return response
            else:
                return "I found some information in the documentation, but I couldn't generate a detailed response. Please try rephrasing your question."

    def _build_system_message(self, user_profile: Dict = None) -> str:
        """
        Build a system message based on user preferences
        """
        # Default system message
        base_message = "You are an AI assistant that helps users with questions about Physical AI and Humanoid Robotics based on the official documentation. Use the provided context to answer questions accurately. If the context doesn't contain the answer, politely say you don't have enough information. Cite the source file when providing information from the documentation. Be helpful and provide clear, concise answers related to robotics, AI, ROS 2, Isaac, etc."

        # If no user profile is provided, return the base message
        if not user_profile:
            return base_message

        # Build message based on user preferences
        technical_level = user_profile.get('technical_level', '')
        ros_experience = user_profile.get('ros_experience', '')
        explanation_style = user_profile.get('explanation_style', '')
        preferred_language = user_profile.get('preferred_language', 'English')

        # Determine explanation style
        style_instruction = ""
        if explanation_style == "Simple":
            style_instruction = "Provide simple, easy-to-understand explanations with minimal technical jargon."
        elif explanation_style == "Deep technical":
            style_instruction = "Provide detailed, technical explanations with in-depth analysis and advanced concepts."
        else:  # Balanced
            style_instruction = "Provide balanced explanations that are clear but include relevant technical details."

        # Determine technical complexity based on experience
        experience_instruction = ""
        if technical_level == "Beginner":
            experience_instruction = "Assume the user has limited technical background and explain concepts from the ground up."
        elif technical_level == "Advanced":
            experience_instruction = "Assume the user has advanced technical knowledge and can handle complex concepts."
        else:  # Intermediate
            experience_instruction = "Assume the user has intermediate technical knowledge and provide explanations at an appropriate level."

        # Handle preferred language
        language_instruction = f"Respond in {preferred_language}."
        if preferred_language.lower() == "urdu":
            language_instruction += " Use appropriate transliteration or translation for technical terms if needed."

        # Combine all instructions
        system_message = f"{base_message}\n\nUser Preferences:\n- {experience_instruction}\n- {style_instruction}\n- {language_instruction}"

        # Add ROS experience context
        if ros_experience:
            if ros_experience == "None":
                system_message += f"\n- The user has no ROS experience, so explain ROS concepts when relevant."
            elif ros_experience == "Basic":
                system_message += f"\n- The user has basic ROS experience, so provide moderate ROS explanations."
            else:  # Experienced
                system_message += f"\n- The user has experienced ROS knowledge, so use advanced ROS terminology when appropriate."

        return system_message

    def generate_explanation(self, selected_text: str, context: str = None, user_profile: Dict = None) -> str:
        """
        Generate an explanation for selected text with optional context
        """
        try:
            query = f"Explain this concept: {selected_text}"
            if context:
                query = f"Context: {context}. Explain this text: {selected_text}"

            # Build system message based on user preferences
            system_message = self._build_system_message(user_profile)
            # Add specific instruction for explanation
            system_message += "\n\nYour task is to provide a clear explanation of the selected text based on your knowledge of robotics, AI, ROS 2, Isaac, etc. If you have relevant information from the documentation, include it in your explanation."

            messages = [
                {"role": "system", "content": system_message},
                {"role": "user", "content": query}
            ]

            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=800
            )

            return response.choices[0].message.content

        except Exception as e:
            logger.error(f"Error generating explanation: {str(e)}")
            # If LLM fails, return a simple response
            return f"Selected text: '{selected_text}'\n\nI found this in the documentation. For a more detailed explanation, please check the relevant documentation sections."