import './upload-video.styles.scss';
import AsyncLoader from '../../components/async-loader/async-loader.component';
import {useUserAuthContext} from '../../contexts/user-auth-context.context';
import { FaYoutube, FaUpload, FaVideo, FaLink, FaClock, FaFolder } from "react-icons/fa6";
import SubmitButton from '../../components/submit-button/submit-button.component';
import { useState } from 'react';
import { options } from '../../utils/helpers';
import { ref,push } from 'firebase/database';
import { realtimeDb } from '../../utils/firebase';
import { useGlobalDataContext } from '../../contexts/global-data.context';
import { useGlobalDbContext } from '../../contexts/global-db.context';
import { useToast } from '../../contexts/toast-context.context';

const statusCodes=['.....','Video added successfully','Error occured try again']
const shareLinkHead = 'https://youtu.be/';
const embedLinkHead='https://www.youtube.com/embed/'; 

const UploadVideo = () => {

    const {user} = useUserAuthContext();
    const [catOption,setCatOption]=useState(options[0]);
    const [statusCode,setStatusCode]=useState(0);
    const [isChecked,setIsChecked]=useState(false);
    const [ytVideoCode,setYtVideoCode]=useState('');
    const [inputData,setInputData]=useState({videoName:'',videoDuration:'',videoLink:''});
    const [isLoading,setIsLoading]=useState(false);
    const {isAdmin}=useGlobalDataContext();
    const {admins,orgs}=useGlobalDbContext();
    const {showToast}=useToast();

    if(!isAdmin){
        return <AsyncLoader text={"Nothing Here"} type={"empty"} ls={"150px"} /> ;
    }
    
    const handleChange=(e)=>{
        const {name,value}=e.target;
        setInputData({...inputData,[name]:value});
    }  

    const statusSetter=(code)=>{
        setStatusCode(code);
        setTimeout(()=>setStatusCode(0),2000);
    }

    const handleSubmit=async(e)=>{
        e.preventDefault();
        const trimmedVideoName = inputData.videoName.trim();
        const trimmedVideoLink = inputData.videoLink.trim();
        const trimmedCourseDuration = inputData.videoDuration.trim();
        if(user && trimmedVideoName && trimmedCourseDuration && trimmedVideoLink && catOption){
            setIsLoading(true);
            const currentAdmin = admins.filter(admin => admin.adminEmail === user.email)[0];
               let orgId = orgs.filter(org => org.orgName === currentAdmin.adminOrganization)[0].key
            const dbRef = ref(realtimeDb,`catalogs/${orgId}/${catOption}`);
            const slicerLength = trimmedVideoLink.startsWith(shareLinkHead) ? 17 : trimmedVideoLink.startsWith(embedLinkHead) ? 30 : 0
            try{
                await push(dbRef,{
                    videoName:trimmedVideoName,
                    videoDuration:trimmedCourseDuration,
                    videoLink:trimmedVideoLink.replace(/"/g,'').slice(slicerLength)
                })
                statusSetter(1)
                showToast('Video added successfully');
            }catch(e){
                console.error(e);
                statusSetter(2)
            }finally{
                resetFields();
                setIsLoading(false);
            }
        }
    }
    const handleYTVideoCheck=()=>{
        const trimmedEmbedLink = inputData.videoLink.trim();
        if(trimmedEmbedLink){
            if(trimmedEmbedLink.startsWith(shareLinkHead)){
                videoCodeSetter(trimmedEmbedLink,shareLinkHead);
            }
            if(trimmedEmbedLink.startsWith(embedLinkHead)){
                videoCodeSetter(trimmedEmbedLink,embedLinkHead);
            }
        }
    }
    const videoCodeSetter=(link,head)=>{
        setYtVideoCode(link.slice(head.length,head.length+11))
        setIsChecked(true);
    }
    const resetFields=()=>{
        setCatOption(options[0]);
        setIsChecked(false);
        setYtVideoCode('');
        setInputData({videoName:'',videoDuration:'',videoLink:''});
    }

    return ( 
        <div className='upload-video-div'>
            <div className="upload-header">
                <FaUpload className="upload-icon" />
                <h1>Upload Video</h1>
            </div>
            
            <form className='upload-form' onSubmit={handleSubmit}>
                <div className="form-section">
                    <div className="input-group">
                        <label htmlFor="videoName">
                            <FaVideo className="input-icon" />
                            <span>Video Name</span>
                        </label>
                        <input 
                            id="videoName"
                            className='form-input' 
                            name='videoName' 
                            required 
                            minLength="4" 
                            placeholder='Enter video title' 
                            value={inputData.videoName} 
                            onChange={handleChange} 
                            maxLength="200" 
                        />
                    </div>
                    
                    <div className="input-group">
                        <label htmlFor="videoDuration">
                            <FaClock className="input-icon" />
                            <span>Duration</span>
                        </label>
                        <input 
                            id="videoDuration"
                            className='form-input' 
                            name='videoDuration' 
                            required 
                            minLength="2" 
                            placeholder='Format: h:m:s (e.g. 1:30:45)' 
                            value={inputData.videoDuration} 
                            onChange={handleChange} 
                            maxLength="20" 
                        />
                    </div>
                </div>
                
                <div className="form-section">
                    <div className="input-group full-width">
                        <label htmlFor="videoLink">
                            <FaLink className="input-icon" />
                            <span>YouTube Link</span>
                        </label>
                        <input 
                            id="videoLink"
                            className='form-input' 
                            name='videoLink' 
                            required 
                            placeholder='Paste YouTube video link (https://youtu.be/... or https://www.youtube.com/embed/...)' 
                            value={inputData.videoLink} 
                            onChange={handleChange} 
                            maxLength="250" 
                        />
                    </div>
                </div>
                
                <div className='preview-section'>
                    <div className='preview-container'>
                        {!isChecked ? (
                            <div className="empty-preview">
                                <FaYoutube className='preview-icon' />
                                <p>Video preview will appear here</p>
                            </div>
                        ) : (
                            <div className="video-preview">
                                <img 
                                    src={`https://img.youtube.com/vi/${ytVideoCode}/hqdefault.jpg`} 
                                    alt="Video thumbnail" 
                                />
                                <div className="preview-overlay">
                                    <FaYoutube className="play-icon" />
                                </div>
                            </div>
                        )}
                    </div>
                    <button 
                        type='button' 
                        onClick={handleYTVideoCheck} 
                        className='check-button'
                        disabled={!inputData.videoLink}
                    >
                        Preview Video
                    </button>
                </div>
                
                <div className='category-section'>
                    <label htmlFor="category">
                        <FaFolder className="input-icon" />
                        <span>Category</span>
                    </label>
                    <select 
                        id="category"
                        name='categories' 
                        onChange={(e) => setCatOption(e.target.value)}
                        value={catOption}
                    >
                        {options.map((opt, index) => (
                            <option 
                                key={`select-option-key-${index}`} 
                                value={opt}
                            >
                                {opt[0].toUpperCase() + opt.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="submit-section">
                    <SubmitButton text={"Upload Video"} state={isLoading} />
                    {statusCode > 0 && (
                        <div className={`status-message ${statusCode === 1 ? 'success' : 'error'}`}>
                            {statusCodes[statusCode]}
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
}
 
export default UploadVideo;