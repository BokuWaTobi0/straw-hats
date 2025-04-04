import './watch.styles.scss';
import { useParams } from 'react-router-dom';
import { useGlobalDataContext } from '../../contexts/global-data.context';
import ImgLoader from '../../components/img-loader/img-loader.component';
import { useState } from 'react';
import Avatar from 'boring-avatars';
import { FaNoteSticky } from "react-icons/fa6";
import { FaStickyNote } from 'react-icons/fa';

const data=[
    {
    commentedBy:'user23',
    timestamp:'10 min ago',
    text:'i coomented on this',
    replies:[{
        commentedBy:'user23',
    timestamp:'10 min ago',
    text:'i coomented on this',
    },{
        commentedBy:'user23',
    timestamp:'10 min ago',
    text:'i coomented on this',
    }]
},
    {
    commentedBy:'user23',
    timestamp:'10 min ago',
    text:'i coomented on this',
    replies:[{
        commentedBy:'user23',
    timestamp:'10 min ago',
    text:'i coomented on this',
    },{
        commentedBy:'user23',
    timestamp:'10 min ago',
    text:'i coomented on this',
    }]
},
    {
    commentedBy:'user23',
    timestamp:'10 min ago',
    text:'i coomented on this',
    replies:[{
        commentedBy:'user23',
    timestamp:'10 min ago',
    text:'i coomented on this',
    },{
        commentedBy:'user23',
    timestamp:'10 min ago',
    text:'i coomented on this',
    }]
},
]

const Watch = () => {
    const {code}=useParams();
    const decodedString= decodeURIComponent(code);
    const {videoDataObject}=useGlobalDataContext();
    const [notesContent,setNotesContent]=useState('');

    return ( 
        <div className='watch-div cc-div'>
            <div className='main'>
                <ImgLoader type='iframe' iframeId={decodedString} ls={"150px"} />
                <div className='notes-container'>
                <div className='head'>
                <h3>Notes</h3>
                <button className='c-btn'>Save</button>
                </div>
                    <textarea  placeholder='type your notes here' value={notesContent} maxLength={1000} onChange={(e)=>setNotesContent(e.target.value)} >
                    </textarea>
                        <p className='limit'>{notesContent.length}/1000</p>
                </div>
            </div>
                <div className='time'>
                <p>{videoDataObject?.videoName}</p>
                <FaStickyNote/>
                </div>
                <div className='comments-container'>
                    <div className='head'>{data.length} Comments</div>
                    <div className='add-comment'>
                        <Avatar width={'40px'} />
                        <input className='c-input' placeholder='Add a comment' />
                        <button className='c-btn'>Post</button>
                    </div>
                    <div className='main'>
                        {data.map((c,cindex)=>{
                            return <div key={`comments-index-${cindex}`} className='comment'>
                            <div className='msg'>
                            <Avatar width={'25px'} name={`cindex-name-${cindex}`} className='avatar' />
                            <div className='content'>
                                <span>{c.commentedBy} <span>{c.timestamp}</span> </span>
                                <p>{c.text}</p>
                            </div>
                            </div>
                            <div className='replies'>
                                <p>{c.replies.length} replies</p>
                                <div className='replies-container'>
                                    {c.replies.map((rep,repIndex)=>{
                                        return <div key={`reply-for-comment-${cindex}-${repIndex}`} className='til'>
                                        <Avatar width={'25px'} name={`repindex-name-${repIndex}`} className='avatar' />
                                        <div className='content'>
                                            <span>{rep.commentedBy} <span>{rep.timestamp}</span> </span>
                                            <p>{rep.text}</p>
                                        </div>
                                        </div>
                                    })}
                                </div>
                            </div>
                            </div>
                        })}
                    </div>
                </div>
        </div>
     );
}
 
export default Watch;