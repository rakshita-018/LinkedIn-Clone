import { useNavigate } from 'react-router-dom';
import { LeftSideBar } from '../../components/LeftSideBar/LeftSideBar';
import { RightSidebar } from '../../components/RightSideBar/RightSideBar';
import { Button } from '../../../../components/Button/Button';
import './Feed.css'
import { useAuthentication } from '../../../authentication/contexts/AuthenticationContextProvider';
import { useEffect, useState } from "react";
import { Post } from '../../components/Post/Post';
import { Modal } from '../../components/Modal/Modal';
import { usePageTitle } from '../../../../hooks/usePageTitle';
import { Loader } from '../../../../components/loader/Loader';
import { request } from '../../../../utils/api';
import { useWebSocket } from '../../../ws/Ws';

 export function Feed(){
    const navigate = useNavigate();
    const {user} = useAuthentication();
    const [showPostingModal, setShowPostingModal] = useState(false);
    const [posts, setPosts] = useState([]);
    const [feedContent, setFeedContent] = useState("connections");
    const [error, setError] = useState("");
    const ws = useWebSocket();
    const [loading, setLoading] = useState(true);

    usePageTitle("Feed")

    useEffect(() => {
      const fetchPosts = async () => {
        await request({
          endpoint: "/api/v1/feed/",
          onSuccess: (data) => {
            setPosts(data);
            setLoading(false);
          },
          onFailure: (error) => setError(error),
        });
      };
      fetchPosts();
    }, []);

    
    useEffect(() => {
      const subscription = ws?.subscribe(`/topic/feed/${user?.id}/post`, (data) => {
        const post = JSON.parse(data.body);
        setPosts((posts) => [post, ...posts]);
      });
      return () => subscription?.unsubscribe();
    }, [user?.id, ws]);

    const handlePost = async (data) => {
      await request({
        endpoint: "/api/v1/feed/posts",
        method: "POST",
        contentType: "multipart/form-data",
        body: data,
        onSuccess: (data) => {
          setPosts([data, ...posts]);
          setShowPostingModal(false);
        },
        onFailure: (error) => setError(error),
      });
    };
    //   const handlePost = async (content, picture) => {
    //     try {
    //         const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/feed/posts`, {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 Authorization: `Bearer ${localStorage.getItem("token")}`,
    //             },
    //             body: JSON.stringify({ content, picture }),
    //         });

    //         if (!response.ok) {
    //             const { message } = await response.json();
    //             throw new Error(message);
    //         }

    //         const newPost = await response.json();
    //         setPosts((prevPosts) => [newPost, ...prevPosts]);
    //         setShowPostingModal(false);
    //     } catch (error) {
    //         setError(error.message || "Failed to create post. Please try again.");
    //     }
    // };

    return(
        <div className='feed-root' >
            <div className="feed-left">
                <LeftSideBar/>
            </div>
            <div className="feed-center">
                <div className="feed-posting">
                    <button
                        onClick={() => {
                        navigate(`/profile/${user?.id}`);
                        }}
                    >
                        <img
                          className="feed-top feed-avatar"
                          src={
                            user?.profilePicture
                              ? `${import.meta.env.VITE_API_URL}/api/v1/storage/${user?.profilePicture}`
                              : "/avatar.svg"
                          }                        
                          alt=""
                        />
                    </button>
                    <Button outline onClick={() => setShowPostingModal(true)}>
                      Start a post                  
                    </Button>
                    <Modal
                        title="Creating a post"
                        onSubmit={handlePost}
                        showModal={showPostingModal}
                        setShowModal={setShowPostingModal}
                    />
                </div>
                {/* <div className="feed-header">
                    <button 
                        className={feedContent === "all" ? "active" : ""}
                        onClick={() => setFeedContent("all")}
                    >
                        All
                    </button>
                    <button 
                        className={feedContent === "connections" ? "active" : ""}
                        onClick={() => setFeedContent("connections")}
                    >
                        Feed
                    </button>
                </div> */}
                {error && <div className="feed-error">{error}</div>}
                {loading ? (
                  <Loader isInline />
                ) : (
                  <div className="feed">
                    {posts.map((post) => (
                      <Post key={post.id} post={post} setPosts={setPosts} />
                    ))}
                    {posts.length === 0 && (
                      <p>Start connecting with people to build a feed that matters to you.</p>
                    )}
                  </div>
                )}
            </div>
            <div className="feed-right">
                <RightSidebar/>
            </div>
            </div>
    );
 }