import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheck, FaTimes, FaDownload, FaPrint, FaTrophy, FaMedal, FaBookOpen } from 'react-icons/fa';
import './quiz-result.styles.scss';

const QuizResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { quizTitle, questions, userAnswers, passThreshold = 70 } = location.state || {};

  // Handle case where page is accessed directly without quiz data
  if (!quizTitle || !questions || !userAnswers) {
    return (
      <div className="quiz-results-page no-data">
        <div className="no-data-container">
          <h2>No Quiz Results Found</h2>
          <p>Please take a quiz first to see your results.</p>
          <button className="nav-button" onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Calculate quiz statistics
  const totalQuestions = questions.length;
  const correctAnswers = questions.reduce((count, question, index) => {
    return userAnswers[index] === question.answer ? count + 1 : count;
  }, 0);
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  const isPassed = percentage >= passThreshold;

  // Get result message based on score
  const getResultMessage = () => {
    if (percentage >= 90) return "Excellent! You've mastered this topic.";
    if (percentage >= 80) return "Great job! You have a strong understanding of the material.";
    if (percentage >= passThreshold) return "Good work! You've passed the quiz.";
    if (percentage >= passThreshold - 10) return "Almost there! Just a bit more studying needed.";
    if (percentage >= 50) return "You're making progress, but need more review.";
    return "Keep learning! You haven't reached the passing score yet.";
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle download results
  const handleDownload = () => {
    const resultsText = `
Quiz Results for: ${quizTitle}
Date: ${new Date().toLocaleDateString()}
Score: ${percentage}% (${correctAnswers}/${totalQuestions} correct)
Result: ${isPassed ? 'PASSED' : 'NOT PASSED'}

Question Details:
${questions.map((q, i) => {
  const isCorrect = userAnswers[i] === q.answer;
  return `
Q${i+1}: ${q.question}
Your Answer: ${userAnswers[i] || 'Not answered'}
Correct Answer: ${q.answer}
Result: ${isCorrect ? 'Correct' : 'Incorrect'}
`;
}).join('\n')}
    `;

    const blob = new Blob([resultsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${quizTitle.replace(/\s+/g, '-').toLowerCase()}-results.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle try again
  const handleTryAgain = () => {
    navigate(-1);
  };

  return (
    <div className="quiz-results-page">
      <div className="results-container">
        <header className="results-header">
          <h1>Quiz Results</h1>
          <div className="quiz-info">
            <h2>{quizTitle}</h2>
            <span className="date-info">Completed on: {new Date().toLocaleDateString()}</span>
          </div>
        </header>

        <div className="results-tabs">
          <div className="tab-buttons">
            <button className="tab-button active">Summary</button>
            <button className="tab-button">Detailed Review</button>
          </div>

          <div className="tab-content">
            <div className="summary-tab">
              <div className="score-overview">
                <div className={`score-card ${isPassed ? 'pass' : 'fail'}`}>
                  <div className="score-icon">
                    {isPassed ? <FaTrophy /> : <FaMedal />}
                  </div>
                  <div className="score-value">{percentage}%</div>
                  <div className="score-label">{isPassed ? 'PASSED' : 'NOT PASSED'}</div>
                </div>

                <div className="score-stats">
                  <div className="stats-item">
                    <div className="stats-value">{correctAnswers}</div>
                    <div className="stats-label">Correct</div>
                    <div className="progress-bar">
                      <div className="progress-fill correct" style={{ width: `${(correctAnswers / totalQuestions) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="stats-item">
                    <div className="stats-value">{totalQuestions - correctAnswers}</div>
                    <div className="stats-label">Incorrect</div>
                    <div className="progress-bar">
                      <div className="progress-fill incorrect" style={{ width: `${((totalQuestions - correctAnswers) / totalQuestions) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="stats-item">
                    <div className="stats-value">{totalQuestions}</div>
                    <div className="stats-label">Total Questions</div>
                  </div>
                </div>
              </div>

              <div className="performance-message">
                <h3>{isPassed ? 'Congratulations!' : 'Keep Learning'}</h3>
                <p>{getResultMessage()}</p>
              </div>

              <div className="study-tips">
                <h3><FaBookOpen /> Study Tips</h3>
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
        </div>

        <div className="question-filters">
          <button className="filter-button active">All Questions</button>
          <button className="filter-button">Correct</button>
          <button className="filter-button">Incorrect</button>
        </div>

        <div className="questions-grid">
          {questions.map((question, index) => {
            const isCorrect = userAnswers[index] === question.answer;
            
            return (
              <div key={index} className={`question-card ${isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="question-header">
                  <div className="question-number">Question {index + 1}</div>
                  <div className={`question-status ${isCorrect ? 'correct' : 'incorrect'}`}>
                    {isCorrect ? <FaCheck /> : <FaTimes />}
                  </div>
                </div>
                
                <div className="question-content">
                  <div className="question-text">{question.question}</div>
                  
                  <div className="question-options">
                    {question.options.map((option, optionIndex) => {
                      const isUserSelected = userAnswers[index] === option;
                      const isCorrectOption = question.answer === option;
                      
                      return (
                        <div 
                          key={optionIndex} 
                          className={`option ${isUserSelected ? 'selected' : ''} ${isCorrectOption ? 'correct' : ''}`}
                        >
                          <div className="option-letter">{String.fromCharCode(65 + optionIndex)}</div>
                          <div className="option-text">{option}</div>
                          {isUserSelected && isUserSelected !== question.answer && <FaTimes className="option-icon incorrect" />}
                          {isCorrectOption && <FaCheck className="option-icon correct" />}
                        </div>
                      );
                    })}
                  </div>
                  
                  {!isCorrect && (
                    <div className="correct-answer">
                      <span>Correct answer: </span> {question.answer}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="results-actions">
          <button className="action-button" onClick={handleTryAgain}>
            <FaArrowLeft /> Try Again
          </button>
          <div className="utility-buttons">
            <button className="utility-button" onClick={handleDownload}>
              <FaDownload /> Download
            </button>
            <button className="utility-button" onClick={handlePrint}>
              <FaPrint /> Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResultsPage;