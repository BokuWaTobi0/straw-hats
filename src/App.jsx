import { Fragment,useEffect } from "react"
import { Routes,Route } from "react-router-dom"
import UploadVideo from './routes/upload-video/upload-video.component';
import AuthenticateUser from '../src/routes/authenticate-user/authenticate-user.component';
import Home from "./routes/home/home.component"
import Navbar from "./components/navbar/navbar.component";
import Catalogs from "./routes/catalogs/catalogs.component";
import Catalog from './routes/catalog/catalog.component';
import QuizHub from './routes/quiz-hub/quiz-hub.component';
import '@fontsource/poppins';
import '@fontsource/bebas-neue';
import { useUserAuthContext } from "./contexts/user-auth-context.context";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./utils/firebase";
import AddAdmins from "./routes/add-admins/add-admins.component";
import User from '../src/routes/user/user.component'
import Watch from '../src/routes/watch/watch.component';
import UploadQuiz from "./routes/create-quiz/create-quiz.component";
import AiQuiz from "./routes/ai-quiz/ai-quiz.component";
import AdminQuiz from "./routes/admin-quiz/admin-quiz.component";
import Progress from "./routes/progress/progress.component";
import QuizResultsPage from "./routes/quiz-result/quiz-result.component";
import AiBot from "./components/ai-bot/ai-bot.component";

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
        <Route path="add-admins" element={<AddAdmins/>} />
        <Route path="user" element={<User/>} />
        <Route path="watch/:code" element={<Watch/>} />
        <Route path="upload-video" element={<UploadVideo/>} />
        <Route path="quiz-hub" element={<QuizHub/>} />
        <Route path="create-quiz" element={<UploadQuiz/>} />
        <Route path="ai-quiz" element={<AiQuiz/>} />
        <Route path="admin-quiz" element={<AdminQuiz/>} />
        <Route path="progress" element={<Progress/>} />
        <Route path="quiz-results" element={<QuizResultsPage/>} />
      </Route>
    </Routes>
    <AiBot />
    </Fragment>
  )
}

export default App;
