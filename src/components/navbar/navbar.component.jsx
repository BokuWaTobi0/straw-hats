import './navbar.styles.scss';
import { Fragment,useState,useEffect } from 'react';
import { useNavigate,Outlet } from 'react-router-dom';
import { FaSun,FaMoon } from 'react-icons/fa6';

const pageIdentifiers=['Home','Catalogs','User'];

const Navbar = () => {
    
    const [page,setPage]=useState('Home');
    const pageNavigators = ['/','/catalogs','/user']
    const [theme,setTheme]=useState(false);
    const navigateRouter = useNavigate();
    const colors=!theme ? ['black','rgb(250,250,250)'] :['rgb(250,250,250)','black']

    const handleNavigation=(name,path)=>{
        setPage(name);
        navigateRouter(path);
    }

    useEffect(()=>{
        document.body.className=theme ? 'dark-theme' : 'light-theme';
    },[theme]);

    return ( 
        <Fragment>
        <nav className='navbar-div'>
            <div className='company' onClick={()=>navigateRouter('/')}>
                Streamer
            </div>
            <div className='pages'>
                {pageIdentifiers.map((name,index)=>{
                    return <p key={`page-identifier-${index}`} onClick={()=>handleNavigation(name,pageNavigators[index])}
                     style={{backgroundColor:page === name ? colors[0] : '',color:page === name ? colors[1] : ''}}>
                        {name}
                    </p>
                })}
            </div>
            <div className='ext' onClick={()=>setTheme(prev=>!prev)}>
            {theme ? <FaSun/> : <FaMoon/>}
            </div>
        </nav>
        <Outlet/>
    </Fragment>
     );
}
 
export default Navbar;