import CryptoJS from "crypto-js";
import FileSaver from "file-saver";
import { JSEncrypt } from "jsencrypt";

export const Encrypt = async (file, inputKey, inputKey1) => {
  console.log(file);
  console.log(inputKey);
  console.log(inputKey1);
  var encryption1 = new JSEncrypt();
  var decryption = new JSEncrypt();
  // let base64String = "";
  // const getBase64StringFromDataURL = (dataURL) =>
  // dataURL.replace('data:', '').replace(/^.+,/, '');

  let fread = new FileReader();
  fread.onloadend = () => {
    console.log(fread.result);
    // base64String = getBase64StringFromDataURL(fread.result);
    // console.log(base64String);
  };
  fread.readAsDataURL(file);
  console.log("fread", fread);

  console.log("Img-Base64:", file);
  console.log("AES Key", inputKey);
  console.log("RSA Key", inputKey1);
  encryption1.setPublicKey(inputKey1);
  const rsaData = encryption1.encrypt(fread.result);
  console.log(
    "RSA Done",
    decryption.decrypt(rsaData) + " Original val " + file
  );

  const ct = CryptoJS.AES.encrypt(rsaData, inputKey);
  console.log("AES Done", ct);
  const ctstr = ct.toString();
  console.log("String", ctstr);
  // var blob = new Blob([ctstr],{type:"image/jpeg"});
  // console.log(blob);
  var blob1 = new Blob([ctstr], { type: "plain/text" });
  FileSaver.saveAs(blob1, "encrypt.txt");
  console.log(blob1);
  return blob1;
  // FileSaver.saveAs(blob,"encryptedFile.jpg");
};
