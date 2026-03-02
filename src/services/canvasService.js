import { db } from './firebase';
import { collection, addDoc, updateDoc, doc, onSnapshot, getDoc, setDoc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';

export const canvasService = {
  async saveCanvas(canvasData) {
    try {
      // Strip undefined values — Firestore rejects them
      const clean = JSON.parse(JSON.stringify(canvasData));
      const docRef = await addDoc(collection(db, 'canvases'), {
        ...clean,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Canvas created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error saving canvas:', error);
      throw error;
    }
  },

  async updateCanvas(canvasId, canvasData) {
    try {
      // Strip undefined values — Firestore rejects them
      const clean = JSON.parse(JSON.stringify(canvasData));
      const canvasRef = doc(db, 'canvases', canvasId);
      await updateDoc(canvasRef, {
        ...clean,
        updatedAt: new Date()
      });
      console.log('Canvas updated:', canvasId);
    } catch (error) {
      console.error('Error updating canvas:', error);
      throw error;
    }
  },

  subscribeToCanvas(canvasId, callback) {
    const canvasRef = doc(db, 'canvases', canvasId);
    return onSnapshot(canvasRef, (doc) => {
      if (doc.exists()) {
        console.log('Canvas snapshot received');
        callback({ id: doc.id, ...doc.data() });
      } else {
        console.log('Canvas document does not exist');
      }
    });
  },

  async getCanvas(canvasId) {
    try {
      const canvasRef = doc(db, 'canvases', canvasId);
      const canvasDoc = await getDoc(canvasRef);
      if (canvasDoc.exists()) {
        console.log('Canvas fetched:', canvasDoc.id);
        return { id: canvasDoc.id, ...canvasDoc.data() };
      } else {
        console.log('Canvas not found');
        return null;
      }
    } catch (error) {
      console.error('Error getting canvas:', error);
      throw error;
    }
  },

  // ── Presence ──────────────────────────────────────────────────────────────
  async joinPresence(canvasId, user) {
    const ref = doc(db, 'canvases', canvasId, 'presence', user.uid);
    await setDoc(ref, {
      uid:         user.uid,
      displayName: user.displayName || null,
      email:       user.email       || null,
      photoURL:    user.photoURL    || null,
      joinedAt:    new Date(),
    });
    return ref;
  },

  async leavePresence(canvasId, uid) {
    try {
      await deleteDoc(doc(db, 'canvases', canvasId, 'presence', uid));
    } catch (_) { /* ignore */ }
  },

  subscribeToPresence(canvasId, callback) {
    return onSnapshot(
      collection(db, 'canvases', canvasId, 'presence'),
      (snap) => callback(snap.docs.map(d => d.data()))
    );
  },

  // ── Comments ──────────────────────────────────────────────────────────────
  async addComment(canvasId, commentData) {
    const ref = collection(db, 'canvases', canvasId, 'comments');
    await addDoc(ref, {
      ...commentData,
      createdAt: serverTimestamp(),
    });
  },

  async resolveComment(canvasId, commentId, resolved) {
    const ref = doc(db, 'canvases', canvasId, 'comments', commentId);
    await updateDoc(ref, { resolved });
  },

  subscribeToComments(canvasId, callback) {
    const q = query(
      collection(db, 'canvases', canvasId, 'comments'),
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  },
};