import './catalogs.styles.scss';
import { options,CatalogsImagesObject } from '../../utils/helpers';
import ImgLoader from '../../components/img-loader/img-loader.component';
import SearchBar from '../../components/searchbar/searchbar.component';
import AsyncLoader from '../../components/async-loader/async-loader.component';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const Catalogs = () => {
    const [filterData,setFilterData]=useState(options);
    const router = useNavigate();
    const handleFilterData=(value)=>{
        setFilterData(options.filter(name=>name.toLowerCase().startsWith(value.toLowerCase())))
    }
    

    return ( 
        <div className="catalogs-div cc-div">
            <h1>Catalogs</h1>
            <SearchBar handleFilterData={handleFilterData} />
            <div className='main'>
                {filterData.map((name,index)=>{
                    return <div key={`catalogs-image-${index}`} className='tile' onClick={()=>router(`/catalog/${name}`)}>
                        <ImgLoader imgSrc={CatalogsImagesObject[name]} />
                        <h3>{name[0].toUpperCase()+name.slice(1,name.length)}</h3>
                    </div>
                })}
                {filterData.length===0 && <AsyncLoader text={"No matching catalogs"} type={"empty"} />}
            </div>
        </div>
     );
}
 
export default Catalogs;