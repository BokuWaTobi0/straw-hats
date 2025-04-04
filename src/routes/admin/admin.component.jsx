import './admin.styles.scss';
import {useUserAuthContext} from '../../contexts/user-auth-context.context';
import Auth from '../../components/auth/auth.component';
import { MdAdminPanelSettings } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { signOutUser } from '../../utils/firebase';

const Admin = () => {
    const {user,handleSetUser}=useUserAuthContext();
    const router = useNavigate();
    
    const handleUserSignOut=async()=>{
        await signOutUser();
        handleSetUser(null);
    }

    return ( 
        <div className='admin-div'>
            {!user ? <Auth/> : <div className='main'>
                <MdAdminPanelSettings className='icon' />
                <p>Welcome </p>
                <p>{user?.user?.email ?? "unknown"}</p>
                <button className='c-btn' onClick={()=>router('/upload-video')} >Add videos</button>
                <button className='c-btn' onClick={handleUserSignOut}>Signout</button>
            </div>}
        </div>
     );
}
 
export default Admin;