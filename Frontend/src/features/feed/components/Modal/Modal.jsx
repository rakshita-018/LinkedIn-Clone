import { useRef, useState } from "react";
import "./Modal.css";
import { Button } from "../../../../components/Button/Button";
import { Input } from "../../../../components/input/Input";

export function Modal({ setShowModal, showModal, onSubmit, content, picture, title }) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState(picture);
  const textareaRef = useRef(null);
  const [file, setFile] = useState();

  if (!showModal) return null;

  function handleImageChange(e) {
    setError("");
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    setFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };

    reader.readAsDataURL(file);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const content = e.currentTarget.content.value;
    const formData = new FormData();

    if (file) {
      formData.append("picture", file);
    }

    if (!content) {
      setError("Content is required");
      setIsLoading(false);
      return;
    }

    formData.append("content", content);

    try {
      await onSubmit(formData);
      setPreview(undefined);
      setShowModal(false);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An error occurred. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-root">
      <div className="modal-modal">
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={() => setShowModal(false)}>X</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <textarea
              placeholder="What do you want to talk about?"
              onFocus={() => setError("")}
              onChange={() => setError("")}
              name="content"
              ref={textareaRef}
              defaultValue={content}
            />
            {!preview ? (
              <Input
                onFocus={() => setError("")}
                accept="image/*"
                onChange={(e) => handleImageChange(e)}
                placeholder="Image URL (optional)"
                name="picture"
                type="file"
                style={{
                  marginBlock: 0,
                }}
              />
            ) : (
              <div className="modal-preview">
                <button
                  className="modal-cancel"
                  type="button"
                  onClick={() => {
                    setPreview(undefined);
                  }}
                >
                  X
                </button>
                <img src={preview} alt="Preview" className="modal-preview" />
              </div>
            )}
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


