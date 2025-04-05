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
                // Get organization ID
                const currentAdmin = admins.filter(admin => admin.adminEmail === user.email)[0];
                const orgId = orgs.filter(org => org.orgName === currentAdmin.adminOrganization)[0].key;
                
                // Fetch quizzes for this organization
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
    
    if (!isAdmin) {
        return <AsyncLoader type="empty" ls="60px" text="You don't have permission to view this page" />;
    }
    
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
            const passThreshold = 70;
            const isPassed = score.percentage >= passThreshold;
            
            return (
                <div className="admin-quiz-div quiz-result-container">
                    <div className="results-header">
                        <h2>Quiz Results</h2>
                        <h3 className="quiz-title">{activeQuiz.name}</h3>
                    </div>
                    
                    <div className="score-dashboard">
                        <div className="score-card">
                            <div className={`score-circle ${isPassed ? 'pass' : 'fail'}`}>
                                <div className="score-percentage">{score.percentage}%</div>
                                <svg className="circle-progress" viewBox="0 0 36 36">
                                    <path
                                        className="circle-bg"
                                        d="M18 2.0845
                                          a 15.9155 15.9155 0 0 1 0 31.831
                                          a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <path
                                        className="circle-fill"
                                        strokeDasharray={`${score.percentage}, 100`}
                                        d="M18 2.0845
                                          a 15.9155 15.9155 0 0 1 0 31.831
                                          a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                </svg>
                            </div>
                            
                            <div className="score-details">
                                <div className="score-stat">
                                    <span className="stat-label">Correct Answers</span>
                                    <span className="stat-value">{score.correct}/{score.total}</span>
                                </div>
                                <div className="score-stat">
                                    <span className="stat-label">Pass Threshold</span>
                                    <span className="stat-value">{passThreshold}%</span>
                                </div>
                                <div className="score-stat">
                                    <span className="stat-label">Result</span>
                                    <span className={`stat-value result ${isPassed ? 'pass' : 'fail'}`}>
                                        {isPassed ? 'PASSED' : 'FAILED'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="performance-feedback">
                            <div className={`feedback-message ${isPassed ? 'success' : 'warning'}`}>
                                <div className="message-icon">
                                    {isPassed ? <FaCheck /> : <FaTimes />}
                                </div>
                                <div className="message-content">
                                    <h4>{isPassed ? 'Congratulations!' : 'Keep Learning'}</h4>
                                    <p>
                                        {isPassed 
                                            ? 'You have successfully completed this quiz with a good understanding of the topic.' 
                                            : 'You haven\'t reached the passing score yet. Review the questions you missed and try again.'}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="performance-tips">
                                <h4>Performance Tips</h4>
                                <ul>
                                    {isPassed ? (
                                        <>
                                            <li>Review any questions you missed to fill knowledge gaps</li>
                                            <li>Consider taking more advanced quizzes on this topic</li>
                                            <li>Share your knowledge with others to reinforce learning</li>
                                        </>
                                    ) : (
                                        <>
                                            <li>Focus on topics where you missed questions</li>
                                            <li>Take notes on the correct answers for missed questions</li>
                                            <li>Try the quiz again after reviewing the material</li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div className="questions-review">
                        <h3>Question Analysis</h3>
                        
                        <div className="review-summary">
                            <div className="summary-item">
                                <div className="summary-count correct">{score.correct}</div>
                                <div className="summary-label">Correct</div>
                            </div>
                            <div className="summary-item">
                                <div className="summary-count incorrect">{score.total - score.correct}</div>
                                <div className="summary-label">Incorrect</div>
                            </div>
                            <div className="summary-item">
                                <div className="summary-count total">{score.total}</div>
                                <div className="summary-label">Total</div>
                            </div>
                        </div>
                        
                        <div className="review-questions">
                            {activeQuiz.questions.map((question, qIndex) => {
                                const selectedOptionIndex = selectedAnswers[qIndex];
                                const selectedOption = selectedOptionIndex !== undefined 
                                    ? question.options[selectedOptionIndex] 
                                    : null;
                                const correctOptionIndex = question.options.findIndex(opt => opt.isCorrect);
                                const isCorrect = selectedOption && selectedOption.isCorrect;
                                
                                return (
                                    <div key={qIndex} className={`review-question ${isCorrect ? 'correct' : 'incorrect'}`}>
                                        <div className="question-status">
                                            <div className={`status-indicator ${isCorrect ? 'correct' : 'incorrect'}`}>
                                                {isCorrect ? <FaCheck /> : <FaTimes />}
                                            </div>
                                            <div className="question-number">Question {qIndex + 1}</div>
                                        </div>
                                        
                                        <div className="question-content">
                                            <h4 className="question-text">{question.text}</h4>
                                            
                                            <div className="options-review">
                                                {question.options.map((option, oIndex) => (
                                                    <div 
                                                        key={oIndex} 
                                                        className={`option-item ${
                                                            oIndex === selectedOptionIndex ? 'selected' : ''
                                                        } ${option.isCorrect ? 'correct' : ''} ${
                                                            oIndex === selectedOptionIndex && !isCorrect ? 'incorrect' : ''
                                                        }`}
                                                    >
                                                        <div className="option-marker">{String.fromCharCode(65 + oIndex)}</div>
                                                        <div className="option-text">{option.text}</div>
                                                        {oIndex === correctOptionIndex && !isCorrect && (
                                                            <div className="correct-mark">
                                                                <FaCheck />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            {!isCorrect && (
                                                <div className="answer-explanation">
                                                    <p>
                                                        <strong>Correct Answer:</strong> {question.options[correctOptionIndex].text}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    
                    <div className="result-actions">
                        <button className="btn primary" onClick={() => startQuiz(activeQuiz)}>
                            <FaPlay className="btn-icon" /> Retry Quiz
                        </button>
                        <button className="btn secondary" onClick={exitQuiz}>
                            Back to All Quizzes
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