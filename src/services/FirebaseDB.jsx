import { db } from "./FirebaseConfig";
import {
  collection,
  addDoc,
  setDoc,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

// ==================== USER CRUD ====================
export const addUser = async (userData) => {
  const userRef = doc(db, "users", userData.id);
  try {
    const user = await setDoc(userRef, {
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      role: "user",
      notificationCounter: 0,
      lastUpdatedDate: serverTimestamp(),
    });
    return user;
  } catch (error) {
    console.error(error.message);
  }
};

export const getUser = async (id) => {
  try {
    const docRef = doc(db, "users", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.log("No such user!");
      return null;
    }
  } catch (error) {
    console.error("Error getting user:", error.message);
    throw error;
  }
};
export const updateUser = async (id, updatedData) => {
  const docRef = doc(db, "users", id);
  await updateDoc(docRef, {
    ...updatedData,
  });
};

export const deleteUser = async () => {};

// ==================== TICKET CRUD ====================
export const createTicket = async (ticketData) => {
  const docRef = await addDoc(collection(db, "tickets"), {
    title: ticketData.title,
    issueDescription: ticketData.issueDescription,
    issueDate: serverTimestamp(),
    status: "open",
    feedback: "",
    rating: 0,
    lastUpdatedDate: serverTimestamp(),
  });
  return docRef;
};

// ==================== APPOINTMENT CRUD ====================
export const createAppointment = async (appointmentData) => {
  const docRef = await addDoc(collection(db, "appointments"), {
    appointmentDate: appointmentData.appointmentDate,
    reason: appointmentData.reason,
    status: "scheduled",
    feedback: "",
    rating: 0,
    lastUpdatedDate: serverTimestamp(),
  });
  return docRef.id;
};

// ==================== RESOURCE CRUD ====================
export const createResource = async (resourceData) => {
  const docRef = await addDoc(collection(db, "resources"), {
    title: resourceData.title,
    description: resourceData.description,
    type: resourceData.type,
    lastUpdatedDate: serverTimestamp(),
  });
  return docRef.id;
};

// ==================== COMMON OPERATIONS ====================
export const deleteDocument = async (collectionName, id) => {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
};

export const getDocumentById = async (collectionName, id) => {};
