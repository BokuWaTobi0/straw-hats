import './img-loader.styles.scss';
import PropTypes from 'prop-types';
import Loader from '../loader/loader.component';
import { useState } from 'react';

const ImgLoader = ({imgSrc='',type='img',iframeId,ls="30px",wd}) => {
    const [isLoading,setIsLoading]=useState(true);
    return ( 
        <div className='img-loader-div' style={{width:wd}}>
            {isLoading && <Loader ls={ls} pos={"absolute"} />}
            {type==='img' && <img src={imgSrc} onLoad={()=>setIsLoading(false)}  />}
            {type==='iframe' && <iframe src={`https://www.youtube.com/embed/${iframeId}`}   frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" 
            referrerPolicy="strict-origin-when-cross-origin" className='iframe' onLoad={()=>setIsLoading(false)}
            allowFullScreen></iframe>}
        </div>
     );
}
ImgLoader.propTypes={
    imgSrc:PropTypes.string,
    type:PropTypes.string,
    iframeId:PropTypes.string,
    ls:PropTypes.string,
}
export default ImgLoader;