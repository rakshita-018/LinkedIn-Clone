import { useNavigate } from "react-router-dom";
import "./Post.css";
import { useAuthentication } from "../../../authentication/contexts/AuthenticationContextProvider";
import { useEffect, useState } from "react";
import { Input } from "../../../../components/input/Input";
import { timeAgo } from "../utils/date";
import { Comment } from "../Comment/comment";
import { Modal } from "../Modal/Modal";
import { TimeAgo } from "../TimeAgo/TimeAgo";
import { useWebSocket } from "../../../ws/Ws";
import { request } from "../../../../utils/api";

export function Post({ post, setPosts }) {
    const [comments, setComments] = useState([]);
    const [showComments, setShowComments] = useState(false);
    const [likes, setLikes] = useState(post.likes || []);
    const [content, setContent] = useState("");
    const navigate = useNavigate();
    const { user } = useAuthentication();
    const [showMenu, setShowMenu] = useState(false);
    const [editing, setEditing] = useState(false);
    const webSocketClient = useWebSocket();
    const [postLiked, setPostLiked] = useState(undefined);
    // const [postLiked, setPostLiked] = useState(!!post.likes?.some((like) => like.id === user?.id));

    // useEffect(() => {
    //   setPostLiked(!!post.likes?.some((like) => like.id === user?.id));
    // }, [post.likes, user?.id]);
    

    useEffect(() => {
      if (!post) return;
      const fetchComments = async () => {
        try{
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/feed/posts/${post.id}/comments`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          if(!response.ok) {
            const { message } = await response.json();
            throw new Error(message);
          }
          const commentsData = await response.json();
          setComments(commentsData);
              
        }catch(e){
          console.error(" ouldn't fetch comments", e)
        }
      };
      fetchComments() ;
    }, [post.id]);

    useEffect(() => {
      const subscription = webSocketClient?.subscribe(`/topic/likes/${post.id}`, (message) => {
        const likes = JSON.parse(message.body);
        setLikes(likes);
        setPostLiked(likes.some((like) => like.id === user?.id));
      });
      return () => subscription?.unsubscribe();
    }, [post.id, user?.id, webSocketClient]);
    
    useEffect(() => {
      const subscription = webSocketClient?.subscribe(
        `/topic/comments/${post.id}`,
        (message) => {
          const comment = JSON.parse(message.body);
          setComments((prev) => {
            const index = prev.findIndex((c) => c.id === comment.id);
            if (index === -1) {
              return [comment, ...prev];
            }
            return prev.map((c) => (c.id === comment.id ? comment : c));
          });
        }
      );
    
      return () => {
        subscription?.unsubscribe();
      };
    }, [post.id, webSocketClient]);
    

    useEffect(() => {
      if(!post) return;
      const fetchLikes = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/feed/posts/${post.id}/likes`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          if (!response.ok) {
            const { message } = await response.json();
            throw new Error(message);
          }

          const likesData = await response.json();
          setLikes(likesData);
          setPostLiked(likesData.some((like) => like.id === user?.id)); 

        }catch (e) {
          console.error("couldn't fetch likes", e);
        }
      };
      fetchLikes();
    },[post.id, user?.id]);
       
    // const like = async () => {
    //   // const newLikedState = !postLiked;
    //   // setPostLiked(newLikedState);
    
    //   try {
    //     const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/feed/posts/${post.id}/likes`, {
    //       method: "PUT",
    //       headers: {
    //         Authorization: `Bearer ${localStorage.getItem("token")}`,
    //       },
    //     });
    
    //     if (!response.ok) {
    //       const { message } = await response.json();
    //       throw new Error(message);
    //     }
    
    //     // // Update likes array manually to avoid extra API call
    //     // setLikes((prevLikes) => 
    //     //   newLikedState 
    //     //     ? [...prevLikes, { id: user.id }]  // Add like
    //     //     : prevLikes.filter((like) => like.id !== user.id) // Remove like
    //     // );
    
    //   } catch (error) {
    //     console.error("Error liking post:", error instanceof Error ? error.message : "Error occurred, try again");
    //     // setPostLiked(!newLikedState); // Revert UI on failure
    //   }
    // };
   
    const like = async () => {
      await request({
        endpoint: `/api/v1/feed/posts/${post.id}/likes`,
        method: "PUT",
        onSuccess: () => { },
        onFailure: (error) => {
          console.error(error);
        },
      });
    };

    const deletePost = async (id) => {
      try {
        console.log("Deleting post with ID:", id); 
    
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/feed/posts/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
    
        if (!res.ok) {
          const { message } = await res.json();
          throw new Error(message || "Failed to delete post");
        }
    
        console.log("Post deleted successfully!");
        setPosts((prevPosts) => prevPosts.filter((p) => p.id !== id));
      } catch (e) {
        console.error("Error deleting post:", e);
      }
    };
    
    const deleteComment = async(id) =>{
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/feed/comments/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if(!res.ok){
          const {message} = await res.json();
          throw new Error(message);
        }
        setComments((prevComments) => prevComments.filter((comment) => comment.id !== id ))
      } catch (e) {
        console.error(e);
    }
  }

    const editComment = async (id, content) => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/feed/comments/${id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        });
    
        if (!res.ok) {
          const { message } = await res.json();
          throw new Error(message);
        }
    
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === id ? { ...comment, content, updatedDate: new Date().toISOString() } : comment
          )
        );

        if (!post) {
          console.error("Post is undefined. Cannot update comments.");
          return;
        }        
      } catch (e) {
        console.error(e);
      }
    };

    // const postComment = async(e) =>{
    //   e.preventDefault();
    //   if(!content){
    //     return;
    //   }
    //   try {
    //     const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/feed/posts/${post.id}/comments`, {
    //       method: "POST",
    //       headers: {
    //         Authorization: `Bearer ${localStorage.getItem("token")}`,
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify({ content }),
    //     });

    //     if(!res.ok){
    //       const { message } = await res.json();
    //       throw new Error(message);
    //     }
    //     const data = await res.json();

    //     setComments((prev) => [data, ...prev]);
    //     setContent("");
    //   }catch(e){
    //     if(error instanceof Error){
    //       console.error(error.message);
    //     }else{
    //       console.error("An error occurred while posting a comment:", e);
    //     }
    //   }
    // };
    
    const postComment = async (e) => {
      e.preventDefault();
      if (!content) {
        return;
      }
      await request({
        endpoint: `/api/v1/feed/posts/${post.id}/comments`,
        method: "POST",
        body: JSON.stringify({ content }),
        onSuccess: () => setContent(""),
        onFailure: (error) => {
          console.error(error);
        },
      });
    };

    const editPost = async(content, picture) => {
      try{
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/feed/posts/${post.id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-type": "application/json",
          },
          body: JSON.stringify({content, picture}),
        });
  
        if(!res.ok){
          const { message } = await res.json();
          throw new Error(message);
        }
  
        const data = await res.json();
        setPosts((prev) =>
          prev.map((p) => 
            (p?.id === post?.id) ? data : p 
          )
        );
        setEditing(false);
        setShowMenu(false);
      }catch(e){
        console.error("Error in upadting post: " , e);
      }
    }

    return(
      
      <>
      {
        editing ?  (
          <Modal
            title="Editing your post"
            content={post.content}
            picture={post.picture}
            onSubmit={editPost}
            showModal={editing}
            setShowModal={setEditing}
          />
        ) : null
      } 

      <div className="post-root">
        <div className="post-top">
          <div className="post-author">
            <button onClick={() => navigate(`/profile/${post.author.id}`)}>
              <img
                className="post-avatar"
                src={post.author.profilePicture || "/avatar.svg"}
                alt=""
              />
            </button>
            <div>
              <div className="post-name">
                {post.author.firstName} {post.author.lastName}
              </div>
              <div className="post-title">
                {post.author.position} at {post.author.company}
              </div>
              <TimeAgo
                date={post.creationDate}
                edited={!!post.updatedDate}
                className="post-date"
              />
              {/* {post.updatedDate? ". Edited" : ""} */}
            </div>
          </div>
          <div>
            {post.author.id == user?.id && (
                <button className={`post-toggle ${showMenu? "post-active" : ""}`}
                    onClick={() => setShowMenu(!showMenu)}
                >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 512">
                    <path d="M64 48a24 24 0 1 1 0-48 24 24 0 1 1 0 48zm0 208a24 24 0 1 1 0-48 24 24 0 1 1 0 48zm0 208a24 24 0 1 1 0-48 24 24 0 1 1 0 48z"/>
                </svg>

                </button>
            )}
            { showMenu && (
                <div className="post-menu">
                    <button onClick={() => setEditing(true)}>Edit</button>
                    <button onClick={() => deletePost(post.id)}>Delete</button>
                </div>
            )}
          </div>
        </div>
        <div className="post-content">{post.content}</div>
        {post.picture && <img src={post.picture} alt="" className="post-picture" />}
      
            
        <div className="post-stats">
        {likes.length > 0 && (
          <div className="post-stat">
            <span>
              {postLiked || likes.some((like) => like.id === user?.id) 
                ? "You " 
                : `${likes[0].firstName} ${likes[0].lastName} `}
            </span>
            {likes.length > 1 && (
              <span>
                and {likes.length - 1} {likes.length - 1 === 1 ? "other" : "others"}
              </span>
            )}{" "}
            liked this
          </div>
        )}

          {comments.length > 0 && (
            <button className="post-stat" onClick={() => setShowComments((prev) => !prev)}>
              <span>{comments.length} {comments.length === 1 ? "comment" : "comments"}</span>
            </button>

          )}
      </div>

      <div className="post-actions">
        <button
            disabled={postLiked === undefined}
            onClick={like}
            className={postLiked ? "active" : ""}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
                <path d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8l0-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5l0 3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9z" />
            </svg>
            <span>{postLiked == undefined ? "Loading" : postLiked ? "Liked" : "Like"}</span>
            {/* <span>{likes.some((like) => like.id === user?.id) ? "Liked" : "Like"}</span> */}
            </button>
        <button
            onClick={() => setShowComments((prev) => !prev)}
            className={showComments ? "active" : ""}
        >
            <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path d="M123.6 391.3c12.9-9.4 29.6-11.8 44.6-6.4c26.5 9.6 56.2 15.1 87.8 15.1c124.7 0 208-80.5 208-160s-83.3-160-208-160S48 160.5 48 240c0 32 12.4 62.8 35.7 89.2c8.6 9.7 12.8 22.5 11.8 35.5c-1.4 18.1-5.7 34.7-11.3 49.4c17-7.9 31.1-16.7 39.4-22.7z" />
            </svg>
            <span>Comment</span>
        </button>
      </div>

      {showComments && (
        <div className="post-comments">
          <form onSubmit={postComment}>
            <Input
              type="text"
              onChange={(e) => setContent(e.target.value)}
              value={content}
              placeholder="Add a comment..."
              name="content"
              // className="comment-input"
            />
          </form>

          {comments.map((comment) => (
            <div className="comment" key={comment.id}>
              <Comment
                editComment={editComment}
                deleteComment={deleteComment}
                comment={comment}
              />
            </div>
          ))}
        </div>
      )}
      </div>
      </>

    )
}

// export function Post({ post, setPosts }) {
//     // const [postLiked, setPostLiked] = useState(!!post.likes?.some((like) => like.id === user?.id));

//     const like = async () => {
//       const newLikedState = !postLiked;
//       setPostLiked(newLikedState); // Optimistically update state
    
//       try {
//         const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/feed/posts/${post.id}/likes`, {
//           method: "PUT",
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         });
    
//         if (!response.ok) {
//           const { message } = await response.json();
//           throw new Error(message);
//         }
    
//         // Update likes array manually to avoid extra API call
//         setLikes((prevLikes) => 
//           newLikedState 
//             ? [...prevLikes, { id: user.id }]  // Add like
//             : prevLikes.filter((like) => like.id !== user.id) // Remove like
//         );
    
//       } catch (error) {
//         console.error("Error liking post:", error instanceof Error ? error.message : "Error occurred, try again");
//         setPostLiked(!newLikedState); // Revert UI on failure
//       }
//     };
    
// const like = async () => {
//   setPostLiked((prev) => !prev);
//   try{
//     const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/feed/posts/${post.id}/likes`, {
//       method: "PUT",
//       headers: {
//         Authorization: `Bearer ${localStorage.getItem("token")}`,
//       },
//     });

//     if (!response.ok) {
//       const { message } = await response.json();
//       throw new Error(message);
//     }
//     fetchLikes();
//   }catch(e){
//       if( error instanceof Error ){
//         console.error("Error liking post:", error.message);
//       }else{
//         console.error("Error occured try again");
//       }
//       setPostLiked((prev) => !prev);
//   }
// }

// const like = async () => {
//   const newLikedState = !postLiked;
//   setPostLiked(newLikedState);

//   try {
//     const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/feed/posts/${post.id}/likes`, {
//       method: "PUT",
//       headers: {
//         Authorization: `Bearer ${localStorage.getItem("token")}`,
//       },
//     });

//     if (!response.ok) {
//       const { message } = await response.json();
//       throw new Error(message);
//     }

//     // Fetch latest likes from server
//     const updatedLikesResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/feed/posts/${post.id}`);
//     if (!updatedLikesResponse.ok) {
//       throw new Error("Failed to fetch updated post data");
//     }

//     const postData = await updatedLikesResponse.json();
//     setLikes(postData.likes || []);

//     // Ensure postLiked is correctly updated
//     setPostLiked(postData.likes.some((like) => like.id === user?.id));
//   } catch (error) {
//     console.error("Error liking post:", error);
//     setPostLiked(!newLikedState); // Revert on failure
//   }
// };

 // useEffect(() => {
    //   if (!post) return;
    //   const fetchPostData = async () => {
    //     try {
    //       const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/feed/posts/${post.id}`, {
    //         headers: {
    //           Authorization: `Bearer ${localStorage.getItem("token")}`,
    //         },
    //       });
    
    //       if (!response.ok) {
    //         const { message } = await response.json();
    //         throw new Error(message);
    //       }
    
    //       const postData = await response.json();
    //       setLikes(postData.likes || []);
    //     } catch (error) {
    //       console.error("Error fetching post details:", error);
    //     }
    //   };
    
    //   fetchPostData();
    // }, [post.id, postLiked]);

