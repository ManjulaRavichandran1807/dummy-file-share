import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { auth, db, logout } from "./firebase";
import { query, collection, getDocs, where } from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  getStorage,
} from "firebase/storage";
import { Encrypt } from "./Encrypt";
import { Decrypt } from "./Decrypt";

function Dashboard() {
  const [user, loading] = useAuthState(auth);
  const [name, setName] = useState("");

  const [rsaKey, setRsaKey] = useState("");
  const [aesKey, setAesKey] = useState("");
  const [file, setFile] = useState("");

  const navigate = useNavigate();

  // Decryption form
  const initalState = {
    cipherText: "",
    pwd: "",
    privateKey: "",
  };

  const [form, setForm] = useState(initalState);

  const storage = getStorage();
  ref(storage, "files/uid");

  function handleChange(event) {
    setFile(event.target.files[0]);
  }

  const handleEncrypt = () => {
    const storageRef = ref(storage, "/files/" + file.name);
    uploadBytesResumable(storageRef, file);

    getDownloadURL(ref(storage, "/files/" + file.name))
      .then(async (url) => {
        const val = await Encrypt(url, aesKey, rsaKey);
        setForm({ ...form, cipherText: val });
      })
      .catch((error) => {
        console.error("Error in fetching url from firebase: " + error);
      });
  };

  const handleDecrypt = async () => {
    const decryptedUrl = await Decrypt(
      form.cipherText,
      form.pwd,
      form.privateKey
    );
    const img = document.getElementById("myimg");
    img.setAttribute("src", decryptedUrl);
  };

  const fetchUserName = async () => {
    try {
      const q = query(collection(db, "users"), where("uid", "==", user?.uid));
      const doc = await getDocs(q);
      const data = doc.docs[0].data();
      setName(data.name);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) return navigate("/");
    fetchUserName();
  }, [user, loading]);

  return (
    <div>
      <div className="header">
        <h1>Secure Image Sharing</h1>
        <p>Logged in as {name}</p>
        <button className="dashboard__btn" onClick={logout}>
          Logout
        </button>
      </div>
      <div className="dashboard" style={{ height: "100%" }}>
        <div className="dashboard__container">
          <h2> SEND </h2>

          <div className="upload__image-wrapper">
            <img
              id="myimg"
              src="https://www.lankabangla.com/wp-content/uploads/2019/08/no_image_png_935227.png"
              alt="After Decrypting"
              style={{ height: "60px", width: "70px" }}
            />
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
          </div>
        </div>
        <div className="dashboard__container1">
          <h2> RECEIVE </h2>

          <div className="upload__image-wrapper">
            <br />
            <br />
            <label> Select File to Decrypt : </label>
            <input type="text" value={form.cipherText} />
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
              onChange={(e) => setForm({ ...form, privateKey: e.target.value })}
              placeholder="Enter Key"
            />
            <br />
            <br />
            <button className="dashboard__btn1" onClick={handleDecrypt}>
              {" "}
              Decrypt File{" "}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
