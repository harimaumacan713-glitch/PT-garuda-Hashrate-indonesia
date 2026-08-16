import { useEffect } from 'react';
import { db } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';
import { useNotification } from '../contexts/NotificationContext';
import { creditDepositToUser } from '../lib/depositManager';

export function useDepositListener(activeUid: string | null | undefined) {
  const { showPushNotification } = useNotification();

  useEffect(() => {
    if (!activeUid) return;

    // 1. Listen to all depositTransactions for this user
    const depositsRef = ref(db, 'depositTransactions');
    const unsubscribeDeposits = onValue(depositsRef, async (snapshot) => {
      if (!snapshot.exists()) return;
      const allDeposits = snapshot.val();
      
      for (const [txId, txData] of Object.entries<any>(allDeposits)) {
        if (!txData) continue;
        
        // Match receiver UID and check if completed
        const isReceiver = txData.receiverUid === activeUid || txData.userId === activeUid;
        const isCompleted = txData.status === 'completed' || txData.status === 'sukses' || txData.status === 'success';
        const amount = Number(txData.amount) || Number(txData.nominal) || 0;

        if (isReceiver && isCompleted && !txData.credited && amount > 0) {
          const credited = await creditDepositToUser(
            activeUid,
            txId,
            amount,
            {
              description: txData.description || 'Deposit QR Bank Jago (Sukses)',
              source: txData.source || 'bank_jago',
              completedAt: txData.completedAt || txData.createdAt || Date.now()
            },
            () => {
              showPushNotification({
                title: 'Deposit Dana Berhasil',
                message: `Deposit saldo sebesar Rp ${amount.toLocaleString('id-ID')} dari Bank Jago QR telah masuk ke akun Anda.`,
                type: 'deposit',
                amount: amount
              });
            }
          );

          if (credited) {
            console.log(`[DepositListener] Credited exactly Rp ${amount} for tx: ${txId}`);
          }
        }
      }
    });

    // 2. Listen to Project 2's specific path: pengguna/{activeUid}/transaksi
    const jagoTxRef = ref(db, `pengguna/${activeUid}/transaksi`);
    const unsubscribeJago = onValue(jagoTxRef, async (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.val();
      
      for (const [txId, txData] of Object.entries<any>(data)) {
        if (!txData) continue;
        const isDeposit = txData.type === 'deposit' || txData.type === 'topup' || txData.type === 'terima';
        const isSuccess = txData.status === 'completed' || txData.status === 'sukses' || txData.status === 'success';
        const isNotCredited = !txData.creditedToGaruda;
        const amount = Number(txData.amount) || Number(txData.nominal) || Number(txData.jumlah) || 0;

        if (isDeposit && isSuccess && isNotCredited && amount > 0) {
          const credited = await creditDepositToUser(
            activeUid,
            txId,
            amount,
            {
              description: 'Deposit Masuk dari Bank Jago',
              source: 'bank_jago',
              completedAt: txData.timestamp || Date.now()
            },
            () => {
              showPushNotification({
                title: 'Deposit Dana Berhasil',
                message: `Deposit saldo sebesar Rp ${amount.toLocaleString('id-ID')} dari Bank Jago telah masuk ke akun Anda.`,
                type: 'deposit',
                amount: amount
              });
            }
          );

          if (credited) {
            console.log(`[DepositListener] Credited exactly Rp ${amount} from Jago tx: ${txId}`);
          }
        }
      }
    });

    return () => {
      unsubscribeDeposits();
      unsubscribeJago();
    };
  }, [activeUid, showPushNotification]);
}
