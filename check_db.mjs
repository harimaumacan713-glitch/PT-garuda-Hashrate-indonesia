import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set, runTransaction } from "firebase/database";

const firebaseConfig = {
  databaseURL: "https://brusa-crypto-garuda-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function run() {
  const usersSnap = await get(ref(db, "users"));
  console.log("Users:", JSON.stringify(usersSnap.val(), null, 2));
  
  if (usersSnap.exists()) {
    const users = usersSnap.val();
    for (const uid in users) {
      const currentBal = users[uid].balance || 0;
      const newBal = currentBal + 100000;
      await set(ref(db, `users/${uid}/balance`), newBal);
      console.log(`Updated user ${uid} balance from ${currentBal} to ${newBal}`);
    }
  }
  process.exit(0);
}
run();
