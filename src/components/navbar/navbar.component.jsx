import './navbar.styles.scss';
import { Fragment,useState } from 'react';
import { useNavigate,Outlet } from 'react-router-dom';
import { FaSun,FaMoon } from 'react-icons/fa6';

const pageIdentifiers=['Quiz','Catalogs','User'];


const Navbar = () => {
    
    const [page,setPage]=useState('Home');
    const pageNavigators = ['/quizzes','/catalogs','/user']

    const navigateRouter = useNavigate();

    const handleNavigation=(name,path)=>{
        setPage(name);
        navigateRouter(path);
    }

    return ( 
        <Fragment>
        <nav className='navbar-div'>
            <div className='company' onClick={()=>navigateRouter('/')}>
                Streamer
            </div>
            <div className='pages'>
                {pageIdentifiers.map((name,index)=>{
                    return <p key={`page-identifier-${index}`} onClick={()=>handleNavigation(name,pageNavigators[index])}
                     style={{backgroundColor:page === name ? 'black' : '',color:page === name ? 'white' : ''}}>
                        {name}
                    </p>
                })}
            </div>
        </nav>
        <Outlet/>
    </Fragment>
     );
}
 
export default Navbar;