import './async-loader.styles.scss';
import Loader from '../loader/loader.component';
import PropTypes from 'prop-types';
import { Fragment } from 'react';
import DbErrorImg from '../../assets/db-error.svg';
import EmptyImg from '../../assets/empty.svg';

const AsyncLoader = ({text,ls,pos,type}) => {

    const renderUi=()=>{
        if(type==="loading")
            return <Fragment><Loader ls={ls} pos={pos} /><p>{text}</p></Fragment>
        if(type === "error")
            return <Fragment><img src={DbErrorImg} width={ls} /><p>{text}</p></Fragment>
        if(type === "empty")
            return <Fragment><img src={EmptyImg} width={ls} /><p>{text}</p></Fragment>
        
    }

    return ( 
        <div className='async-loader-div'>
            {renderUi()}
        </div>
     );
}
AsyncLoader.propTypes={
    text:PropTypes.string,
    ls:PropTypes.string,
    pos:PropTypes.string,
    type:PropTypes.string
}
export default AsyncLoader;