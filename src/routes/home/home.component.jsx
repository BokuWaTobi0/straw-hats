import './home.styles.scss';
import HomeImg from '../../assets/youtube-svgrepo-com.svg';
import { FaArrowRight } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const router = useNavigate();
    return ( 
        <div className='home-div'>
            <div className='intro'>
                <h1>Stream. Enjoy. Repeat. Curated Videos, Just for You!</h1>
                <p>
                Discover a collection of engaging videos curated just for you! Our platform brings you the best content through YouTube, all in one convenient place. No distractions, just seamless streaming.
                </p>
                <button className='c-btn' onClick={()=>router('catalogs')} >Explore now <FaArrowRight/> </button>
            </div>
            <div className='img'>
                <img src={HomeImg} />
            </div>
        </div>
     );
}
 
export default Home;