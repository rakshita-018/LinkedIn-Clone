import { useState } from "react";
import "./Modal.css";
import { Button } from "../../../../components/Button/Button";
import { Input } from "../../../../components/input/Input";

export function Modal({ setShowModal, showModal, onSubmit, content, picture, title }) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!showModal) return null;

  return (
    <div className="modal-root">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button onClick={() => setShowModal(false)}>X</button>
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setIsLoading(true);
            const content = e.currentTarget.content.value;
            const picture = e.currentTarget.picture.value;

            if (!content) {
              setError("Content is required");
              setIsLoading(false);
              return;
            }

            try {
              await onSubmit(content, picture);
            } catch (error) {
              setError(error.message || "An error occurred. Please try again later.");
            } finally {
                setShowModal(false);
                setIsLoading(false);
            }
          }}
        >
          <div className="modal-body">
            <textarea
              placeholder="What do you want to talk about?"
              onFocus={() => setError("")}
              onChange={() => setError("")}
              name="content"
              maxLength={255}
              defaultValue={content}
            />
            <Input
              defaultValue={picture}
              onFocus={() => setError("")}
              onChange={() => setError("")}
              placeholder="Image URL (optional)"
              name="picture"
              style={{ marginBlock: 0 }}
            />
          </div>
          {error && <div className="modal-error">{error}</div>}
          <div className="modal-footer">
            <Button size="medium" type="submit" disabled={isLoading}>
              Post
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
