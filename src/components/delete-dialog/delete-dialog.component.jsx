import PropTypes from 'prop-types';
import './delete-dialog.styles.scss';
import { FcFullTrash } from "react-icons/fc";
import Loader from '../loader/loader.component';
import { useState } from 'react';
import { realtimeDb } from '../../utils/firebase';
import { ref, remove } from 'firebase/database';
import { useGlobalDbContext } from '../../contexts/global-db.context';
import { useUserAuthContext } from '../../contexts/user-auth-context.context';

const DeleteDialog = ({videoName,setIsDeleteDialogOpen,videoId,catalogName}) => {

    const [isLoading,setIsLoading]=useState(false);
    const {orgs,admins}=useGlobalDbContext();
    const {user}=useUserAuthContext();
    

    const handleEntryDelete=async()=>{
        if(videoId && catalogName){
            const currentAdmin = admins.filter(admin => admin.adminEmail === user.email)[0];
               let orgId = orgs.filter(org => org.orgName === currentAdmin.adminOrganization)[0].key
            setIsLoading(true);
            try{
                const dbRef = ref(realtimeDb,`catalogs/${orgId}/${catalogName}/${videoId}`)
                await remove(dbRef);
            }catch(e){
                console.error(e)
            }finally{
                setIsLoading(false);
                setIsDeleteDialogOpen(false)
            }
        }
    }

    return ( 
        <div className="overlaying">
            <div className="delete-dialog-div">
            <FcFullTrash className='icon' />
            <h4>Delete Video</h4>
            <p>{videoName}</p>
            <div className='btns'>
                <button className='c-btn' onClick={()=>setIsDeleteDialogOpen(false)}>Cancel</button>
                <button className='c-btn' onClick={handleEntryDelete}>
                    {!isLoading ? "Delete" : <Loader  ls={"25px"} />}
                </button>
            </div>
            </div>
        </div>
     );
}
DeleteDialog.propTypes={
    videoName:PropTypes.string,
    setIsDeleteDialogOpen:PropTypes.func,
    videoId:PropTypes.string,
    catalogName:PropTypes.string,
}
export default DeleteDialog;