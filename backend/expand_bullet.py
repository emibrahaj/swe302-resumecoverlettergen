import os
import sys

# Attempt to load environment variables from .env file
try:
    from dotenv import load_dotenv
    # Find the .env file in the root directory
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
    if os.path.exists(env_path):
        load_dotenv(env_path)
    else:
        # Fallback to local .env
        load_dotenv()
except ImportError:
    pass

from crewai import Agent, Task, Crew


def expand_bulletpoint(short_bullet: str) -> str:
    # Using the same model id as the rest of the project (Groq)
    model_id = "groq/llama-3.3-70b-versatile"
    
    if not os.environ.get("GROQ_API_KEY"):
        print("Warning: GROQ_API_KEY environment variable is not set.")
        print("Please ensure your .env file contains GROQ_API_KEY=your_key_here")
    
    # Create the agent that specializes in expanding bullet points
    expander_agent = Agent(
        role='Resume Bullet Point Optimizer',
        goal='Take a short, basic skill or phrase and expand it into a professional, impactful resume bullet point.',
        backstory=(
            'You are a top-tier executive resume writer and career coach. '
            'You specialize in taking simple skills, daily tasks, or short phrases '
            'and transforming them into achievement-oriented, highly professional '
            'bullet points that use strong action verbs and highlight impact.'
        ),
        llm=model_id,
        verbose=True,
        allow_delegation=False
    )
    
    # Task for the agent
    expansion_task = Task(
        description=(
            f"Expand the following short information into a professional resume bullet point. "
            f"Make it longer, more professional, and impactful. "
            f"Ensure it reads like a high-quality resume entry.\n\n"
            f"Information to expand: '{short_bullet}'"
        ),
        expected_output="A single, perfectly crafted, and extended resume bullet point as a string.",
        agent=expander_agent
    )
    
    # Initialize and run the crew
    crew = Crew(
        agents=[expander_agent],
        tasks=[expansion_task],
        verbose=False # Output clean execution (the agent will still be verbose)
    )
    
    # Kickoff the crew
    result = crew.kickoff()
    return result

def main():
    print("=" * 60)
    print("   AI Resume Bullet Point Expander (Powered by Groq)   ")
    print("=" * 60)
    
    print("\nNote: Press Ctrl+C or type 'exit' to quit.\n")
    
    while True:
        try:
            user_input = input("\nEnter a short skill or phrase to expand: ").strip()
            
            if user_input.lower() in ('exit', 'quit'):
                print("Exiting...")
                break
                
            if not user_input:
                print("Please enter a valid skill or phrase.")
                continue
                
            print("\nExpanding your bullet point... Please wait... (this relies on the Groq LLM)\n")
            expanded_bullet = expand_bulletpoint(user_input)
            
            print("\n" + "=" * 60)
            print("RESULT (Expanded Bullet Point):")
            print("-" * 60)
            # The result output is cast to string just in case newer CrewAI versions return a CrewOutput object
            print(str(expanded_bullet).strip())
            print("=" * 60)
            
        except KeyboardInterrupt:
            print("\nExiting...")
            break
        except Exception as e:
            print(f"\nAn error occurred: {e}")

if __name__ == "__main__":
    main()
