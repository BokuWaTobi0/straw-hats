import './upload-video.styles.scss';
import AsyncLoader from '../../components/async-loader/async-loader.component';
import {useUserAuthContext} from '../../contexts/user-auth-context.context';
import { FaYoutube } from "react-icons/fa6";
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
            <h1>Upload videos</h1>
            <form className='main' onSubmit={handleSubmit}>
                <div className='n-and-d'>
                <input className='c-input' name='videoName' required minLength={"4"} placeholder='Video name' value={inputData.videoName} onChange={handleChange} maxLength={"200"} />
                <input className='c-input' name='videoDuration' required minLength={"2"} placeholder='Video duration (h:m:s)' value={inputData.videoDuration} onChange={handleChange} maxLength={"20"} />
                </div>
                <input className='c-input link' name='videoLink' required placeholder='Video link (youtube)' value={inputData.videoLink} onChange={handleChange} maxLength={"250"} />
                <div className='yt-frame'>
                    {!isChecked ? <FaYoutube className='icon' /> : <img src={`https://img.youtube.com/vi/${ytVideoCode}/hqdefault.jpg`}  />}
                    <button type='button' onClick={handleYTVideoCheck} className='c-btn'>Check now</button>
                </div>
                <div className='cat'>
                <h4>Category</h4>
                <select name='categories' onChange={(e)=>setCatOption(e.target.value)}>
                    {options.map((opt,index)=>{
                        return <option key={`select-option-key-${index}`} value={opt}>{opt[0].toUpperCase()+opt.slice(1,opt.length)}</option>
                    })}
                </select>
                </div>
                <SubmitButton text={"Submit"} state={isLoading} />
                <span>{statusCodes[statusCode]}</span>
            </form>
        </div>
     );
}
 
export default UploadVideo;