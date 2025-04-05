import { useState } from "react";
import { createApplicationUser,realtimeDb } from "../../utils/firebase";
import { push, ref,set } from "firebase/database";
import './add-admins.styles.scss';
import {useToast} from '../../contexts/toast-context.context'; 

const AddAdmins = () => {

    const [email,setEmail]=useState('');
    const [password,setPassword]=useState('');
    const [name,setName]=useState('')
    const [org,setOrg]=useState('');
    const {showToast}=useToast();

    const handleClick=async()=>{
        try{
            const result= await createApplicationUser(email,password);
                    const dbRef = ref(realtimeDb,`admins/${result.user.uid}`);
                    await set(dbRef,{
                      adminEmail:email,
                      adminName:name,
                      adminOrganization:org,
                      accessType:'admin'
                    })
                    const dbRef2 = ref(realtimeDb,'organizations');
                    await push(dbRef2,{
                        orgName:org,
                        admins:[email],
                        createdTime:new Date().toGMTString()
                    })
                    showToast('add org and new admin')
        }catch(e){
            console.error(e)
        }
    }

    return ( 
        <div className="add-admins-div">
            <input type="email" value={email} className="c-input" onChange={(e)=>setEmail(e.target.value)} placeholder="email" />
            <input type="password" value={password} className="c-input" onChange={(e)=>setPassword(e.target.value)} placeholder="password" />
            <input type="text" value={org} className="c-input" onChange={(e)=>setOrg(e.target.value)} placeholder="org" />
            <input type="text" value={name} className="c-input" onChange={(e)=>setName(e.target.value)} placeholder="name" />
            <button onClick={handleClick} className="c-btn">add</button>
        </div>
     );
}
 
export default AddAdmins;