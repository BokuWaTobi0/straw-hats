import './ai-quiz.styles.scss';
import { GoogleGenAI } from '@google/genai';

const googleAi = new GoogleGenAI({apiKey:import.meta.env.VITE_GEMINI_API_KEY})

const AiQuiz = () => {
    const  generateQuiz=async(topic)=> {    
                    const geminiPrompt = `
            Generate a JSON object representing a quiz on ${topic}. The JSON should have the following structure:
            {
            "quiz": {
                "title": "${topic} Quiz",
                "questions": [
                {
                    "question": "...",
                    "options": ["...", "...", "...", "..."],
                    "answer": "...",
                },
                // ... more questions ...
                ]
            }
            }
            Include 5 multiple-choice questions about ${topic}. Each question should have 4 options, a correct answer. Ensure the JSON is valid and well-formatted.
            `;
        try {
            const response = await googleAi.models.generateContent({
                model:"gemini-2.0-flash",
                contents:geminiPrompt
            })
            console.log(response.text)
        } catch (error) {
            console.error("Error fetching quiz:", error);
        }
    }
    
    return ( 


        <div className="ai-quiz-div">
            <button onClick={()=>generateQuiz('compiler design')}>click</button>
        </div>
     );
}
 
export default AiQuiz;