import './watch.styles.scss';
import { useParams } from 'react-router-dom';
import { useGlobalDataContext } from '../../contexts/global-data.context';
import ImgLoader from '../../components/img-loader/img-loader.component';
import { useState } from 'react';
import NotesImage from '../../assets/notes.png';
import Notes from '../../components/notes/notes.component';
import Comments from '../../components/comments/comments.component';


const Watch = () => {
    const {code}=useParams();
    const decodedString= decodeURIComponent(code);
    const {videoDataObject}=useGlobalDataContext();
    const [showNotes,setShowNotes]=useState(false);


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
                <Comments  videoCode={decodedString} />
        </div>
     );
}
 
export default Watch;