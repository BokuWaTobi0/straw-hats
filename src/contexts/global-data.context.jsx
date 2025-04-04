import { ref } from "firebase/database";
import PropTypes from "prop-types";
import { createContext, useContext, useEffect, useState } from "react";
import { realtimeDb } from "../utils/firebase";
import { useUserAuthContext } from "./user-auth-context.context";
import { get } from "firebase/database";
import { useGlobalDbContext } from "./global-db.context";

const GlobalDataContext = createContext();
export const GlobalDataProvider = ({children})=>{

    const [videoDataObject,setVideoDataObject]=useState({videoName:'',videoDuration:''});
    const [userData,setUserData]=useState({});
    const {user}=useUserAuthContext();
    const {adminEmails}=useGlobalDbContext();
    const isAdmin = adminEmails.includes(user?.email)

    const fetchData=async()=>{
        const dbRef = ref(realtimeDb,`users/${user.uid}`)
        const d = await get(dbRef);
        setUserData(d.val())
    }

    useEffect(()=>{
        if(!user) return;
        if(adminEmails.includes(user.email)) return;
         fetchData();
    },[user])

    const handleSetVideoDataObject=(name,time)=>setVideoDataObject({videoName:name,videoDuration:time});
    const handleSetUserData=(data)=>setUserData(data);

    return(
        <GlobalDataContext.Provider value={{videoDataObject,handleSetVideoDataObject,userData,handleSetUserData,isAdmin}}>{children}</GlobalDataContext.Provider>
    )
}
GlobalDataProvider.propTypes={
    children:PropTypes.node,
}
export const useGlobalDataContext =()=>useContext(GlobalDataContext);