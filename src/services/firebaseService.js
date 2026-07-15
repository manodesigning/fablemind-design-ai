import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, query, orderBy, serverTimestamp, onSnapshot, writeBatch,
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
