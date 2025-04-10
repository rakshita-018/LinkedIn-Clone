import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { request } from "../../../../utils/api";
import { useAuthentication } from "../../../authentication/contexts/AuthenticationContextProvider";
import { Post } from "../../components/Post/Post";
import "./Post.css";
import { LeftSideBar } from "../../components/LeftSideBar/LeftSideBar";
import { RightSidebar } from "../../components/RightSideBar/RightSideBar";

export function PostPage() {
  const [posts, setPosts] = useState([]);
  const { id } = useParams();
  const { user } = useAuthentication();

  useEffect(() => {
    request({
      endpoint: `/api/v1/feed/posts/${id}`,
      onSuccess: (post) => setPosts([post]),
      onFailure: (error) => console.log(error),
    });
  }, [id]);

  return (
    <div className="notePost-root">
      <div className="notePost-left">
        <LeftSideBar user={user} />
      </div>
      <div className="notePost-center">
        {posts.length > 0 && <Post setPosts={setPosts} post={posts[0]} />}
      </div>
      <div className="notePost-right">
        <RightSidebar />
      </div>
    </div>
  );
}
