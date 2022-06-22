import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Link, useNavigate } from "react-router-dom";
import {
  auth,
  registerWithEmailAndPassword,
  signInWithGoogle,
} from "./firebase";
import "./Register.css";
import FileSaver from "file-saver";
import { JSEncrypt } from "jsencrypt";


function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  

  const register = () => {
    const crypt = new JSEncrypt({default_key_size: 4096});
    const PublicPrivateKey ={
      PublicKey: crypt.getPublicKey(),
      PrivateKey: crypt.getPrivateKey()
    };
    const publicKey = PublicPrivateKey.PublicKey;
    const publicK = new Blob([publicKey], {type:"text/plain"});
    console.log(publicK);
    FileSaver.saveAs(publicK,"publicKey.txt");
    const privateKey = PublicPrivateKey.PrivateKey;
    const privateK = new Blob([privateKey], {type:"text/plain"});
    console.log(privateK);
    FileSaver.saveAs(privateK,"privateKey.txt");

    if (!name) alert("Please enter name");
    registerWithEmailAndPassword(name, email, password);
  };

  useEffect(() => {
    if (loading) return;
    if (user) navigate("/dashboard");
  }, [user, loading]);

  return (
    <div className="register">
      <div className="register__container">
        <input
          type="text"
          className="register__textBox"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
        />
        <input
          type="text"
          className="register__textBox"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail Address"
        />
        <input
          type="password"
          className="register__textBox"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button className="register__btn" onClick={register}>
          Register
        </button>
        <button
          className="register__btn register__google"
          onClick={signInWithGoogle}
        >
          Register with Google
        </button>

        <div>
          Already have an account? <Link to="/">Login</Link> now.
        </div>
      </div>
    </div>
  );
}

export default Register;
