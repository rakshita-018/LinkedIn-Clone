import { useNavigate } from "react-router-dom";
import "./Post.css";
import { useAuthentication } from "../../../authentication/contexts/AuthenticationContextProvider";
import { useEffect, useState } from "react";
import { Input } from "../../../../components/input/Input";
import { Comment } from "../Comment/comment";
import { Modal } from "../Modal/Modal";
import { TimeAgo } from "../TimeAgo/TimeAgo";
import { useWebSocket } from "../../../ws/Ws";
import { request } from "../../../../utils/api";

// delete post is not in request form. websock is also not exicuting

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

    useEffect(() => {
      const fetchComments = async () => {
        await request({
          endpoint: `/api/v1/feed/posts/${post.id}/comments`,
          onSuccess: (data) => setComments(data),
          onFailure: (error) => {
            console.error(error);
          },
        });
      };
      fetchComments();
    }, [post.id]);

    useEffect(() => {
      const subscription = webSocketClient?.subscribe(`/topic/likes/${post.id}`, (message) => {
        console.log("WebSocket received likes update:", message.body);
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
      const subscription = webSocketClient?.subscribe(
        `/topic/comments/${post.id}/delete`,
        (message) => {
          const comment = JSON.parse(message.body);
          setComments((prev) => {
            return prev.filter((c) => c.id !== comment.id);
          });
        }
      );
  
      return () => subscription?.unsubscribe();
    }, [post.id, webSocketClient]);

    useEffect(() => {
      const subscription = webSocketClient?.subscribe(`/topic/posts/${post.id}/delete`, () => {
        setPosts((prev) => prev.filter((p) => p.id !== post.id));
      });
      return () => subscription?.unsubscribe();
    }, [post.id, setPosts, webSocketClient]);

    useEffect(() => {
      const subscription = webSocketClient?.subscribe(`/topic/posts/${post.id}/edit`, (data) => {
        const post = JSON.parse(data.body);
        setPosts((prev) => prev.map((p) => (p.id === post.id ? post : p)));
      });
      return () => subscription?.unsubscribe();
    }, [post.id, setPosts, webSocketClient]);

    useEffect(() => {
      const fetchLikes = async () => {
        await request({
          endpoint: `/api/v1/feed/posts/${post.id}/likes`,
          onSuccess: (data) => {
            setLikes(data);
            setPostLiked(data.some((like) => like.id === user?.id));
          },
          onFailure: (error) => {
            console.error(error);
          },
        });
      };
      fetchLikes();
    }, [post.id, user?.id]);
   
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

    const deleteComment = async (id) => {
      await request({
        endpoint: `/api/v1/feed/comments/${id}`,
        method: "DELETE",
        onSuccess: () => {
          setComments((prev) => prev.filter((c) => c.id !== id));
        },
        onFailure: (error) => {
          console.error(error);
        },
      });
    };

    const editComment = async (id, content) => {
      await request({
        endpoint: `/api/v1/feed/comments/${id}`,
        method: "PUT",
        body: JSON.stringify({ content }),
        onSuccess: (data) => {
          setComments((prev) =>
            prev.map((c) => {
              if (c.id === id) {
                return data;
              }
              return c;
            })
          );
        },
        onFailure: (error) => {
          console.error(error);
        },
      });
    };

    // const deletePost = async (id) => {
    //   await request({
    //     endpoint: `/api/v1/feed/posts/${id}`,
    //     method: "DELETE",
    //     onSuccess: () => {
    //       setPosts((prev) => prev.filter((p) => p.id !== id));
    //     },
    //     onFailure: (error) => {
    //       console.error(error);
    //     },
    //   });
    // };

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

    const editPost = async (data) => {
      await request({
        endpoint: `/api/v1/feed/posts/${post.id}`,
        method: "PUT",
        body: data,
        contentType: "multipart/form-data",
        onSuccess: (data) => {
          setPosts((prev) =>
            prev.map((p) => 
              (p?.id === post?.id) ? data : p 
            )
          );
          setEditing(false);
          setShowMenu(false);
        },
        onFailure: (error) => {
          throw new Error(error);
        },
      });
    };

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
                src={
                  post.author.profilePicture
                    ? `${import.meta.env.VITE_API_URL}/api/v1/storage/${post.author.profilePicture}`
                    : "/avatar.svg"
                }
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
        {post.picture && <img src={`${import.meta.env.VITE_API_URL}/api/v1/storage/${post.picture}`} alt="" className="post-picture" />}
      
            
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
