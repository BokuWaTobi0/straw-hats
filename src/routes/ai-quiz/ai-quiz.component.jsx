import './ai-quiz.styles.scss';
import { GoogleGenAI } from '@google/genai';
import { useState } from 'react';
import AsyncLoader from '../../components/async-loader/async-loader.component';
import { FaLightbulb, FaRedo, FaCheck, FaTimes } from 'react-icons/fa';

const googleAi = new GoogleGenAI({apiKey:import.meta.env.VITE_GEMINI_API_KEY});

const AiQuiz = () => {
    const [topic, setTopic] = useState('');
    const [quizData, setQuizData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    
    const generateQuiz = async(topic) => {    
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
            Include 10 multiple-choice questions about ${topic}. Each question should have 4 options, a correct answer. Ensure the JSON is valid and well-formatted.
            `;
        try {
            const response = await googleAi.models.generateContent({
                model:"gemini-2.0-flash",
                contents:geminiPrompt
            });
            return response.text;
        } catch (error) {
            console.error("Error fetching quiz:", error);
            throw error;
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!topic.trim()) return;
        
        setIsLoading(true);
        setError(null);
        setQuizData(null);
        setSelectedAnswers({});
        setCurrentQuestion(0);
        setShowResults(false);
        
        try {
            const quizText = await generateQuiz(topic);
            const jsonMatch = quizText.match(/```json\n([\s\S]*?)\n```/) || 
                             quizText.match(/```\n([\s\S]*?)\n```/) || 
                             [null, quizText];
            
            const cleanedJson = jsonMatch[1].trim();
            const parsedData = JSON.parse(cleanedJson);
            setQuizData(parsedData);
        } catch (err) {
            console.error("Error processing quiz data:", err);
            setError("Failed to generate quiz. Please try again with a different topic.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAnswerSelect = (questionIndex, answer) => {
        setSelectedAnswers({
            ...selectedAnswers,
            [questionIndex]: answer
        });
    };
    
    const handleNextQuestion = () => {
        if (currentQuestion < quizData.quiz.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            setShowResults(true);
        }
    };
    
    const handlePrevQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };
    
    const calculateScore = () => {
        if (!quizData) return 0;
        
        let correctAnswers = 0;
        quizData.quiz.questions.forEach((question, index) => {
            if (selectedAnswers[index] === question.answer) {
                correctAnswers++;
            }
        });
        
        return correctAnswers;
    };
    
    const resetQuiz = () => {
        setSelectedAnswers({});
        setCurrentQuestion(0);
        setShowResults(false);
    };
    
    const renderQuizQuestion = () => {
        if (!quizData || !quizData.quiz || !quizData.quiz.questions) return null;
        
        const question = quizData.quiz.questions[currentQuestion];
        
        return (
            <div className="quiz-question">
                <div className="question-header">
                    <h3>Question {currentQuestion + 1} of {quizData.quiz.questions.length}</h3>
                    <div className="progress-bar">
                        <div 
                            className="progress" 
                            style={{ width: `${((currentQuestion + 1) / quizData.quiz.questions.length) * 100}%` }}
                        ></div>
                    </div>
                </div>
                
                <div className="question-content">
                    <h2>{question.question}</h2>
                    
                    <div className="options-list">
                        {question.options.map((option, index) => (
                            <div 
                                key={index} 
                                className={`option ${selectedAnswers[currentQuestion] === option ? 'selected' : ''}`}
                                onClick={() => handleAnswerSelect(currentQuestion, option)}
                            >
                                <div className="option-marker">{String.fromCharCode(65 + index)}</div>
                                <div className="option-text">{option}</div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="question-navigation">
                    <button 
                        className="nav-button prev" 
                        onClick={handlePrevQuestion}
                        disabled={currentQuestion === 0}
                    >
                        Previous
                    </button>
                    
                    <button 
                        className="nav-button next" 
                        onClick={handleNextQuestion}
                        disabled={!selectedAnswers[currentQuestion]}
                    >
                        {currentQuestion === quizData.quiz.questions.length - 1 ? 'Finish' : 'Next'}
                    </button>
                </div>
            </div>
        );
    };
    
    const renderResults = () => {
        if (!quizData) return null;
        
        const score = calculateScore();
        const totalQuestions = quizData.quiz.questions.length;
        const percentage = Math.round((score / totalQuestions) * 100);
        
        return (
            <div className="quiz-results">
                <h2>Quiz Results</h2>
                
                <div className="score-summary">
                    <div className="score-circle">
                        <div className="score-percentage">{percentage}%</div>
                        <div className="score-text">
                            {score} out of {totalQuestions} correct
                        </div>
                    </div>
                    
                    {percentage >= 70 ? (
                        <div className="score-message success">
                            <FaCheck /> Great job! You've mastered this topic.
                        </div>
                    ) : (
                        <div className="score-message warning">
                            <FaLightbulb /> Keep learning! Review the questions to improve.
                        </div>
                    )}
                </div>
                
                <div className="results-details">
                    <h3>Question Review</h3>
                    
                    {quizData.quiz.questions.map((question, index) => (
                        <div key={index} className="result-item">
                            <div className="result-question">
                                <span className={`result-indicator ${selectedAnswers[index] === question.answer ? 'correct' : 'incorrect'}`}>
                                    {selectedAnswers[index] === question.answer ? <FaCheck /> : <FaTimes />}
                                </span>
                                <span>Q{index + 1}: {question.question}</span>
                            </div>
                            
                            <div className="result-answers">
                                <div className="answer-item">
                                    <span className="answer-label">Your answer:</span>
                                    <span className={`answer-value ${selectedAnswers[index] === question.answer ? 'correct' : 'incorrect'}`}>
                                        {selectedAnswers[index] || 'Not answered'}
                                    </span>
                                </div>
                                
                                {selectedAnswers[index] !== question.answer && (
                                    <div className="answer-item">
                                        <span className="answer-label">Correct answer:</span>
                                        <span className="answer-value correct">{question.answer}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="results-actions">
                    <button className="action-button retry" onClick={resetQuiz}>
                        <FaRedo /> Try Again
                    </button>
                    <button className="action-button new-quiz" onClick={() => setQuizData(null)}>
                        New Quiz
                    </button>
                </div>
            </div>
        );
    };
    
    return (
        <div className="ai-quiz-container">
            <div className="ai-quiz-header">
                <h1>AI-Powered Quiz Generator</h1>
                <p>Generate custom quizzes on any topic using artificial intelligence</p>
            </div>
            
            {!quizData ? (
                <div className="quiz-generator">
                    <form onSubmit={handleSubmit} className="topic-form">
                        <div className="input-group">
                            <label htmlFor="topic">Enter a topic for your quiz:</label>
                            <input
                                type="text"
                                id="topic"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g. Networking, Solar System, Machine Learning"
                                required
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="generate-button"
                            disabled={isLoading || !topic.trim()}
                        >
                            {isLoading ? 'Generating...' : 'Generate Quiz'}
                        </button>
                    </form>
                    
                    {isLoading && (
                        <div className="loading-container">
                            <AsyncLoader type="loading" ls="60px" text="Creating your quiz..." />
                        </div>
                    )}
                    
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}
                </div>
            ) : (
                <div className="quiz-container">
                    <h2 className="quiz-title">{quizData.quiz.title}</h2>
                    
                    {showResults ? renderResults() : renderQuizQuestion()}
                </div>
            )}
        </div>
    );
};

export default AiQuiz;