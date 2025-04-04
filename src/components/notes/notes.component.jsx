import { useEffect, useState } from "react";
import { useGlobalStorageContext } from "../../contexts/global-storage.context";
import { useUserAuthContext } from "../../contexts/user-auth-context.context";
import { useToast } from "../../contexts/toast-context.context";
import { realtimeDb } from "../../utils/firebase";
import { set, ref, get } from "firebase/database";
import './notes.styles.scss';

const Notes = ({decodedString}) => {
    const [notesContent, setNotesContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const {videoNotes, handleSetVideoNotes} = useGlobalStorageContext();
    const {user} = useUserAuthContext();
    const {showToast} = useToast();

    useEffect(() => {
        const loadNotes = async () => {
            if (videoNotes && videoNotes[decodedString]) {
                setNotesContent(videoNotes[decodedString]);
                return;
            }
            if (user) {
                try {
                    const dbRef = ref(realtimeDb, `userNotes/${user.uid}/${decodedString}`);
                    const snapshot = await get(dbRef);
                    
                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        setNotesContent(data.content || '');
                        handleSetVideoNotes(decodedString, data.content || '');
                    }
                } catch (error) {
                    console.error("Error loading notes:", error);
                }
            }
        };
        loadNotes();
    }, [decodedString, user, videoNotes, handleSetVideoNotes]);

    const handleNotesSave = async () => {
        if (!user) {
            showToast("Please sign in to save notes", "error");
            return;
        }
        try {
            setIsSaving(true);
            if (notesContent.trim()) {
                const dbRef = ref(realtimeDb, `userNotes/${user.uid}/${decodedString}`);
                await set(dbRef, {
                    content: notesContent,
                    updatedAt: new Date().toISOString()
                });
            }    
            handleSetVideoNotes(decodedString, notesContent);
            showToast("Notes saved successfully", "success");
        } catch (error) {
            console.error("Error saving notes:", error);
            showToast("Failed to save notes", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return ( 
        <div className='notes-container'>
            <div className='head'>
                <h3>Notes</h3>
                <button 
                    className={`c-btn ${isSaving ? 'saving' : ''}`} 
                    onClick={handleNotesSave}
                    disabled={isSaving}
                >
                    {isSaving ? 'Saving...' : 'Save'}
                </button>
            </div>
            <textarea  
                placeholder='Type your notes here' 
                value={notesContent} 
                maxLength={1000} 
                onChange={(e) => setNotesContent(e.target.value)}
            ></textarea>
            <p className='limit'>{notesContent.length}/1000</p>
        </div>
    );
};
 
export default Notes;