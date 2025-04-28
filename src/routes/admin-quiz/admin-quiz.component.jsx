import { useState, useEffect } from 'react';
import './admin-quiz.styles.scss'
import { realtimeDb } from '../../utils/firebase';
import { ref, onValue } from 'firebase/database';
import { useUserAuthContext } from '../../contexts/user-auth-context.context';
import { useGlobalDataContext } from '../../contexts/global-data.context';
import { useGlobalDbContext } from '../../contexts/global-db.context';
import AsyncLoader from '../../components/async-loader/async-loader.component';
import { FaRegClock, FaChevronDown, FaChevronUp, FaPlay } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AdminQuiz = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedQuiz, setExpandedQuiz] = useState(null);
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const navigate = useNavigate();
    const { user } = useUserAuthContext();
    const { isAdmin, userData } = useGlobalDataContext();
    const { admins, orgs } = useGlobalDbContext();
    
    useEffect(() => {
        const fetchQuizzes = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            
            try {
                let orgId;
                
                // Determine organization ID based on user type
                if (isAdmin) {
                    // For admin users
                    const currentAdmin = admins?.filter(admin => admin.adminEmail === user.email)?.[0];
                    
                    if (!currentAdmin) {
                        console.error('Admin not found for user:', user.email);
                        setError('Failed to authenticate admin user');
                        setLoading(false);
                        return;
                    }
                    
                    const matchingOrg = orgs?.filter(org => org.orgName === currentAdmin.adminOrganization)?.[0];
                    
                    if (!matchingOrg) {
                        console.error('Organization not found for admin:', currentAdmin.adminOrganization);
                        setError('Failed to load organization data');
                        setLoading(false);
                        return;
                    }
                    
                    orgId = matchingOrg.key;
                } else {
                    // For normal users
                    if (!userData || !userData.userOrganization) {
                        console.error('No organization found for user:', user.email);
                        setError('Failed to load user organization data');
                        setLoading(false);
                        return;
                    }
                    
                    orgId = userData.userOrganization;
                }
                
                // console.log('Fetching quizzes for organization:', orgId);
                
                if (!orgId) {
                    setError('No organization ID found');
                    setLoading(false);
                    return;
                }
                
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
    }, [user, isAdmin, admins, orgs, userData]);
    
    const toggleQuizExpansion = (quizId) => {
        setExpandedQuiz(expandedQuiz === quizId ? null : quizId);
    };
    
    const startQuiz = (quiz) => {
        setActiveQuiz(quiz);
        setCurrentQuestion(0);
        setSelectedAnswers({});
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
            // Navigate to results page instead of showing results directly
            const userAnswersArray = {};
            activeQuiz.questions.forEach((question, index) => {
                if (selectedAnswers[index] !== undefined) {
                    userAnswersArray[index] = activeQuiz.questions[index].options[selectedAnswers[index]].text;
                }
            });
            
            navigate('/quiz-results', {
                state: {
                    quizTitle: activeQuiz.name,
                    questions: activeQuiz.questions.map(q => ({
                        question: q.text,
                        options: q.options.map(opt => opt.text),
                        answer: q.options.find(opt => opt.isCorrect).text
                    })),
                    userAnswers: userAnswersArray,
                    passThreshold: 70
                }
            });
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
        
        return (
            <div className="admin-quiz-div active-quiz animate__animated animate__fadeIn">
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