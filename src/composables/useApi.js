import { initializeApp } from "firebase/app";
import { collection, getFirestore, doc, setDoc, getDocs, query, updateDoc, orderBy  } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBjWdz8bpYyQtiMd_OUGpNPiNFOzOGoUQo",
  authDomain: "craft-luharud-d3940.firebaseapp.com",
  projectId: "craft-luharud-d3940",
  storageBucket: "craft-luharud-d3940.appspot.com",
  messagingSenderId: "803196766128",
  appId: "1:803196766128:web:88ac1e715ba131dfddf875",
  measurementId: "G-S1YT50G4JJ",
};

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
        await updateDoc(doc(db, "materiales", id), data);
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
