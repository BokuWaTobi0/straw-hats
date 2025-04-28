import { useState, useEffect } from 'react';
import { useGlobalDataContext } from '../../contexts/global-data.context';
import { useUserAuthContext } from '../../contexts/user-auth-context.context';
import { realtimeDb } from '../../utils/firebase';
import { ref, set,get } from 'firebase/database';
import './mood-check.styles.scss';

const MoodCheck = () => {
    const [showMoodCheck, setShowMoodCheck] = useState(false);
    const { userData } = useGlobalDataContext();
    const { user } = useUserAuthContext();

    const moodOptions = [
        { emoji: '😊', label: 'Happy', message: 'Great to see you in good spirits! Keep that positive energy going!' },
        { emoji: '😌', label: 'Calm', message: 'Peaceful and centered - that\'s a wonderful state to be in!' },
        { emoji: '😔', label: 'Sad', message: 'It\'s okay to feel down sometimes. Remember, this too shall pass. Would you like to talk about it?' },
        { emoji: '😡', label: 'Angry', message: 'Take a deep breath. Would you like to try some calming exercises?' },
        { emoji: '😰', label: 'Anxious', message: 'Let\'s take a moment to breathe. Would you like to try some grounding techniques?' },
        { emoji: '😴', label: 'Tired', message: 'Rest is important. Make sure to take care of yourself!' }
    ];

    const [selectedMood, setSelectedMood] = useState(null);

    useEffect(() => {
        const checkLastMoodCheck = async () => {
            if (!user || !user.uid) return;
            
            try {
                const dbRef = ref(realtimeDb, `userMoodChecks/${user.uid}`);
                const snapshot = await get(dbRef);
                
                if (!snapshot.exists()) {
                    setShowMoodCheck(true);
                    return;
                }

                const lastCheck = snapshot.val().lastCheck;
                const today = new Date().toDateString();
                
                if (lastCheck !== today) {
                    setShowMoodCheck(true);
                }
            } catch (error) {
                console.error('Error checking mood check status:', error);
            }
        };

        if (userData?.accessType === 'user') {
            checkLastMoodCheck();
        }
    }, [user, userData]);

    const handleMoodSelect = async (mood) => {
        setSelectedMood(mood);
        
        try {
            const dbRef = ref(realtimeDb, `userMoodChecks/${user.uid}`);
            await set(dbRef, {
                lastCheck: new Date().toDateString(),
                lastMood: mood.label,
                lastMessage: mood.message
            });
            
            // Close the mood check after 3 seconds
            setTimeout(() => {
                setShowMoodCheck(false);
                setSelectedMood(null);
            }, 3000);
        } catch (error) {
            console.error('Error saving mood check:', error);
        }
    };

    if (!showMoodCheck) return null;

    return (
        <div className="mood-check-overlay">
            <div className="mood-check-container">
                <h2>How are you feeling today?</h2>
                {!selectedMood ? (
                    <div className="mood-options">
                        {moodOptions.map((mood, index) => (
                            <button
                                key={index}
                                className="mood-option"
                                onClick={() => handleMoodSelect(mood)}
                            >
                                <span className="emoji">{mood.emoji}</span>
                                <span className="label">{mood.label}</span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="mood-response">
                        <span className="emoji">{selectedMood.emoji}</span>
                        <p>{selectedMood.message}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MoodCheck;