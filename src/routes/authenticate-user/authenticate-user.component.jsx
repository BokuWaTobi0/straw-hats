import  { useState } from 'react';
import './authenticate-user.styles.scss';
import { realtimeDb,createApplicationUser,signInUser } from '../../utils/firebase';
import {  ref,set } from 'firebase/database';
import {useGlobalDbContext} from '../../contexts/global-db.context';

const AuthenticateUser = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const {admins}=useGlobalDbContext();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    organization: '',
  });

  const organizations = [
    { id: "-OMz9C98H-mBUfdCs0yx", name: 'straw hats' },
    { id: 2, name: 'test b' },
    { id: 3, name: 'test c' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if(isAdmin){
      handleAdminSignIn(formData)
    }else{
      if(authMode==='create'){
          handleCreateUser(formData)
      }else if(authMode==='login'){
          handleSignInUser(formData)
      }
    }
  };

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'create' : 'login');
    setFormData({
      email: '',
      password: '',
      username: '',
      organization: '',
    });
  };

  const handleCreateUser=async(formData)=>{
      try{
       const result= await createApplicationUser(formData.email,formData.password);
        const dbRef = ref(realtimeDb,`users/${result.user.uid}`);
        set(dbRef,{
          userEmail:formData.email,
          userName:formData.username,
          userOrganization:formData.organization,
          accessType:'user'
        })
        console.log('success from create user')
      }catch(e){
        console.error('error creating user',e)
      }
  }

  const handleSignInUser=async(formData)=>{
    try{
      await signInUser(formData.email,formData.password)
      console.log('success signing in user')
    }catch(e){
      console.log('error signing user')
    }
  }

  const handleAdminSignIn=async(formData)=>{
    const adminEmails=admins.map(admin=>admin.adminEmail)
    if(!adminEmails.includes(formData.email)){
      console.log('not an admin')
    }else{
      await signInUser(formData.email,formData.password)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1>Authentication</h1>
        
        <div className="auth-switch">
          <button
            className={!isAdmin ? 'active' : ''}
            onClick={() => setIsAdmin(false)}
          >
            User
          </button>
          <button
            className={isAdmin ? 'active' : ''}
            onClick={() => setIsAdmin(true)}
          >
            Admin
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-fields">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {!isAdmin && authMode === 'create' && (
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          )}

          {(isAdmin || (!isAdmin && authMode === 'create')) && (
            <div className="form-group">
              <label htmlFor="organization">Organization</label>
              <select
                id="organization"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                required
              >
                <option value="">Select Organization</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button type="submit" className="submit-button">
          {authMode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      {!isAdmin && (
        <div className="auth-toggle">
          <button onClick={toggleAuthMode} className="toggle-button">
            {authMode === 'login'
              ? "Don't have an account? Create one"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthenticateUser;