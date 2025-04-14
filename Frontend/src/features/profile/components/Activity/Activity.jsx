import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { request } from "../../../../utils/api";
import { Post } from "../../../feed/components/Post/Post";
import "./Activity.css";

export function Activity({ user, authUser, id }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    request({
      endpoint: `/api/v1/feed/posts/user/${id}`,
      onSuccess: (data) => setPosts(data),
      onFailure: (error) => console.log(error),
    });
  }, [id]);

  return (
    <div className="activity-activity">
      <h2>Latest post</h2>
      <div className="activity-posts">
        {posts.length > 0 ? (
          <>
            <Post
              key={posts[posts.length - 1].id}
              post={posts[posts.length - 1]}
              setPosts={setPosts}
            />
            <Link className="activity-more" to={`/profile/${user?.id}/posts`}>
              See more
            </Link>
          </>
        ) : (
          <>
            {authUser?.id === user?.id
              ? "You have no posts yet."
              : "This user has no posts yet."}
          </>
        )}
      </div>
    </div>
  );
}
