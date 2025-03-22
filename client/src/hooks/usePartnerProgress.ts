import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { app } from '../firebase';

interface PartnerProgress {
  currentDay: number;
  lastActivity: Date;
  partnerSyncStatus: 'pending' | 'synced' | 'waiting';
}

export const subscribeToPartnerProgress = (
  partnerId: string,
  onUpdate: (progress: PartnerProgress) => void
) => {
  const db = getFirestore(app);
  const progressRef = doc(db, 'journeyProgress', partnerId);

  return onSnapshot(progressRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      onUpdate({
        currentDay: data.currentDay,
        lastActivity: data.lastActivity.toDate(),
        partnerSyncStatus: data.partnerSyncStatus
      });
    }
  });
}; 