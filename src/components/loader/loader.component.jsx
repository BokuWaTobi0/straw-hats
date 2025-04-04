import PropTypes from 'prop-types';
import './loader.styles.scss';
const Loader = ({ls,pos}) => {
    return ( 
        <div className='loader-div' style={{width:ls,height:ls,position:pos}}></div>
     );
}
Loader.propTypes={
    ls:PropTypes.string,
    pos:PropTypes.string,
}
export default Loader;