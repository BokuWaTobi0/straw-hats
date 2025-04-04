import './auth.styles.scss';
import SubmitButton from '../submit-button/submit-button.component';
import { FaBullseye } from 'react-icons/fa6';
import { useState } from 'react';
import AuthSvg from '../../assets/video-player-streaming-svgrepo-com.svg';
import { signInUser } from '../../utils/firebase';
import {useUserAuthContext } from '../../contexts/user-auth-context.context'; 

const status=['.....','success','error','invalid credential']

const Auth = () => {
    const [loading,setLoading]=useState(false);
    const [passType,setPassType]=useState('password');
    const [cred,setCred]=useState({email:'',password:''});
    const [statusCode,setStatusCode]=useState(0);
    const {handleSetUser}=useUserAuthContext();

    const handleSubmit=async(e)=>{
        e.preventDefault();
        setLoading(true);
        const response = await signInUser(cred.email,cred.password);
        const code = response === "invalid credential" ? 3 : response === "error" ? 2 : 1;
        setStatusCode(code);
        setCred({email:'',password:''});
        setLoading(false);
        if(code === 1){
            handleSetUser(response);
        }
    }

    const handleChange=(e)=>{
        const {name,value}=e.target;
        setCred({...cred,[name]:value});
    }

    const handlePassType=()=>{
        setPassType(prev=>{
            if(prev === 'password'){
                return 'text'
            }else{
                return 'password'
            }
        })
    }

    return ( 
        <div className="auth-div">
        <div>
            <img src={AuthSvg} />
        </div>
            <form onSubmit={handleSubmit}>
                <input placeholder='Email' type='email' required onChange={handleChange} name='email' value={cred.email} className='c-input' maxLength={100} minLength={6} />
                <div className='pass'>
                <input placeholder='Password' minLength={6} type={passType} required onChange={handleChange} name='password' value={cred.password} className='c-input' maxLength={100} />
                <FaBullseye className='eye' onClick={handlePassType} />
                </div>
                <SubmitButton text={'Sign In'} state={loading} size={"25px"} />
            </form>
            <p>{status[statusCode]}</p>
        </div>
     );
}
 
export default Auth;