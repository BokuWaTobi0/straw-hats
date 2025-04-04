import { Fragment,useEffect } from "react"
import { Routes,Route } from "react-router-dom"
import UploadVideo from './routes/upload-video/upload-video.component';
import AuthenticateUser from '../src/routes/authenticate-user/authenticate-user.component';
import Home from "./routes/home/home.component"
import Navbar from "./components/navbar/navbar.component";
import Catalogs from "./routes/catalogs/catalogs.component";
import Catalog from './routes/catalog/catalog.component';
import '@fontsource/poppins';
import '@fontsource/bebas-neue';
import { useUserAuthContext } from "./contexts/user-auth-context.context";
import Dummy from "./routes/dummy/dummy";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./utils/firebase";
import AddAdmins from "./routes/add-admins/add-admins.component";
import User from '../src/routes/user/user.component'
import Watch from '../src/routes/watch/watch.component';

function App() {

  const {user,handleSetUser}=useUserAuthContext();

  useEffect(() => {
    const checkAuthState = async () => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if(user){
          handleSetUser(user);
        }else{
          handleSetUser(null);
        }
      });
      return () => unsubscribe();
    };
    checkAuthState();      
  }, [handleSetUser]);

  if(!user){
    return <AuthenticateUser/>
  }

  return (
    <Fragment>
    <Routes>
      <Route path="/" element={<Navbar/>}>
        <Route index element={<Home/>} />
        <Route path="catalogs" element={<Catalogs/>} />
        <Route path="catalog/:catalogName" element={<Catalog/>} />
        <Route path="dummy" element={<Dummy/>} />
        <Route path="add-admins" element={<AddAdmins/>} />
        <Route path="user" element={<User/>} />
        <Route path="watch/:code" element={<Watch/>} />
        <Route path="upload-video" element={<UploadVideo/>} />
      </Route>
    </Routes>
    </Fragment>
  )
}

export default App
