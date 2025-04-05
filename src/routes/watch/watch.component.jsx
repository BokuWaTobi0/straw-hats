import './watch.styles.scss';
import { useParams } from 'react-router-dom';
import { useGlobalDataContext } from '../../contexts/global-data.context';
import ImgLoader from '../../components/img-loader/img-loader.component';
import { useState, useEffect, useRef } from 'react';
import NotesImage from '../../assets/notes.png';
import Notes from '../../components/notes/notes.component';
import Comments from '../../components/comments/comments.component';
import { useUserAuthContext } from '../../contexts/user-auth-context.context';
import { realtimeDb } from '../../utils/firebase';
import { ref, set, onValue, increment, serverTimestamp } from 'firebase/database';


const Watch = () => {
    const {code} = useParams();
    const decodedString = decodeURIComponent(code);
    const {videoDataObject} = useGlobalDataContext();
    const [showNotes, setShowNotes] = useState(false);
    const { user } = useUserAuthContext();
    const watchTimerRef = useRef(null);
    const lastHeartbeatRef = useRef(Date.now());
    const [isActive, setIsActive] = useState(true);
    
    // Track user engagement with video
    useEffect(() => {
        if (!user) return;
        
        // Record video start
        const userProgressRef = ref(realtimeDb, `userProgress/${user.uid}/${decodedString}`);
        
        // Check if this video has been watched before
        onValue(userProgressRef, (snapshot) => {
            if (!snapshot.exists()) {
                // First time watching this video
                set(userProgressRef, {
                    videoId: decodedString,
                    videoName: videoDataObject?.videoName || 'Unknown Video',
                    firstWatched: serverTimestamp(),
                    lastWatched: serverTimestamp(),
                    totalWatchTime: 0,
                    watchSessions: 1,
                    completed: false
                });
            } else {
                // Update last watched and increment sessions
                set(userProgressRef, {
                    ...snapshot.val(),
                    lastWatched: serverTimestamp(),
                    watchSessions: increment(1)
                });
            }
        }, { onlyOnce: true });
        
        // Set up timer to track watch time
        watchTimerRef.current = setInterval(() => {
            if (isActive && document.visibilityState === 'visible') {
                const now = Date.now();
                const timeSinceLastHeartbeat = now - lastHeartbeatRef.current;
                lastHeartbeatRef.current = now;
                
                // Only count if reasonable time (prevent counting if tab was inactive)
                if (timeSinceLastHeartbeat < 10000) { // 10 seconds max gap
                    const watchTimeRef = ref(realtimeDb, `userProgress/${user.uid}/${decodedString}/totalWatchTime`);
                    onValue(watchTimeRef, (snapshot) => {
                        if (snapshot.exists()) {
                            set(watchTimeRef, increment(5)); // Increment by 5 seconds
                        }
                    }, { onlyOnce: true });
                }
            }
        }, 5000); // Check every 5 seconds
        
        // Track if user is active on the page
        const handleVisibilityChange = () => {
            setIsActive(document.visibilityState === 'visible');
        };
        
        const handleUserActivity = () => {
            lastHeartbeatRef.current = Date.now();
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('mousemove', handleUserActivity);
        document.addEventListener('keydown', handleUserActivity);
        
        return () => {
            clearInterval(watchTimerRef.current);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('mousemove', handleUserActivity);
            document.removeEventListener('keydown', handleUserActivity);
            
            // Mark video as completed if watched for at least 70% of estimated length
            // Assuming average video length of 10 minutes (600 seconds)
            if (user) {
                const completionRef = ref(realtimeDb, `userProgress/${user.uid}/${decodedString}`);
                onValue(completionRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        if (data.totalWatchTime >= 420 && !data.completed) { // 70% of 600s = 420s
                            set(completionRef, {
                                ...data,
                                completed: true,
                                completedAt: serverTimestamp()
                            });
                        }
                    }
                }, { onlyOnce: true });
            }
        };
    }, [user, decodedString, videoDataObject]);

    return ( 
        <div className='watch-div cc-div'>
            <div className='main'>
                <ImgLoader type='iframe' iframeId={decodedString} ls={"150px"} wd={showNotes ? '70%' : '100%'}  />
                {showNotes && <Notes decodedString={decodedString} />}
            </div>
                <div className='time'>
                <p>{videoDataObject?.videoName}</p>
                <img src={NotesImage} width={'23px'} onClick={()=>setShowNotes(!showNotes)} />
                </div>
                <Comments videoCode={decodedString} />
        </div>
     );
}
 
export default Watch;