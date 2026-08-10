import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";

const firebaseConfig = {
  databaseURL: "https://brusa-crypto-garuda-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function check() {
  try {
    const rootRef = ref(db, '/');
    const snapshot = await get(rootRef);
    if (snapshot.exists()) {
      console.log(JSON.stringify(snapshot.val(), null, 2));
    } else {
      console.log("No data available");
    }
  } catch (error) {
    console.error(error);
  }
  process.exit(0);
}
check();
