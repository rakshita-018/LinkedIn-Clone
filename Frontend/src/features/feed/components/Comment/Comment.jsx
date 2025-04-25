import { useNavigate } from "react-router-dom";
import "./Comment.css";
import { useState } from "react";
import { useAuthentication } from "../../../authentication/contexts/AuthenticationContextProvider";
import { Input } from "../../../../components/input/Input";
import { TimeAgo } from "../TimeAgo/TimeAgo";

export function Comment({ comment, deleteComment, editComment }) {
    const navigate = useNavigate();
    const [showActions, setShowActions] = useState(false);
    const [editing, setEditing] = useState(false);
    const [commentContent, setCommentContent] = useState(comment.content);
    const { user } = useAuthentication();
  
    return (
      <div key={comment.id} className="comment-root">
        {!editing ? (
          <>
            <div className="comment-header">
              <button
                onClick={() => navigate(`/profile/${comment.author.id}`)}
                className="comment-author"
              >
                <img
                  className="comment-avatar"
                  src={comment.author.profilePicture || "/avatar.svg"}
                  alt=""
                />
                <div>
                  <div className="comment-name">
                    {comment.author.firstName + " " + comment.author.lastName}
                  </div>
                  <div className="comment-title">
                    {comment.author.position + " at " + comment.author.company}
                  </div>
                  <TimeAgo date={comment.creationDate} edited={!!comment.updatedDate} />                
                </div>
              </button>
              {comment.author.id === user?.id && (
                <button
                  className={`comment-action ${showActions ? "active" : ""}`}
                  onClick={() => setShowActions(!showActions)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 512">
                    <path d="M64 360a56 56 0 1 0 0 112 56 56 0 1 0 0-112zm0-160a56 56 0 1 0 0 112 56 56 0 1 0 0-112zM120 96A56 56 0 1 0 8 96a56 56 0 1 0 112 0z" />
                  </svg>
                </button>
              )}
              {showActions && (
                <div className="comment-actions">
                  <button onClick={() => setEditing(true)}>Edit</button>
                  <button onClick={() => deleteComment(comment.id)}>Delete</button>
                </div>
              )}
            </div>
            <div className="comment-content">{comment.content}</div>
          </>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await editComment(comment.id, commentContent);
              setEditing(false);
              setShowActions(false);
            }}
          >
            <Input
              type="text"
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Edit your comment"
            />
          </form>
        )}
      </div>
    );
  }