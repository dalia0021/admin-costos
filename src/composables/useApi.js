import { initializeApp } from "firebase/app";
import { collection, getFirestore, doc, setDoc, getDocs, query, updateDoc, orderBy  } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.APP_APIKEY,
  authDomain: process.env.APP_AUTHDOMAIN,
  projectId: process.env.APP_PROJECTID,
  storageBucket: process.env.APP_STORAGEBUCKET,
  messagingSenderId: process.env.APP_MESSAGINGSENDERID,
  appId: process.env.APP_APPID,
  measurementId: process.env.APP_MEASUREMENTID,
};

console.log( process.env.APP_PROJECTID, process.env.APP_APIKEY)

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore();

export const useApi = () => {
  const getMaterialList = async () => {
    let items = [];
    const data = await getDocs(query(collection(db, "materiales"),orderBy("id", "asc")));
    data.forEach((item) => {
      items.push({id: item.id, ...item.data()});
    });
    return items;
  };

  const addMaterial = async (data) => {
    try { 
        await setDoc(doc(db, "materiales", data.id.toString()), data);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
  }

  const updateMaterial = async (id, data) => {
    try {
        await updateDoc(doc(db, "materiales", id.toString()), data);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
  };

  return {
    getMaterialList,
    addMaterial,
    updateMaterial,
  };
};
