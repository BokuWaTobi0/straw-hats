import { useUserAuthContext } from "../../contexts/user-auth-context.context";
import { signOutUser } from "../../utils/firebase";
import AsyncLoader from "../../components/async-loader/async-loader.component";
import Avatar from 'boring-avatars';
import { useEffect, useState } from "react";
import {useGlobalDbContext} from '../../contexts/global-db.context';
import { useGlobalDataContext } from "../../contexts/global-data.context";
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaVideo, FaUserCircle } from 'react-icons/fa';
import './user.styles.scss';


const User = () => {
    const [userDataFetchState,setUserDataFetchState]=useState('loading'); //loading,done
    const {user}=useUserAuthContext();
    const [currentData,setCurrentData]=useState();
    const {admins,adminEmails}=useGlobalDbContext();
    const {userData}=useGlobalDataContext();
    const navigate = useNavigate();
    
    useEffect(()=>{
        if(adminEmails.includes(user?.email)){
            const currentUserData = admins.filter(admin=>admin.adminEmail===user.email).map(({adminEmail,adminName,adminOrganization,key,accessType})=>({key,accessType,userEmail:adminEmail,userName:adminName,userOrganization:adminOrganization}));
            setCurrentData(currentUserData[0]);
            setUserDataFetchState('')
        }else{
            setCurrentData(userData);
            setUserDataFetchState('');
        }
    },[])

    const handleAddVideos = () => {
        navigate('/catalogs');
    };

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
            <div className="user-header">
                <FaUserCircle className="user-icon" />
                <h1>User Profile</h1>
            </div>
            <div className="user-profile-container">
                <div className="avatar-div">
                    <Avatar name={currentData?.userName} size={'120'} variant="beam" colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']} />
                </div>
                <div className="user-info">
                    <h2>{currentData?.userName}</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="label">Email</span>
                            <p className="value">{currentData?.userEmail}</p>
                        </div>
                        <div className="info-item">
                            <span className="label">Organization</span>
                            <p className="value">{currentData?.userOrganization}</p>
                        </div>
                        <div className="info-item">
                            <span className="label">Access Type</span>
                            <p className="value">{currentData?.accessType}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="user-actions">
                <button className="c-btn add-videos-btn" onClick={handleAddVideos}>
                    <FaVideo className="btn-icon" />
                    <span>Add Videos</span>
                </button>
                <button className="c-btn signout-btn" onClick={signOutUser}>
                    <FaSignOutAlt className="btn-icon" />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
     );
}
 
export default User;