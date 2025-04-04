import { useState } from "react";
import { createApplicationUser,realtimeDb } from "../../utils/firebase";
import { ref,set } from "firebase/database";

const AddAdmins = () => {

    const [email,setEmail]=useState('');
    const [password,setPassword]=useState('');
    const [name,setName]=useState('')
    const [org,setOrg]=useState('');

    const handleClick=async()=>{
        try{
            const result= await createApplicationUser(email,password);
                    const dbRef = ref(realtimeDb,`admins/${result.user.uid}`);
                    set(dbRef,{
                      adminEmail:email,
                      adminName:name,
                      adminOrganization:org,
                      accessType:'admin'
                    })
                    console.log('success from create admin')
        }catch(e){
            console.error(e)
        }
    }

    return ( 
        <div className="add-admins">
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="email" />
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="password" />
            <input type="text" value={org} onChange={(e)=>setOrg(e.target.value)} placeholder="org" />
            <input type="text" value={name} onChange={(e)=>setName(e.target.value)} placeholder="name" />
            <button onClick={handleClick}>add</button>
        </div>
     );
}
 
export default AddAdmins;