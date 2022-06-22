import CryptoJS from "crypto-js";
import FileSaver from "file-saver";
import { JSEncrypt } from "jsencrypt";

export const Decrypt = async(file, inputKey, inputKey1) => {
    console.log(file);
    console.log(inputKey);
    console.log(inputKey1);
    var decryption = new JSEncrypt();

    const callDecrypt=(arg)=>{
        console.log("Img-Base64:",arg); 
        console.log("AES Key",inputKey);
        console.log("RSA Key",inputKey1);
        decryption.setPrivateKey(inputKey1);
        const ct = CryptoJS.AES.decrypt(arg, inputKey).toString(CryptoJS.enc.Utf8);
        console.log("AES Done",ct);
        const rsaData = decryption.decrypt(ct);
        console.log("RSA Done",rsaData);
        //dataurl to image conversion
        var blob = new Blob([rsaData],{type:"image/jpeg"});
        console.log(blob);
        var blob1 = new Blob([rsaData], {type:"plain/text"});
        console.log(blob1);
        FileSaver.saveAs(blob,"decryptedFile.jpg");
        FileSaver.saveAs(blob1,"decrypt.txt");
    }

    let fread = new FileReader();
    fread.onloadend = () => {
        console.log(fread);
        callDecrypt(fread);
    }
    fread.readAsText(file);
    console.log("fread",fread);
}