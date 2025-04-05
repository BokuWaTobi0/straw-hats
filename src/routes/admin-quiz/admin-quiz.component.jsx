import { useState, useEffect } from 'react';
import './admin-quiz.styles.scss'
import { realtimeDb } from '../../utils/firebase';
import { ref, onValue } from 'firebase/database';
import { useUserAuthContext } from '../../contexts/user-auth-context.context';
import { useGlobalDataContext } from '../../contexts/global-data.context';
import { useGlobalDbContext } from '../../contexts/global-db.context';
import AsyncLoader from '../../components/async-loader/async-loader.component';
import { FaRegClock, FaCheck, FaTimes, FaChevronDown, FaChevronUp, FaEdit, FaTrash, FaPlay } from 'react-icons/fa';

const AdminQuiz = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedQuiz, setExpandedQuiz] = useState(null);
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [quizCompleted, setQuizCompleted] = useState(false);
    
    const { user } = useUserAuthContext();
    const { isAdmin } = useGlobalDataContext();
    const { admins, orgs } = useGlobalDbContext();
    
    useEffect(() => {
        const fetchQuizzes = async () => {
            if (!user || !isAdmin) {
                setLoading(false);
                return;
            }
            
            try {
                const currentAdmin = admins.filter(admin => admin.adminEmail === user.email)[0];
                const orgId = orgs.filter(org => org.orgName === currentAdmin.adminOrganization)[0].key;
                
                const quizzesRef = ref(realtimeDb, `adminQuizzes/${orgId}`);
                
                onValue(quizzesRef, (snapshot) => {
                    if (!snapshot.exists()) {
                        setQuizzes([]);
                    } else {
                        const quizzesData = snapshot.val();
                        const quizzesArray = Object.entries(quizzesData).map(([id, quiz]) => ({
                            id,
                            ...quiz
                        }));
                        setQuizzes(quizzesArray);
                    }
                    setLoading(false);
                }, (err) => {
                    console.error('Error fetching quizzes:', err);
                    setError('Failed to load quizzes');
                    setLoading(false);
                });
                
            } catch (err) {
                console.error('Error setting up quizzes listener:', err);
                setError('Failed to load quizzes');
                setLoading(false);
            }
        };
        
        fetchQuizzes();
    }, [user, isAdmin, admins, orgs]);
    
    const toggleQuizExpansion = (quizId) => {
        setExpandedQuiz(expandedQuiz === quizId ? null : quizId);
    };
    
    const startQuiz = (quiz) => {
        setActiveQuiz(quiz);
        setCurrentQuestion(0);
        setSelectedAnswers({});
        setQuizCompleted(false);
    };
    
    const handleAnswerSelect = (optionIndex) => {
        setSelectedAnswers({
            ...selectedAnswers,
            [currentQuestion]: optionIndex
        });
    };
    
    const goToNextQuestion = () => {
        if (currentQuestion < activeQuiz.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            setQuizCompleted(true);
        }
    };
    
    const goToPrevQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };
    
    const exitQuiz = () => {
        setActiveQuiz(null);
        setSelectedAnswers({});
        setCurrentQuestion(0);
        setQuizCompleted(false);
    };
    
    const calculateScore = () => {
        if (!activeQuiz) return { correct: 0, total: 0, percentage: 0 };
        
        let correctCount = 0;
        activeQuiz.questions.forEach((question, index) => {
            const selectedOptionIndex = selectedAnswers[index];
            if (selectedOptionIndex !== undefined) {
                const selectedOption = question.options[selectedOptionIndex];
                if (selectedOption && selectedOption.isCorrect) {
                    correctCount++;
                }
            }
        });
        
        const total = activeQuiz.questions.length;
        const percentage = Math.round((correctCount / total) * 100);
        
        return { correct: correctCount, total, percentage };
    };
    
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    if (loading) {
        return <AsyncLoader type="loading" ls="60px" text="Loading quizzes..." />;
    }
    
    if (error) {
        return <div className="error-container">{error}</div>;
    }
    
    // if (!isAdmin) {
    //     return <AsyncLoader type="empty" ls="60px" text="You don't have permission to view this page" />;
    // }
    
    if (quizzes.length === 0) {
        return (
            <div className="admin-quiz-div empty">
                <h2>No Quizzes Available</h2>
                <p>Create your first quiz by going to the Create Quiz page.</p>
            </div>
        );
    }
    
    if (activeQuiz) {
        const currentQuestionData = activeQuiz.questions[currentQuestion];
        
        if (quizCompleted) {
            const score = calculateScore();
            const percentage = score.percentage;
            const isCorrect = (selectedOptionIndex, correctOptionIndex) => selectedOptionIndex === correctOptionIndex;
            
            return (
                <div className="admin-quiz-div quiz-result-container">
                    <h2>Quiz Results</h2>
                    <p className="quiz-title">{activeQuiz.name}</p>
                    
                    <div className="results-overview">
                        <div className="result-stat score">
                            <span className="label">Score</span>
                            <div className="value">{percentage}%</div>
                            <span className="subtext">Overall performance</span>
                        </div>
                        
                        <div className="result-stat correct">
                            <span className="label">Correct</span>
                            <div className="value">{score.correct}</div>
                            <span className="subtext">of {score.total} questions</span>
                        </div>
                        
                        <div className="result-stat incorrect">
                            <span className="label">Incorrect</span>
                            <div className="value">{score.total - score.correct}</div>
                            <span className="subtext">need improvement</span>
                        </div>
                    </div>
                    
                    <div className="questions-review">
                        <h3>Question Analysis</h3>
                        
                        <div className="review-list">
                            {activeQuiz.questions.map((question, qIndex) => {
                                const selectedOptionIndex = selectedAnswers[qIndex];
                                const correctOptionIndex = question.options.findIndex(opt => opt.isCorrect);
                                const answeredCorrectly = selectedOptionIndex !== undefined && 
                                                           question.options[selectedOptionIndex].isCorrect;
                                
                                return (
                                    <div key={qIndex} className="review-item">
                                        <div className={`question-header ${answeredCorrectly ? 'correct' : 'incorrect'}`}>
                                            <div className="status-icon">
                                                {answeredCorrectly ? <FaCheck /> : <FaTimes />}
                                            </div>
                                            <p className="question-text">{question.text}</p>
                                            <span className="question-number">Q{qIndex + 1}</span>
                                        </div>
                                        
                                        <div className="answers-content">
                                            <div className="options-list">
                                                {question.options.map((option, oIndex) => (
                                                    <div 
                                                        key={oIndex} 
                                                        className={`option ${selectedOptionIndex === oIndex ? 'selected' : ''} ${option.isCorrect ? 'correct' : ''}`}
                                                    >
                                                        <div className="marker">{String.fromCharCode(65 + oIndex)}</div>
                                                        <div className="text">{option.text}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            {!answeredCorrectly && selectedOptionIndex !== undefined && (
                                                <div className="correct-answer">
                                                    <strong>Correct Answer:</strong> {question.options[correctOptionIndex].text}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    
                    <div className="actions">
                        <button className="btn primary" onClick={() => startQuiz(activeQuiz)}>
                            <FaPlay /> Retry Quiz
                        </button>
                        <button className="btn secondary" onClick={exitQuiz}>
                            Back to Quizzes
                        </button>
                    </div>
                </div>
            );
        }
        
        return (
            <div className="admin-quiz-div active-quiz">
                <div className="quiz-header">
                    <h2>{activeQuiz.name}</h2>
                    <div className="progress-container">
                        <div className="progress-text">
                            Question {currentQuestion + 1} of {activeQuiz.questions.length}
                        </div>
                        <div className="progress-bar">
                            <div 
                                className="progress" 
                                style={{ width: `${((currentQuestion + 1) / activeQuiz.questions.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
                
                <div className="question-container">
                    <h3 className="question-text">{currentQuestionData.text}</h3>
                    
                    <div className="options-container">
                        {currentQuestionData.options.map((option, index) => (
                            <div 
                                key={index}
                                className={`option ${selectedAnswers[currentQuestion] === index ? 'selected' : ''}`}
                                onClick={() => handleAnswerSelect(index)}
                            >
                                <div className="option-marker">{String.fromCharCode(65 + index)}</div>
                                <div className="option-text">{option.text}</div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="navigation-buttons">
                    <button 
                        className="btn secondary" 
                        onClick={goToPrevQuestion}
                        disabled={currentQuestion === 0}
                    >
                        Previous
                    </button>
                    
                    <button 
                        className="btn primary" 
                        onClick={goToNextQuestion}
                        disabled={selectedAnswers[currentQuestion] === undefined}
                    >
                        {currentQuestion === activeQuiz.questions.length - 1 ? 'Finish' : 'Next'}
                    </button>
                </div>
                
                <button className="btn exit" onClick={exitQuiz}>
                    Exit Quiz
                </button>
            </div>
        );
    }
    
    return (
        <div className="admin-quiz-div">
            <h2>Your Quizzes</h2>
            
            <div className="quizzes-list">
                {quizzes.map((quiz) => (
                    <div key={quiz.id} className="quiz-card">
                        <div className="quiz-card-header">
                            <h3>{quiz.name}</h3>
                            <div className="quiz-actions">
                                <button className="action-btn" onClick={() => startQuiz(quiz)}>
                                    <FaPlay />
                                </button>
                                <button 
                                    className="toggle-btn"
                                    onClick={() => toggleQuizExpansion(quiz.id)}
                                >
                                    {expandedQuiz === quiz.id ? <FaChevronUp /> : <FaChevronDown />}
                                </button>
                            </div>
                        </div>
                        
                        <div className="quiz-meta">
                            <div className="meta-item">
                                <FaRegClock />
                                <span>Created: {formatDate(quiz.createdAt)}</span>
                            </div>
                            <div className="meta-item">
                                <span>{quiz.questions.length} Questions</span>
                            </div>
                        </div>
                        
                        {expandedQuiz === quiz.id && (
                            <div className="quiz-details">
                                <h4>Preview Questions:</h4>
                                {quiz.questions.slice(0, 3).map((question, index) => (
                                    <div key={index} className="question-preview">
                                        <div className="question-number">Q{index + 1}:</div>
                                        <div className="question-text">{question.text}</div>
                                    </div>
                                ))}
                                {quiz.questions.length > 3 && (
                                    <div className="more-questions">
                                        +{quiz.questions.length - 3} more questions
                                    </div>
                                )}
                                
                                <div className="quiz-controls">
                                    <button className="btn primary" onClick={() => startQuiz(quiz)}>
                                        Start Quiz
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminQuiz;