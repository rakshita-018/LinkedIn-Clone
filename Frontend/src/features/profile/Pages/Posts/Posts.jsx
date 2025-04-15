import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usePageTitle } from "../../../../hooks/usePageTitle";
import { request } from "../../../../utils/api";
import { useAuthentication } from "../../../authentication/contexts/AuthenticationContextProvider";
import { Post } from "../../../feed/components/Post/Post";
import "./Posts.css";
import { LeftSideBar } from "../../../feed/components/LeftSideBar/LeftSideBar";
import { RightSidebar } from "../../../feed/components/RightSideBar/RightSideBar";
import { Loader } from "../../../../components/loader/Loader";

export function Posts() {
  const { id } = useParams();
  const [posts, setPosts] = useState([]);
  const { user: authUser } = useAuthentication();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  usePageTitle("Posts | " + (user?.firstName || "") + " " + (user?.lastName || ""));

  useEffect(() => {
    if (id === authUser?.id) {
      setUser(authUser);
      setLoading(false);
    } else {
      request({
        endpoint: `/api/v1/authentication/users/${id}`,
        onSuccess: (data) => {
          setUser(data);
          setLoading(false);
        },
        onFailure: (error) => console.log(error),
      });
    }
  }, [authUser, id]);

  useEffect(() => {
    request({
      endpoint: `/api/v1/feed/posts/user/${id}`,
      onSuccess: (data) => setPosts(data),
      onFailure: (error) => console.log(error),
    });
  }, [id]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="profilePosts">
      <div className="profilePosts-left">
        <LeftSideBar user={user} />
      </div>
      <div className="profilePosts-main">
        <h1>{user?.firstName + " " + user?.lastName + "'s posts"}</h1>
        {posts.map((post) => (
          <Post key={post.id} post={post} setPosts={setPosts} />
        ))}
        {posts.length === 0 && (
          <div className="profilePosts-empty">
            <p>No post to display.</p>
          </div>
        )}
      </div>
      <div className="profilePosts-right">
        <RightSidebar />
      </div>
    </div>
  );
}
