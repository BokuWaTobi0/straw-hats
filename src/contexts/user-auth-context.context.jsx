import PropTypes from "prop-types";
import { createContext, useContext, useState } from "react";

const UserAuthContext = createContext();
export const UserAuthProvider=({children})=>{

    const [user,setUser]=useState(null);
    const handleSetUser=(cred)=>setUser(cred);

    return (
        <UserAuthContext.Provider value={{user,handleSetUser}}>
            {children}
        </UserAuthContext.Provider>
    )
}
UserAuthProvider.propTypes={
    children:PropTypes.node,
}
export const useUserAuthContext = ()=>useContext(UserAuthContext);