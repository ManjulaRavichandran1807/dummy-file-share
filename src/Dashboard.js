import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { auth, db, logout } from "./firebase";
import { query, collection, getDocs, where } from "firebase/firestore";
import ImageUploading from "react-images-uploading";
import { storage } from "./firebase";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  getStorage,
  listAll,
} from "firebase/storage";
import { Encrypt } from "./Encrypt";
import { Decrypt } from "./Decrypt";

function Dashboard() {
  const [user, loading] = useAuthState(auth);
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const [images, setImages] = React.useState([]);
  const [rsaKey, setRsaKey] = useState("");
  const [aesKey, setAesKey] = useState("");

  // Decryption form
  const initalState = {
    imgUrl: "",
    pwd: "",
    privateKey: "",
  };

  const [form, setForm] = useState(initalState);

  const maxNumber = 69;
  const [file, setFile] = useState("");
  const [data, setData] = useState("");
  const [inputKey, setInputKey] = useState("");
  const [percent, setPercent] = useState(0);
  const storage = getStorage();
  const listRef = ref(storage, "files/uid");

  const onChange = (imageList, addUpdateIndex) => {
    console.log(imageList, addUpdateIndex);
    setImages(imageList);
  };

  function handleChange(event) {
    setFile(event.target.files[0]);
  }

  const handleEncrypt = () => {
    let enc = Encrypt(file, aesKey, rsaKey);
    alert(images[0]);
    const storageRef = ref(storage, "/files/" + file.name);
    const uploadTask = uploadBytesResumable(storageRef, enc);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setPercent(percent);
      },
      (err) => console.log(err),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          console.log({ url });
        });
      }
    );
  };

  const handleDecrypt = () => {
    Decrypt(form.imgUrl, form.privateKey, form.pwd);
  };

  const fetchUserName = async () => {
    try {
      const q = query(collection(db, "users"), where("uid", "==", user?.uid));
      const doc = await getDocs(q);
      const data = doc.docs[0].data();
      setName(data.name);
    } catch (err) {
      console.error(err);
      //alert("An error occured while fetching user data");
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) return navigate("/");
    fetchUserName();
  }, [user, loading]);

  return (
    <>
      <div className="header">
        <h1>Secure Image Sharing</h1>
        <p>Logged in as {name}</p>
        <button className="dashboard__btn" onClick={logout}>
          Logout
        </button>
      </div>
      <div className="dashboard">
        <div className="dashboard__container">
          <h2> SEND </h2>

          <ImageUploading
            multiple
            value={images}
            onChange={onChange}
            maxNumber={maxNumber}
            dataURLKey="data_url"
          >
            {({
              imageList,
              onImageUpload,
              onImageRemoveAll,
              onImageUpdate,
              onImageRemove,
              isDragging,
              dragProps,
            }) => (
              <div className="upload__image-wrapper">
                <button
                  className="dashboard__btn1"
                  style={isDragging ? { color: "red" } : undefined}
                  onClick={onImageUpload}
                  {...dragProps}
                >
                  Preview Image
                </button>
                <br />
                <br />
                <label> Select File to Encrypt : </label>
                <input
                  type="file"
                  id="img"
                  onChange={handleChange}
                  accept=".jpeg, .png, .jpg"
                />
                <br />
                <label> Enter Password : </label>
                <input
                  type="text"
                  id="ekey"
                  value={aesKey}
                  onChange={(e) => setAesKey(e.target.value)}
                  placeholder="Enter AES Key"
                />
                <br />
                <label> Enter Public Key : </label>
                <input
                  type="text"
                  id="ekey1"
                  value={rsaKey}
                  onChange={(e) => setRsaKey(e.target.value)}
                  placeholder="Enter RSA Key"
                />
                <br />
                <br />
                <button className="dashboard__btn1" onClick={handleEncrypt}>
                  {" "}
                  Encrypt File{" "}
                </button>
                {/*<p>{percent}% Encrypt Complete</p>
                   <button className="dashboard__btn1" onClick={handleUpload}> Upload </button>
                  <p>{percent}% Upload Complete</p>
                  <br />
                  {imageList.map((image, index) => (
                    <div key={index} className="image-item">
                      <img src={image['data_url']} alt="" width="100" />
                      <div className="image-item__btn-wrapper">
                        <button onClick={() => onImageUpdate(index)}>Update</button>
                        <button onClick={() => onImageRemove(index)}>Remove</button>
                      </div>
                    </div>
                  ))} */}
              </div>
            )}
          </ImageUploading>
        </div>
        <div className="dashboard__container1">
          <h2> RECEIVE </h2>

          <ImageUploading
            multiple
            value={images}
            onChange={onChange}
            maxNumber={maxNumber}
            dataURLKey="data_url"
          >
            {({
              imageList,
              onImageUpload,
              onImageRemoveAll,
              onImageUpdate,
              onImageRemove,
              isDragging,
              dragProps,
            }) => (
              <div className="upload__image-wrapper">
                <button
                  className="dashboard__btn1"
                  style={isDragging ? { color: "red" } : undefined}
                  onClick={onImageUpload}
                  {...dragProps}
                >
                  Preview Image
                </button>
                <br />
                <br />
                <label> Select File to Decrypt : </label>
                <input
                  type="text"
                  value={form.imgUrl}
                  onChange={(e) => setForm({ ...form, imgUrl: e.target.value })}
                />
                <br />
                <label> Enter Password : </label>
                <input
                  type="text"
                  id="dkey"
                  value={form.pwd}
                  onChange={(e) => setForm({ ...form, pwd: e.target.value })}
                  placeholder="Enter Key"
                />
                <br />
                <label> Enter Private Key : </label>
                <input
                  type="text"
                  id="dkey1"
                  value={form.privateKey}
                  onChange={(e) =>
                    setForm({ ...form, privateKey: e.target.value })
                  }
                  placeholder="Enter Key"
                />
                <br />
                <br />
                <button className="dashboard__btn1" onClick={handleDecrypt}>
                  {" "}
                  Decrypt File{" "}
                </button>
                {/*<p>{percent}% Decrypt Complete</p>
                   <button className="dashboard__btn1" onClick={handleDownload}> Download </button>
                  <p>{percent}% Download Complete</p>
                  <br />
                  {imageList.map((image, index) => (
                    <div key={index} className="image-item">
                      <img src={image['data_url']} alt="" width="100" />
                      <div className="image-item__btn-wrapper">
                        <button onClick={() => onImageUpdate(index)}>Update</button>
                        <button onClick={() => onImageRemove(index)}>Remove</button>
                      </div>
                    </div>
                  ))} */}
              </div>
            )}
          </ImageUploading>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
