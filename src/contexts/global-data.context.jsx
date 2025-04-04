import PropTypes from "prop-types";
import { createContext, useContext, useState } from "react";

const GlobalDataContext = createContext();
export const GlobalDataProvider = ({children})=>{

    const [videoDataObject,setVideoDataObject]=useState({videoName:'',videoDuration:''});

    const handleSetVideoDataObject=(name,time)=>setVideoDataObject({videoName:name,videoDuration:time});

    return(
        <GlobalDataContext.Provider value={{videoDataObject,handleSetVideoDataObject}}>{children}</GlobalDataContext.Provider>
    )
}
GlobalDataProvider.propTypes={
    children:PropTypes.node,
}
export const useGlobalDataContext =()=>useContext(GlobalDataContext);