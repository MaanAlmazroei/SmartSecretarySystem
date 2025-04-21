import { db } from "./FirebaseConfig";
import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";

const usersCollection = collection(db, "users");

export const createUser = async (userId, userData) => {
  await setDoc(doc(usersCollection, userId), {
    ...userData,
    role: "user",
    notificationCounter: 0,
    lastUpdatedDate: serverTimestamp(),
  });
};

export const getUser = async (userId) => {
  const userDoc = await getDoc(doc(usersCollection, userId));
  return userDoc.exists() ? userDoc.data() : null;
};

export const getAllUsers = async () => {
  const snapshot = await getDocs(usersCollection);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updateUser = async (userId, updatedData) => {
  await updateDoc(doc(usersCollection, userId), {
    ...updatedData,
    lastUpdatedDate: serverTimestamp(),
  });
};

export const deleteUser = async (userId) => {
  await deleteDoc(doc(usersCollection, userId));
};

/* ===== TICKETS CRUD ===== */
const ticketsCollection = collection(db, "tickets");

export const createTicket = async (ticketData, userId) => {
  await addDoc(ticketsCollection, { ...ticketData, userId });
};

export const getTicket = async (ticketId) => {
  const ticketDoc = await getDoc(doc(ticketsCollection, ticketId));
  return ticketDoc.exists() ? ticketDoc.data() : null;
};

export const getAllTickets = async () => {
  const snapshot = await getDocs(ticketsCollection);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getUserAllTickets = async (userId) => {
  const q = query(ticketsCollection, where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updateTicket = async (ticketId, updatedData) => {
  await updateDoc(doc(ticketsCollection, ticketId), updatedData);
};

export const deleteTicket = async (ticketId) => {
  await deleteDoc(doc(ticketsCollection, ticketId));
};

/* ===== APPOINTMENTS CRUD ===== */
const appointmentsCollection = collection(db, "appointments");

export const createAppointment = async (appointmentData, userId) => {
  await addDoc(appointmentsCollection, { ...appointmentData, userId });
};

export const getAppointment = async (appointmentId) => {
  const appointmentDoc = await getDoc(
    doc(appointmentsCollection, appointmentId)
  );
  return appointmentDoc.exists() ? appointmentDoc.data() : null;
};

export const getAllAppointments = async () => {
  const snapshot = await getDocs(appointmentsCollection);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getUserAllAppointments = async (userId) => {
  const q = query(appointmentsCollection, where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updateAppointment = async (appointmentId, updatedData) => {
  await updateDoc(doc(appointmentsCollection, appointmentId), updatedData);
};

export const deleteAppointment = async (appointmentId) => {
  await deleteDoc(doc(appointmentsCollection, appointmentId));
};

/* ===== RESOURCES CRUD ===== */
const resourcesCollection = collection(db, "resources");

export const createResource = async (resourceData) => {
  await addDoc(resourcesCollection, resourceData);
};

export const getResource = async (resourceId) => {
  const resourceDoc = await getDoc(doc(resourcesCollection, resourceId));
  return resourceDoc.exists() ? resourceDoc.data() : null;
};

export const getAllResources = async () => {
  const snapshot = await getDocs(resourcesCollection);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updateResource = async (resourceId, updatedData) => {
  await updateDoc(doc(resourcesCollection, resourceId), updatedData);
};

export const deleteResource = async (resourceId) => {
  await deleteDoc(doc(resourcesCollection, resourceId));
};
