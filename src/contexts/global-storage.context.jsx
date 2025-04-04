import { useContext, useState } from "react";
import { createContext } from "react";

const GlobalStorageContext = createContext();

export const GlobalStorageProvider=({children})=>{

    const [videoNotes,setVideoNotes]=useState({});

    const handleSetVideoNotes=(id,data)=>{
        setVideoNotes(prev=>{
            return {...prev,[id]:data}
        })
    }

    return(
        <GlobalStorageContext.Provider value={{videoNotes,handleSetVideoNotes}}>
            {children}
        </GlobalStorageContext.Provider>
    )
}
export const useGlobalStorageContext=()=>useContext(GlobalStorageContext);

