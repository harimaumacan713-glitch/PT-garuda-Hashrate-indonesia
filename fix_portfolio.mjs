import fs from 'fs';

let content = fs.readFileSync('src/pages/PortfolioPage.tsx', 'utf8');

// 1. Add imports
content = content.replace("import { useAuth } from '../contexts/AuthContext';", 
`import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { ref, onValue, set } from 'firebase/database';`);

// 2. Add state and effect
const oldVars = `export function PortfolioPage({ onOpenProfile }: { onOpenProfile?: () => void }) {
  const [activeTab, setActiveTab] = useState('PORTFOLIO');
  const { user } = useAuth();`;

const newVars = `export function PortfolioPage({ onOpenProfile }: { onOpenProfile?: () => void }) {
  const [activeTab, setActiveTab] = useState('PORTFOLIO');
  const { user } = useAuth();
  const [balance, setBalance] = React.useState<number>(0);

  React.useEffect(() => {
    if (user) {
      const balanceRef = ref(db, \`users/\${user.uid}/balance\`);
      const unsubscribe = onValue(balanceRef, (snapshot) => {
        if (snapshot.exists()) {
          setBalance(snapshot.val());
        } else {
          // Initialize balance to 10,000,000 if it doesn't exist
          const initialBalance = 10000000;
          set(balanceRef, initialBalance).catch(console.error);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);`;

content = content.replace(oldVars, newVars);

fs.writeFileSync('src/pages/PortfolioPage.tsx', content);
