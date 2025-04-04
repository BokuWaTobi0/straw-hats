import { createContext, useContext, useEffect, useState } from "react";
import { realtimeDb } from "../utils/firebase";
import PropTypes from "prop-types";
import { off, onValue, ref } from "firebase/database";


const GlobalDbContext = createContext();

export const GlobalDbProvider=({children})=>{

    const [allAdmins,setAllAdmins]=useState([]);
    const [adminEmails,setAdminEmails]=useState([]);
    const [orgs,setOrgs]=useState([])

    useEffect(()=>{
        const dbRef = ref(realtimeDb,`admins`);
        onValue(dbRef,(snapshot)=>{
            if(snapshot.exists()){
                const data = snapshot.val()
                const adminsData=Object.entries(data).map(([key,{accessType,adminEmail,adminName,adminOrganization}])=>({key,accessType,adminEmail,adminName,adminOrganization}))
                setAllAdmins(adminsData)
            }else{
                setAllAdmins([])
            }
        })
        return ()=>off(dbRef)
    },[])

    useEffect(()=>{
        const dbRef = ref(realtimeDb,`organizations`);
        onValue(dbRef,(snapshot)=>{
            if(snapshot.exists()){
                const data = snapshot.val();
                const d=Object.entries(data).map(([key,{orgName,admins,createdTime}])=>({key,orgName,admins,createdTime}));
                setOrgs(d)
            }
        })
    },[])
    
    useEffect(()=>{
        const adminemails = allAdmins.map(admin=>admin.adminEmail)
        setAdminEmails(adminemails);
    },[allAdmins])

    return(
        <GlobalDbContext.Provider value={{admins:allAdmins,adminEmails,orgs}}>
            {children}
        </GlobalDbContext.Provider>
    )
}
export const useGlobalDbContext=()=>useContext(GlobalDbContext);