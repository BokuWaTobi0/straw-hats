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
import WatchRemainders from '../../components/watch-remainders/watch-remainders.component';

const Watch = () => {
    const {code} = useParams();
    const decodedString = decodeURIComponent(code);
    const {videoDataObject} = useGlobalDataContext();
    const [showNotes, setShowNotes] = useState(false);
    const { user } = useUserAuthContext();
    const watchTimerRef = useRef(null);
    const lastHeartbeatRef = useRef(Date.now());
    const [isActive, setIsActive] = useState(true);
    const [totalWatchTime, setTotalWatchTime] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const iframeRef = useRef(null);
    
    // Handle iframe messages
    useEffect(() => {
        const handleMessage = (event) => {
            try {
                // Check if the message is from YouTube
                if (event.origin === 'https://www.youtube.com' || event.origin === 'https://youtube.com') {
                    const data = JSON.parse(event.data);
                    
                    // Check for video end event (state 0 means ended)
                    if (data.event === 'onStateChange' && data.info === 0) {
                        console.log('Video ended detected');
                        handleVideoCompletion();
                    }
                }
            } catch (error) {
                console.error('Error handling YouTube message:', error);
            }
        };

        // Add event listener for iframe load
        const handleIframeLoad = () => {
            const iframe = document.querySelector('iframe');
            if (iframe) {
                // Send message to iframe to enable API
                iframe.contentWindow.postMessage('{"event":"listening"}', '*');
            }
        };

        window.addEventListener('message', handleMessage);
        document.addEventListener('iframeLoad', handleIframeLoad);

        return () => {
            window.removeEventListener('message', handleMessage);
            document.removeEventListener('iframeLoad', handleIframeLoad);
        };
    }, []);

    const handleVideoCompletion = async () => {
        if (!user || isCompleted) return;

        console.log('Handling video completion');
        setIsCompleted(true);
        const completionRef = ref(realtimeDb, `userProgress/${user.uid}/${decodedString}`);
        
        try {
            await onValue(completionRef, (snapshot) => {
                if (snapshot.exists()) {
                    set(completionRef, {
                        ...snapshot.val(),
                        completed: true,
                        completedAt: serverTimestamp()
                    });
                }
            }, { onlyOnce: true });
        } catch (error) {
            console.error('Error marking video as completed:', error);
        }
    };
    
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
                            const newWatchTime = snapshot.val() + 5; // Increment by 5 seconds
                            set(watchTimeRef, newWatchTime);
                            setTotalWatchTime(newWatchTime);
                            
                            // Check if video is completed (70% of estimated length)
                            if (newWatchTime >= 420 && !isCompleted) { // 70% of 600s = 420s
                                handleVideoCompletion();
                            }
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
        };
    }, [user, decodedString, videoDataObject, isCompleted]);

    return ( 
        <div className='watch-div cc-div'>
            <div className='main'>
                <ImgLoader 
                    type='iframe' 
                    iframeId={decodedString} 
                    ls={"150px"} 
                    wd={showNotes ? '70%' : '100%'} 
                    ref={iframeRef}
                    onLoad={() => document.dispatchEvent(new Event('iframeLoad'))}
                />
                {showNotes && <Notes decodedString={decodedString} />}
            </div>
            <div className='time'>
                <p>{videoDataObject?.videoName}</p>
                <img src={NotesImage} width={'23px'} onClick={()=>setShowNotes(!showNotes)} />
            </div>
            <Comments videoCode={decodedString} />
            <WatchRemainders watchTime={totalWatchTime} isCompleted={isCompleted} />
        </div>
     );
}
 
export default Watch;