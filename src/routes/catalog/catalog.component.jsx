import './catalog.styles.scss';
import { useParams } from 'react-router-dom';
import SearchBar from '../../components/searchbar/searchbar.component';
import ImgLoader from '../../components/img-loader/img-loader.component';
import AsyncLoader from '../../components/async-loader/async-loader.component';
import { useUserAuthContext } from '../../contexts/user-auth-context.context';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalDataContext } from '../../contexts/global-data.context';
import { realtimeDb } from '../../utils/firebase';
import { onValue, ref } from 'firebase/database';
import { FaPen, FaPlay, FaFilter, FaLightbulb, FaChevronRight } from 'react-icons/fa';
import { FaTrash, FaArrowLeft } from 'react-icons/fa6';
import DeleteDialog from '../../components/delete-dialog/delete-dialog.component';
import { useGlobalDbContext } from '../../contexts/global-db.context';
import RenameDialog from '../../components/rename-dialog/rename-dialog.component';
import { CatalogProblemStatements } from '../../utils/helpers';

// const dataAr=[{id:345,videoName:'test',videoDuration:'4:34',videoLink:'Ec08db2hP10?si=FXyltz-6OAogrrDj'}]

const Catalog = () => {
    const { catalogName } = useParams();
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useUserAuthContext();
    const router = useNavigate();
    const { handleSetVideoDataObject, isAdmin, userData } = useGlobalDataContext();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [videoObject, setVideoObject] = useState({ videoName: '', videoId: '', videoDuration: '' });
    const { admins, orgs } = useGlobalDbContext();
    const [filteredData, setFilteredData] = useState([]);
    const [showProjects, setShowProjects] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        try {
            let orgId;
            if (isAdmin) {
                const currentAdmin = admins.filter(admin => admin.adminEmail === user.email)[0];
                orgId = orgs.filter(org => org.orgName === currentAdmin.adminOrganization)[0].key
            } else {
                orgId = userData.userOrganization;
            }
            const dbRef = ref(realtimeDb, `catalogs/${orgId}/${catalogName}`);
            onValue(dbRef, (snapshot) => {
                if (!snapshot.exists()) {
                    setData([]);
                    setFilteredData([]);
                } else {
                    const data = snapshot.val();
                    if (data) {
                        const dataArray = Object.entries(data).map(([id, { videoName, videoDuration, videoLink }]) => ({ id, videoName, videoDuration, videoLink }));
                        setData(dataArray);
                        setFilteredData(dataArray);
                    }
                }
            })
        } catch (e) {
            console.error(e);
            setData([]);
            setFilteredData([]);
        } finally {
            setIsLoading(false);
        }
    }, [])

    const handleDelete = (id, name) => {
        setVideoObject({ videoName: name, videoId: id })
        setIsDeleteDialogOpen(true)
    }

    const handleEdit = (id, name, duration) => {
        setVideoObject({ videoName: name, videoId: id, videoDuration: duration })
        setIsRenameDialogOpen(true)
    }

    const handleFilterData = (value) => {
        if (!value.trim()) {
            setFilteredData(data);
            return;
        }
        const filtered = data.filter(item =>
            item.videoName.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredData(filtered);
    }

    const goBack = () => {
        router('/catalogs');
    }

    const getProjectsForCatalog = () => {
        const normalizedCatalogName = catalogName;
        return CatalogProblemStatements[normalizedCatalogName] || [];
    }

    const toggleProjects = () => {
        setShowProjects(!showProjects);
    }

    if (isLoading) return <AsyncLoader text={"Loading content"} type={"loading"} ls={"90px"} />

    const projects = getProjectsForCatalog();
    const hasProjects = projects.length > 0;

    return (
        <div className="catalog-div cc-div">
            <div className="catalog-header">
                <button className="back-button" onClick={goBack}>
                    <FaArrowLeft />
                </button>
                <h1>{catalogName[0].toUpperCase() + catalogName.slice(1, catalogName.length)}</h1>
            </div>
            
            {hasProjects && (
                <div className="projects-section">
                    <button 
                        className={`projects-toggle ${showProjects ? 'active' : ''}`} 
                        onClick={toggleProjects}
                    >
                        <FaLightbulb className="icon" />
                        <span>Mini Projects</span>
                        <FaChevronRight className={`arrow ${showProjects ? 'down' : ''}`} />
                    </button>

                    {showProjects && (
                        <div className="projects-container">
                            <div className="projects-header">
                                <h3>Practice with these mini projects</h3>
                                <p>Projects are ordered by difficulty: Beginner, Intermediate, Advanced</p>
                            </div>
                            <div className="projects-list">
                                {projects.map((project, index) => (
                                    <div key={index} className={`project-card difficulty-${index + 1}`}>
                                        <div className="difficulty-badge">
                                            {index === 0 ? 'Beginner' : index === 1 ? 'Intermediate' : 'Advanced'}
                                        </div>
                                        <p className="project-description">{project}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            <div className="search-container">
                <SearchBar handleFilterData={handleFilterData} />
                <div className="filter-icon">
                    <FaFilter />
                </div>
            </div>
            
            {filteredData.length === 0 ? (
                <div className="empty-state">
                    <AsyncLoader text={"No videos found"} type={"empty"} ls={"90px"} />
                </div>
            ) : (
                <div className='main'>
                    {filteredData.map((obj) => {
                        return (
                            <div key={obj?.id} className='video-container'>
                                <div className='tile' onClick={() => {
                                    handleSetVideoDataObject(obj?.videoName, obj?.videoDuration)
                                    router(`/watch/${encodeURIComponent(obj?.videoLink)}`)
                                }}>
                                    <div className="thumbnail-wrapper">
                                        <ImgLoader imgSrc={`https://img.youtube.com/vi/${obj?.videoLink?.slice(0, 11)}/hqdefault.jpg`} />
                                        <div className="play-overlay">
                                            <FaPlay />
                                        </div>
                                    </div>
                                    <div className="video-info">
                                        <h3>{obj?.videoName}</h3>
                                        <span className="duration">{obj?.videoDuration}</span>
                                    </div>
                                </div>
                                {isAdmin && (
                                    <div className='action-buttons'>
                                        <button className='edit-btn' onClick={() => handleEdit(obj?.id, obj?.videoName, obj?.videoDuration)}>
                                            <FaPen />
                                        </button>
                                        <button className='delete-btn' onClick={() => handleDelete(obj?.id, obj?.videoName)}>
                                            <FaTrash />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
            
            {isDeleteDialogOpen && <DeleteDialog videoName={videoObject.videoName} videoId={videoObject.videoId} setIsDeleteDialogOpen={setIsDeleteDialogOpen} catalogName={catalogName} />}
            {isRenameDialogOpen && <RenameDialog videoName={videoObject.videoName} videoId={videoObject.videoId} videoDuration={videoObject.videoDuration} setIsRenameDialogOpen={setIsRenameDialogOpen} catalogName={catalogName} />}
        </div>
    );
}

export default Catalog;