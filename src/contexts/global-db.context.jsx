import { createContext, useContext, useEffect, useState } from "react";
import { realtimeDb } from "../utils/firebase";
import PropTypes from "prop-types";
import { ref } from "firebase/database";


const GlobalDbContext = createContext();

export const GlobalDbProvider=({children})=>{

    const [admins,setAdmins]=useState([]);

    useEffect(()=>{
        // const dbRef = ref(realtimeDb,   )

    },[])


    return(
        <GlobalDbContext.Provider value={{admins}}>
            {children}
        </GlobalDbContext.Provider>
    )
}
export const useGlobalDbContext=()=>useContext(GlobalDbContext);