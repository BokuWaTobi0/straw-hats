import PropTypes from "prop-types";

const SearchBar = ({handleFilterData}) => {
    return ( 
        <input type='search' className='c-input' placeholder='search' onChange={e=>handleFilterData(e.target.value)} />
     );
}
SearchBar.propTypes={
    handleFilterData:PropTypes.func,
}
export default SearchBar;