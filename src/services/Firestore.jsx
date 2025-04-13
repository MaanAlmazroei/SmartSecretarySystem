import { db } from "./FirebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

// ==================== PERSON CRUD ====================
export const addPerson = async (personData) => {
  const docRef = await addDoc(collection(db, "persons"), {
    ...personData,
    notificationCounter: 0,
    registrationDate: serverTimestamp(),
    lastLoginDate: serverTimestamp(),
  });
  return docRef.id;
};

export const getPersons = async (filters = {}) => {
  let q = collection(db, "persons");

  if (filters.role) {
    q = query(q, where("role", "==", filters.role));
  }
  if (filters.email) {
    q = query(q, where("email", "==", filters.email));
  }

  q = query(q, orderBy("registrationDate", "desc"));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updatePerson = async (id, updatedData) => {
  const docRef = doc(db, "persons", id);
  await updateDoc(docRef, {
    ...updatedData,
    lastLoginDate: serverTimestamp(),
  });
};

export const incrementNotificationCounter = async (personId) => {
  const docRef = doc(db, "persons", personId);
  await updateDoc(docRef, {
    notificationCounter: increment(1),
    lastUpdatedDate: serverTimestamp(),
  });
};

// ==================== TICKET CRUD ====================
export const createTicket = async (ticketData) => {
  const docRef = await addDoc(collection(db, "tickets"), {
    ...ticketData,
    submissionDate: serverTimestamp(),
    lastUpdatedDate: serverTimestamp(),
    status: "open",
    rating: 0,
    feedback: "",
  });
  return docRef.id;
};

export const getTickets = async (filters = {}) => {
  let q = collection(db, "tickets");

  if (filters.status) {
    q = query(q, where("status", "==", filters.status));
  }
  if (filters.minRating) {
    q = query(q, where("rating", ">=", filters.minRating));
  }

  q = query(q, orderBy("submissionDate", "desc"));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    submissionDate: doc.data().submissionDate?.toDate() || null,
    lastUpdatedDate: doc.data().lastUpdatedDate?.toDate() || null,
  }));
};

export const updateTicketStatus = async (ticketId, newStatus) => {
  const docRef = doc(db, "tickets", ticketId);
  await updateDoc(docRef, {
    status: newStatus,
    lastUpdatedDate: serverTimestamp(),
  });
};

export const addTicketFeedback = async (ticketId, feedback, rating) => {
  const docRef = doc(db, "tickets", ticketId);
  await updateDoc(docRef, {
    feedback,
    rating,
    lastUpdatedDate: serverTimestamp(),
  });
};

// ==================== APPOINTMENT CRUD ====================
export const createAppointment = async (appointmentData) => {
  const docRef = await addDoc(collection(db, "appointments"), {
    ...appointmentData,
    createdAt: serverTimestamp(),
    lastUpdatedDate: serverTimestamp(),
    status: "scheduled",
    rating: 0,
    feedback: "",
  });
  return docRef.id;
};

export const getAppointmentsByDateRange = async (startDate, endDate) => {
  const q = query(
    collection(db, "appointments"),
    where("appointmentDate", ">=", startDate),
    where("appointmentDate", "<=", endDate),
    orderBy("appointmentDate", "asc")
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    appointmentDate: doc.data().appointmentDate?.toDate() || null,
  }));
};

export const updateAppointmentStatus = async (appointmentId, newStatus) => {
  const docRef = doc(db, "appointments", appointmentId);
  await updateDoc(docRef, {
    status: newStatus,
    lastUpdatedDate: serverTimestamp(),
  });
};

export const addAppointmentFeedback = async (
  appointmentId,
  feedback,
  rating
) => {
  const docRef = doc(db, "appointments", appointmentId);
  await updateDoc(docRef, {
    feedback,
    rating,
    lastUpdatedDate: serverTimestamp(),
  });
};

// ==================== COMMON OPERATIONS ====================
export const deleteDocument = async (collectionName, id) => {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
};

export const getDocumentById = async (collectionName, id) => {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists()
    ? {
        id: docSnap.id,
        ...docSnap.data(),
        // Convert Firestore timestamps to JS Date objects
        ...(docSnap.data().createdAt && {
          createdAt: docSnap.data().createdAt.toDate(),
        }),
        ...(docSnap.data().lastUpdatedDate && {
          lastUpdatedDate: docSnap.data().lastUpdatedDate.toDate(),
        }),
      }
    : null;
};
