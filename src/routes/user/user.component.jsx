import { useUserAuthContext } from "../../contexts/user-auth-context.context";
import { signOutUser } from "../../utils/firebase";
import AsyncLoader from "../../components/async-loader/async-loader.component";
import Avatar from 'boring-avatars';
import { useEffect, useState } from "react";
import {useGlobalDbContext} from '../../contexts/global-db.context';
import { useGlobalDataContext } from "../../contexts/global-data.context";
import { realtimeDb } from "../../utils/firebase";
import { get,ref } from "firebase/database";
import './user.styles.scss';


const User = () => {

    const [userDataFetchState,setUserDataFetchState]=useState('loading'); //loading,done
    const {user}=useUserAuthContext();
    const [currentData,setCurrentData]=useState();
    const {admins,adminEmails}=useGlobalDbContext();
    const {userData}=useGlobalDataContext();
    
    useEffect(()=>{
        if(adminEmails.includes(user.email)){
            const currentUserData = admins.filter(admin=>admin.adminEmail===user.email).map(({adminEmail,adminName,adminOrganization,key,accessType})=>({key,accessType,userEmail:adminEmail,userName:adminName,userOrganization:adminOrganization}));
            setCurrentData(currentUserData);
            setUserDataFetchState('')
        }else{
            setCurrentData(userData);
            setUserDataFetchState('');
        }
    },[])


    if(!user){
        return <AsyncLoader type={'empty'} ls={'60px'} text={'Nothing Yet!'} />
    }

    if(userDataFetchState==='loading'){
        return <AsyncLoader type={'loading'} ls={'70px'} text={'Loading user data'} />
    }

    if(userDataFetchState==='empty'){
        return <AsyncLoader type={'empty'} ls={'70px'} text={'Nothing here'} />
    }

    return ( 
        <div className="user-div">
            <div className="avatar-div">
                <Avatar name={currentData?.userName} />
                <p>{currentData.userName.slice(0,1)}</p>
            </div>
            <p>Email: {currentData.userEmail}</p>
            <p>Name: {currentData.userName}</p>
            <p>Organization: {currentData.userOrganization}</p>
            <p>AccessType: {currentData.accessType}</p>
            <button className="c-btn" onClick={signOutUser} >signout</button>
        </div>
     );
}
 
export default User;