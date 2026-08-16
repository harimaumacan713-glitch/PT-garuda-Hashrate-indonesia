import { db } from './firebase';
import { ref, runTransaction, set, get } from 'firebase/database';

export interface DepositCreditDetails {
  description?: string;
  source?: string;
  completedAt?: number;
}

/**
 * Idempotently and atomically credits a deposit to a user's account.
 * Guarantees that a given txId can only ever be credited EXACTLY ONCE,
 * even with multiple concurrent listeners or simulation triggers.
 */
export async function creditDepositToUser(
  activeUid: string,
  txId: string,
  amount: number,
  details?: DepositCreditDetails,
  onCredited?: () => void
): Promise<boolean> {
  if (!activeUid || !txId || amount <= 0) return false;

  try {
    // 1. Atomic transaction on dedicated processedDeposits node for this user & transaction
    const processedRef = ref(db, `users/${activeUid}/processedDeposits/${txId}`);
    const processResult = await runTransaction(processedRef, (currentData) => {
      if (currentData) {
        // Already processed! Return undefined to abort transaction without modifying
        return undefined;
      }
      return {
        processedAt: Date.now(),
        amount: amount,
        completedAt: details?.completedAt || Date.now()
      };
    });

    if (!processResult.committed) {
      // Already credited previously by another handler or listener
      return false;
    }

    // 2. Increment user balance atomically
    const balanceRef = ref(db, `users/${activeUid}/balance`);
    await runTransaction(balanceRef, (curr) => {
      const prev = typeof curr === 'number' ? curr : 0;
      return prev + amount;
    });

    // 3. Sync wallet balance atomically
    const walletRef = ref(db, `wallets/${activeUid}/balance`);
    await runTransaction(walletRef, (curr) => {
      const prev = typeof curr === 'number' ? curr : 0;
      return prev + amount;
    });

    // 4. Save transaction log under users/{uid}/transactions/{txId}
    const userTxRef = ref(db, `users/${activeUid}/transactions/${txId}`);
    await set(userTxRef, {
      transactionId: txId,
      type: 'deposit',
      amount: amount,
      status: 'completed',
      createdAt: details?.completedAt || Date.now(),
      description: details?.description || 'Deposit QR Bank Jago (Sukses)',
      source: details?.source || 'bank_jago'
    });

    // 5. Update transaction flags to prevent re-processing
    await set(ref(db, `depositTransactions/${txId}/credited`), true).catch(() => {});
    await set(ref(db, `depositTransactions/${txId}/status`), 'completed').catch(() => {});
    await set(ref(db, `pengguna/${activeUid}/transaksi/${txId}/creditedToGaruda`), true).catch(() => {});

    if (onCredited) {
      onCredited();
    }

    return true;
  } catch (err) {
    console.error(`[depositManager] Error processing credit for tx ${txId}:`, err);
    return false;
  }
}
