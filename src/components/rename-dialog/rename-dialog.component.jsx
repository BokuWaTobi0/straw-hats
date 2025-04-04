import './rename-dialog.styles.scss';
import { useState } from 'react';
import { realtimeDb } from '../../utils/firebase';
import { ref, update } from 'firebase/database';
import { useUserAuthContext } from '../../contexts/user-auth-context.context';
import { useGlobalDataContext } from '../../contexts/global-data.context';
import { useGlobalDbContext } from '../../contexts/global-db.context';
import { useToast } from '../../contexts/toast-context.context';
import { FaPen, FaTimes, FaClock } from 'react-icons/fa';

const RenameDialog = ({videoName, videoId, videoDuration, catalogName, setIsRenameDialogOpen}) => {
    const [newVideoName, setNewVideoName] = useState(videoName);
    const [newVideoDuration, setNewVideoDuration] = useState(videoDuration);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useUserAuthContext();
    const { isAdmin } = useGlobalDataContext();
    const { admins, orgs } = useGlobalDbContext();
    const { showToast } = useToast();
    
    const handleClose = () => {
        setIsRenameDialogOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isAdmin || !user) {
            showToast('You do not have permission to rename videos');
            return;
        }

        if (!newVideoName.trim() || !newVideoDuration.trim()) {
            showToast('Video name and duration cannot be empty');
            return;
        }

        try {
            setIsSubmitting(true);
            
            const currentAdmin = admins.filter(admin => admin.adminEmail === user.email)[0];
            const orgId = orgs.filter(org => org.orgName === currentAdmin.adminOrganization)[0].key;
            
            const videoRef = ref(realtimeDb, `catalogs/${orgId}/${catalogName}/${videoId}`);
            await update(videoRef, {
                videoName: newVideoName.trim(),
                videoDuration: newVideoDuration.trim()
            });
            
            showToast('Video renamed successfully');
            setIsRenameDialogOpen(false);
        } catch (error) {
            console.error('Error renaming video:', error);
            showToast('Failed to rename video');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className='rename-dialog-overlay'>
            <div className='rename-dialog-container'>
                <div className='rename-dialog-header'>
                    <h2>Rename Video</h2>
                    <button className='close-button' onClick={handleClose}>
                        <FaTimes />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className='rename-form'>
                    <div className='form-group'>
                        <label htmlFor='videoName'>
                            <FaPen className='input-icon' />
                            <span>Video Name</span>
                        </label>
                        <input
                            id='videoName'
                            type='text'
                            value={newVideoName}
                            onChange={(e) => setNewVideoName(e.target.value)}
                            placeholder='Enter new video name'
                            required
                            maxLength={200}
                        />
                    </div>
                    
                    <div className='form-group'>
                        <label htmlFor='videoDuration'>
                            <FaClock className='input-icon' />
                            <span>Video Duration</span>
                        </label>
                        <input
                            id='videoDuration'
                            type='text'
                            value={newVideoDuration}
                            onChange={(e) => setNewVideoDuration(e.target.value)}
                            placeholder='Format: h:m:s (e.g. 1:30:45)'
                            required
                            maxLength={20}
                        />
                    </div>
                    
                    <div className='button-group'>
                        <button 
                            type='button' 
                            className='cancel-button'
                            onClick={handleClose}
                        >
                            Cancel
                        </button>
                        <button 
                            type='submit' 
                            className='submit-button'
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Updating...' : 'Update Video'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RenameDialog;