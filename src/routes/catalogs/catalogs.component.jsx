import './catalogs.styles.scss';
import { options, CatalogsImagesObject } from '../../utils/helpers';
import ImgLoader from '../../components/img-loader/img-loader.component';
import SearchBar from '../../components/searchbar/searchbar.component';
import AsyncLoader from '../../components/async-loader/async-loader.component';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaLayerGroup, FaChevronRight } from 'react-icons/fa';

const Catalogs = () => {
    const [filterData, setFilterData] = useState(options);
    const [searchValue, setSearchValue] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const router = useNavigate();

    const handleFilterData = (value) => {
        setSearchValue(value);
        setFilterData(options.filter(name => 
            name.toLowerCase().includes(value.toLowerCase())
        ));
    };

    const clearSearch = () => {
        setSearchValue('');
        setFilterData(options);
    };

    return (
        <div className="catalogs-div cc-div">
            <div className="catalogs-header">
                <FaLayerGroup className="header-icon" />
                <h1>Catalogs</h1>
            </div>

            <div className="search-container">
                <div className={`search-wrapper ${isSearchFocused ? 'focused' : ''}`}>
                    <FaSearch className="search-icon" />
                    <SearchBar 
                        handleFilterData={handleFilterData} 
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        value={searchValue}
                    />
                    {searchValue && (
                        <button className="clear-search" onClick={clearSearch}>×</button>
                    )}
                </div>
            </div>

            {filterData.length === 0 ? (
                <div className="empty-state">
                    <AsyncLoader text={"No matching catalogs"} type={"empty"} />
                </div>
            ) : (
                <div className='catalogs-grid'>
                    {filterData.map((name, index) => (
                        <div 
                            key={`catalogs-image-${index}`} 
                            className='catalog-card' 
                            onClick={() => router(`/catalog/${name}`)}
                        >
                            <div className="catalog-image">
                                <ImgLoader imgSrc={CatalogsImagesObject[name]} />
                                <div className="overlay">
                                    <FaChevronRight />
                                </div>
                            </div>
                            <div className="catalog-info">
                                <h3>{name[0].toUpperCase() + name.slice(1)}</h3>
                                {/* <span className="catalog-count">
                                    {Math.floor(Math.random() * 20) + 1} videos
                                </span> */}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Catalogs;