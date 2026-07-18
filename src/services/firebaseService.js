import {
  collection, doc, addDoc, updateDoc, deleteDoc, setDoc,
  getDocs, query, orderBy, serverTimestamp, onSnapshot, writeBatch, increment,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ─── Chat Sessions ────────────────────────────────────────────────────────────

function chatsRef(userId) {
  return collection(db, 'users', userId, 'chats');
}

function messagesRef(userId, chatId) {
  return collection(db, 'users', userId, 'chats', chatId, 'messages');
}

export async function createChat(userId, title = 'New Chat') {
  const docRef = await addDoc(chatsRef(userId), {
    title,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    messageCount: 0,
  });
  return docRef.id;
}

export async function getChats(userId) {
  const q = query(chatsRef(userId), orderBy('updatedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function subscribeToChats(userId, callback) {
  const q = query(chatsRef(userId), orderBy('updatedAt', 'desc'));
  return onSnapshot(q, snap => {
    const chats = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(chats);
  });
}

export async function updateChatTitle(userId, chatId, title) {
  await updateDoc(doc(db, 'users', userId, 'chats', chatId), {
    title,
    updatedAt: serverTimestamp(),
  });
}

export async function touchChat(userId, chatId) {
  await updateDoc(doc(db, 'users', userId, 'chats', chatId), {
    updatedAt: serverTimestamp(),
  });
}

export async function deleteChat(userId, chatId) {
  // Delete all messages first
  const msgSnap = await getDocs(messagesRef(userId, chatId));
  const batch = writeBatch(db);
  msgSnap.docs.forEach(d => batch.delete(d.ref));
  batch.delete(doc(db, 'users', userId, 'chats', chatId));
  await batch.commit();
}

export async function clearAllChats(userId) {
  const snap = await getDocs(chatsRef(userId));
  const batch = writeBatch(db);
  for (const chatDoc of snap.docs) {
    const msgSnap = await getDocs(messagesRef(userId, chatDoc.id));
    msgSnap.docs.forEach(d => batch.delete(d.ref));
    batch.delete(chatDoc.ref);
  }
  await batch.commit();
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export async function addMessage(userId, chatId, { role, content, provider, model }) {
  const msgRef = await addDoc(messagesRef(userId, chatId), {
    role,
    content,
    provider: provider || null,
    model: model || null,
    createdAt: serverTimestamp(),
  });
  // Touch the parent chat
  await updateDoc(doc(db, 'users', userId, 'chats', chatId), {
    updatedAt: serverTimestamp(),
  });
  // Increment user's total message usage
  if (role === 'user') {
    await updateDoc(doc(db, 'users', userId), {
      totalMessages: increment(1),
    }).catch(err => {
      // Ignore if document doesn't exist yet (though it should)
      console.warn("Could not increment usage:", err);
    });
  }
  return msgRef.id;
}

export async function getMessages(userId, chatId) {
  const q = query(messagesRef(userId, chatId), orderBy('createdAt', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function subscribeToMessages(userId, chatId, callback) {
  const q = query(messagesRef(userId, chatId), orderBy('createdAt', 'asc'));
  return onSnapshot(q, snap => {
    const messages = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(messages);
  });
}

// ─── Users & Admin ────────────────────────────────────────────────────────────

export async function updateUserProfile(user) {
  if (!user) return;
  const userRef = doc(db, 'users', user.uid);
  // We use setDoc with merge: true so we don't overwrite existing fields (like totalMessages)
  await setDoc(userRef, {
    email: user.email,
    displayName: user.displayName || user.email.split('@')[0],
    lastLogin: serverTimestamp(),
  }, { merge: true });
}

export async function getAllUsers() {
  const q = query(collection(db, 'users'), orderBy('lastLogin', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ─── Feedback ─────────────────────────────────────────────────────────────────

export async function submitFeedback(userId, userEmail, text) {
  const feedbackRef = collection(db, 'feedbacks');
  await addDoc(feedbackRef, {
    userId,
    userEmail,
    text,
    createdAt: serverTimestamp(),
  });
}

export async function getAllFeedbacks() {
  const q = query(collection(db, 'feedbacks'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
