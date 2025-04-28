import { useState, useEffect, useCallback } from 'react';
import './watch-remainders.styles.scss';

const WatchRemainders = ({ watchTime, isCompleted }) => {
    const [showReminder, setShowReminder] = useState(false);
    const [reminderType, setReminderType] = useState('');
    const [currentMessage, setCurrentMessage] = useState('');

    const startTips = [
        "Ready to learn! 📚 Take notes to help you remember key points.",
        "Let's begin! 🎯 Focus on understanding the main concepts.",
        "Starting your learning journey! 🌟 Don't hesitate to pause and rewind if needed.",
        "Time to learn something new! 💡 Try to connect this with what you already know.",
        "Let's dive in! 🎓 Remember to take breaks if you need them."
    ];

    const breakReminders = [
        "Time for a quick break! 💧 Stay hydrated and drink some water.",
        "Take a moment to stretch! 🧘‍♂️ Your body will thank you.",
        "Remember to blink! 👀 Give your eyes a short rest.",
        "Stand up and move around! 🚶‍♂️ A little movement goes a long way.",
        "Take deep breaths! 🌬️ Refresh your mind and body."
    ];

    const completionMessages = [
        "Great job completing the video! 🎉 Keep up the excellent work!",
        "You've reached the end! 🌟 Your dedication to learning is inspiring!",
        "Video completed! 🎓 Every step forward is progress!",
        "Well done! 🏆 Your commitment to learning is admirable!",
        "Congratulations! 🎯 You're one step closer to your goals!"
    ];

    const displayReminder = useCallback((type) => {
        setReminderType(type);
        setShowReminder(true);
        
        // Set the appropriate message based on type
        switch(type) {
            case 'start':
                setCurrentMessage(startTips[Math.floor(Math.random() * startTips.length)]);
                break;
            case 'break':
                setCurrentMessage(breakReminders[Math.floor(Math.random() * breakReminders.length)]);
                break;
            case 'completion':
                setCurrentMessage(completionMessages[Math.floor(Math.random() * completionMessages.length)]);
                break;
            default:
                break;
        }
    }, []);

    const handleClose = () => {
        setShowReminder(false);
        setReminderType('');
        setCurrentMessage('');
    };

    useEffect(() => {
        if (isCompleted) {
            displayReminder('completion');
        } else if (watchTime >= 1800) { // 30 minutes = 1800 seconds
            displayReminder('break');
        } else if (watchTime === 0) { // Video just started
            displayReminder('start');
        }
    }, [watchTime, isCompleted, displayReminder]);

    if (!showReminder) return null;

    return (
        <div className={`watch-remainder ${reminderType}`}>
            <div className="remainder-content">
                <span className="icon">
                    {reminderType === 'start' ? '🎬' : 
                     reminderType === 'break' ? '⏰' : '🎉'}
                </span>
                <p>{currentMessage}</p>
                <button className="close-button" onClick={handleClose}>×</button>
            </div>
        </div>
    );
};

export default WatchRemainders;