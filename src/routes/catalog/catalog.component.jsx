import './catalog.styles.scss';
import { useParams } from 'react-router-dom';
import SearchBar from '../../components/searchbar/searchbar.component';
import ImgLoader from '../../components/img-loader/img-loader.component';
import AsyncLoader from '../../components/async-loader/async-loader.component';
import { useUserAuthContext } from '../../contexts/user-auth-context.context';
import { useEffect,  useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalDataContext } from '../../contexts/global-data.context';
import { realtimeDb } from '../../utils/firebase';
import { onValue,ref } from 'firebase/database';
import { FaPen } from 'react-icons/fa';
import { FaTrash } from 'react-icons/fa6';
import DeleteDialog from '../../components/delete-dialog/delete-dialog.component';
import { useGlobalDbContext } from '../../contexts/global-db.context';

// const dataAr=[{id:345,videoName:'test',videoDuration:'4:34',videoLink:'Ec08db2hP10?si=FXyltz-6OAogrrDj'}]

const Catalog = () => {
    const {catalogName}=useParams();
    const [data,setData]=useState([]);
    const [isLoading,setIsLoading]=useState(true);
    const {user}=useUserAuthContext();
    const router = useNavigate();
    const {handleSetVideoDataObject,isAdmin,userData}=useGlobalDataContext();
    const [isDeleteDialogOpen,setIsDeleteDialogOpen]=useState(false);
    const [videoObject,setVideoObject]=useState({videoName:'',videoId:''});
    const {admins,orgs}=useGlobalDbContext();
    // console.log(isAdmin)

    useEffect(()=>{
        setIsLoading(true);
        try{
            let orgId;
            if(isAdmin){
                const currentAdmin = admins.filter(admin=>admin.adminEmail===user.email)[0];

                orgId = orgs.filter(org=>org.orgName===currentAdmin.adminOrganization)[0].key
            }else{
                orgId = userData.userOrganization;
            }
            const dbRef = ref(realtimeDb,`catalogs/${orgId}/${catalogName}`);
            onValue(dbRef,(snapshot)=>{
                if(!snapshot.exists()){
                    setData([]);
                }else{
                    const data= snapshot.val();
                    if(data){
                        const dataArray = Object.entries(data).map(([id,{videoName,videoDuration,videoLink}])=>({id,videoName,videoDuration,videoLink}));
                        setData(dataArray);
                    }
                }
            })
        }catch(e){
            console.error(e);
            setData([]);
        }finally{
            setIsLoading(false);
        }
    },[])

    const handleDelete=(id,name)=>{
        setVideoObject({videoName:name,videoId:id})
        setIsDeleteDialogOpen(true)
    }


    const handleEdit=(id)=>{
        console.log(id);
    }

    // if(!data?.length) return <AsyncLoader text={"Nothing yet"} type={"empty"} />
    if(isLoading) return <AsyncLoader text={"Loading content"} type={"loading"} ls={"90px"} />

    return ( <div className="catalog-div cc-div">
        <h1>{catalogName[0].toUpperCase()+catalogName.slice(1,catalogName.length)}</h1>
        <SearchBar  />
        <div className='main'>
            {data?.map((obj)=>{
                return <div key={obj?.id} className='container'>
                <div  className='tile' onClick={()=>{
                    handleSetVideoDataObject(obj?.videoName,obj?.videoDuration)
                    router(`/watch/${encodeURIComponent(obj?.videoLink)}`)
                }} >
                    <ImgLoader imgSrc={`https://img.youtube.com/vi/${obj?.videoLink?.slice(0,11)}/hqdefault.jpg`} />
                    <h3>{obj?.videoName}</h3>
                    <h3>{obj?.videoDuration}</h3>
                </div>
                    {user && <div className='btns '>
                        <button className='c-btn' onClick={()=>handleEdit(obj?.id)}><FaPen/></button>
                        <button className='c-btn' onClick={()=>handleDelete(obj?.id,obj?.videoName)}><FaTrash/></button>
                    </div>}
                </div>
            })}
        </div>
        {isDeleteDialogOpen && <DeleteDialog videoName={videoObject.videoName} videoId={videoObject.videoId} setIsDeleteDialogOpen={setIsDeleteDialogOpen} catalogName={catalogName} />}
    </div> );
}
 
export default Catalog;