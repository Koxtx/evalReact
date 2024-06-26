import { useContext } from "react";
import { UserContext } from "../../context/UserContext";
import React, { useEffect, useState } from "react";
import { toggleLike } from "../../apis/video";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import app from "../../firebase";

export default function Homepage() {
  const { user } = useContext(UserContext);
  const [video, setVideo] = useState(null);
  const [videoLink, setVideoLink] = useState("");
  const [videoProgress, setVideoProgress] = useState(0);
  const [allVideo, setAllVideo] = useState([]);
  const [titre, setTitre] = useState("");

  useEffect(() => {
    video && uploadFile(video);
  }, [video]);

  useEffect(() => {
    async function getVideos() {
      try {
        const response = await fetch("http://localhost:5000/api/videos");
        if (response.ok) {
          const videosFromApi = await response.json();
          setAllVideo(videosFromApi);
        }
      } catch (error) {
        console.error(error);
      }
    }
    getVideos();
  }, []);

  const uploadFile = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, "videos/" + fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setVideoProgress(Math.round(progress));
      },
      (error) => {
        console.error(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) =>
          setVideoLink(downloadUrl.toString())
        );
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          video: videoLink,
          titre: titre,
          user: user.username,
        }),
      });

      if (response.ok) {
        const newVideo = await response.json();
        setAllVideo([...allVideo, newVideo]);
        setVideo(null);
        setVideoLink("");
        setVideoProgress(0);
        setTitre("");
        document.getElementById("video").value = "";
        document.getElementById("titre").value = "";
      } else {
        console.error("Failed to add video", await response.text());
      }
    } catch (error) {
      console.error(error);
    }
  };

  function toggleLiked(video) {}

  const formatElapsedTime = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds > 3600) {
      return Math.floor(seconds / 3600) + " heures";
    } else if (seconds > 60) {
      return Math.floor(seconds / 60) + " minutes";
    } else {
      return seconds + " secondes";
    }
  };

  return (
    <main className="d-flex flex-row-reverse flex-fill mt-60">
      <div className="d-flex flex-column align-items-center flex-fill ">
        <h2>All videos</h2>
        <div
          className="d-flex flex-column-reverse card"
          style={{
            minWidth: "1200px",
            margin: "0 auto",
          }}
        >
          {allVideo &&
            allVideo.map((video) => (
              <div key={video._id} className="m-20">
                <video
                  src={video.videoUrl}
                  alt="video"
                  style={{
                    width: "300px",
                    maxHeight: "300px",
                    marginRight: "20px",
                  }}
                  controls
                ></video>

                <div className="d-flex flex-row align-items-center">
                  <p className="mr-15">{video.titre}</p>
                  {user ? (
                    <div className="center">
                      <i
                        onClick={toggleLiked}
                        className={`far fa-thumbs-up mr-25`}
                      >
                        {video.likes}
                      </i>
                      <i onClick={toggleLiked} className={`far fa-thumbs-down`}>
                        {video.dislikes}
                      </i>
                    </div>
                  ) : null}
                </div>
                <div className="d-flex flex-row align-items-center">
                  {user && (
                    <div className="mr-25">
                      <img
                        src={user.avatars}
                        alt="User Avatar"
                        className="mr-15"
                      />
                      <span>Posted by {video.user}</span>
                    </div>
                  )}

                  <span>
                    Ajoutée il y a {formatElapsedTime(video.createdAt)}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
      <div
        className="d-flex flex-column flex-fill align-items-center p-fixed"
        style={{ margin: "10px" }}
      >
        {user ? (
          <>
            <h2>Add Video</h2>
            <div className="d-flex center flex-column">
              <form onSubmit={handleSubmit} className="mb-20">
                <div className="d-flex flex-column mb-20">
                  <label htmlFor="video" className="mb-10">
                    Video :
                  </label>
                  {videoProgress > 0 ? "Uploading: " + videoProgress + "%" : ""}
                  <input
                    type="file"
                    id="video"
                    accept="video/*"
                    onChange={(e) => setVideo(() => e.target.files[0])}
                  />
                </div>
                <div className="d-flex flex-column mb-20">
                  <label htmlFor="titre" className="mb-10">
                    titre :
                  </label>
                  <input
                    type="text"
                    id="titre"
                    value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                  />
                </div>
                <button className="btn btn-primary">Upload</button>
              </form>{" "}
            </div>
          </>
        ) : (
          <>
            <p>Please login to add and like videos</p>
          </>
        )}
      </div>
    </main>
  );
}
