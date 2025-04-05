import { useState } from 'react';
import './authenticate-user.styles.scss';
import { realtimeDb, createApplicationUser, signInUser } from '../../utils/firebase';
import { ref, set } from 'firebase/database';
import { useGlobalDbContext } from '../../contexts/global-db.context';

const AuthenticateUser = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const { adminEmails, orgs } = useGlobalDbContext(); // Removed unused 'admins'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    organization: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear errors when user starts typing
    if (error) setError('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      if(isAdmin){
        await handleAdminSignIn(formData);
      } else {
        if(authMode === 'create'){
          await handleCreateUser(formData);
        } else if(authMode === 'login'){
          await handleSignInUser(formData);
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
    } finally {
      setIsLoading(false);
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
    setError('');
    setSuccess('');
  };

  const handleCreateUser = async (formData) => {
    try {
      const result = await createApplicationUser(formData.email, formData.password);
      const dbRef = ref(realtimeDb, `users/${result.user.uid}`);
      await set(dbRef, {
        userEmail: formData.email,
        userName: formData.username,
        userOrganization: formData.organization,
        accessType: 'user'
      });
      setSuccess('Account created successfully! You can now sign in.');
      setTimeout(() => {
        setAuthMode('login');
        setSuccess('');
      }, 3000);
    } catch (e) {
      setError(e.message || 'Error creating account. Please try again.');
      console.error('Error creating user', e);
    }
  }

  const handleSignInUser = async (formData) => {
    try {
      await signInUser(formData.email, formData.password);
      setSuccess('Signed in successfully!');
    } catch (e) {
      setError(e.message || 'Invalid email or password. Please try again.');
      console.log('Error signing user', e);
    }
  }
  
  const handleAdminSignIn = async (formData) => {
    if (!adminEmails.includes(formData.email)) {
      setError('This email is not registered as an admin.');
      console.log('not an admin');
    } else {
      try {
        await signInUser(formData.email, formData.password);
        setSuccess('Admin signed in successfully!');
      } catch (e) {
        setError(e.message || 'Invalid admin credentials. Please try again.');
      }
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1>{isAdmin ? 'Admin Authentication' : authMode === 'login' ? 'Sign In' : 'Create Account'}</h1>
        
        <div className="auth-switch">
          <button
            className={!isAdmin ? 'active' : ''}
            onClick={() => {
              setIsAdmin(false);
              setError('');
              setSuccess('');
            }}
          >
            User
          </button>
          <button
            className={isAdmin ? 'active' : ''}
            onClick={() => {
              setIsAdmin(true);
              setError('');
              setSuccess('');
              setAuthMode('login');
            }}
          >
            Admin
          </button>
        </div>
      </div>

      {error && <div className="auth-error">{error}</div>}
      {success && <div className="auth-success">{success}</div>}

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
              placeholder="your@email.com"
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
              placeholder="••••••••"
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
                placeholder="Choose a username"
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
                {orgs.map((org) => (
                  <option key={org.key} value={org.key}>
                    {org.orgName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className={`submit-button ${isLoading ? 'loading' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
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