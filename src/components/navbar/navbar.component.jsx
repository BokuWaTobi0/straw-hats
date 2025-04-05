import './navbar.styles.scss';
import { Fragment,useState } from 'react';
import { useNavigate,Outlet } from 'react-router-dom';

const pageIdentifiers=['Quiz','Catalogs','User','Progress'];


const Navbar = () => {
    
    const [page,setPage]=useState('Home');
    const pageNavigators = ['/quiz-hub','/catalogs','/user','/progress']

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