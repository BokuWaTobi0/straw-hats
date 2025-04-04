import { createContext, useContext, useEffect, useState } from "react";
import { realtimeDb } from "../utils/firebase";
import PropTypes from "prop-types";
import { off, onValue, ref } from "firebase/database";


const GlobalDbContext = createContext();

export const GlobalDbProvider=({children})=>{

    const [admins,setAdmins]=useState([]);
    const [adminEmails,setAdminEmails]=useState([]);

    useEffect(()=>{
        const dbRef = ref(realtimeDb,`admins`);
        onValue(dbRef,(snapshot)=>{
            if(snapshot.exists()){
                const data = snapshot.val()
                const adminsData=Object.entries(data).map(([key,{accessType,adminEmail,adminName,adminOrganization}])=>({key,accessType,adminEmail,adminName,adminOrganization}))
                setAdmins(adminsData)
            }else{
                setAdmins([])
            }
        })
        return ()=>off(dbRef)
    },[])

    useEffect(()=>{
        const adminemails = admins.map(admin=>admin.adminEmail)
        setAdminEmails(adminemails);
    },[admins])

    return(
        <GlobalDbContext.Provider value={{admins,adminEmails}}>
            {children}
        </GlobalDbContext.Provider>
    )
}
export const useGlobalDbContext=()=>useContext(GlobalDbContext);