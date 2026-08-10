import fs from 'fs';

let content = fs.readFileSync('src/pages/WithdrawPage.tsx', 'utf8');

// 1. Add imports
content = content.replace("import { motion, AnimatePresence } from 'motion/react';", 
`import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { ref, get, set, serverTimestamp, runTransaction, push } from 'firebase/database';`);

// 2. Replace state and variables
const oldVars = `  const [amount, setAmount] = useState('');
  const [withdrawAll, setWithdrawAll] = useState(false);
  const [step, setStep] = useState<'input' | 'confirm' | 'process'>('input');
  const withdrawableBalance = 50000;`;

const newVars = `  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [withdrawAll, setWithdrawAll] = useState(false);
  const [step, setStep] = useState<'input' | 'confirm' | 'process'>('input');
  const [withdrawableBalance, setWithdrawableBalance] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      const balanceRef = ref(db, \`users/\${user.uid}/balance\`);
      get(balanceRef).then((snapshot) => {
        if (snapshot.exists()) {
          setWithdrawableBalance(snapshot.val());
        } else {
          const initialBalance = 10000000;
          set(balanceRef, initialBalance);
          setWithdrawableBalance(initialBalance);
        }
      }).catch(console.error);
    }
  }, [user]);`;

content = content.replace(oldVars, newVars);

// 3. Replace handleLanjut and handleWithdraw
const oldHandlers = `  const handleLanjut = () => {
    if (amount && parseInt(amount.replace(/,/g, '')) >= 10000) {
      setStep('confirm');
    }
  };

  const handleWithdraw = () => {
    setStep('process');
  };`;

const newHandlers = `  const handleLanjut = () => {
    const numericAmount = parseInt(amount.replace(/,/g, ''));
    if (amount && numericAmount >= 10000 && numericAmount <= withdrawableBalance) {
      setStep('confirm');
      setErrorMsg(null);
    } else if (numericAmount > withdrawableBalance) {
      setErrorMsg('Saldo tidak mencukupi');
    }
  };

  const handleWithdraw = async () => {
    if (!user || isProcessing) return;
    const numericAmount = parseInt(amount.replace(/,/g, ''));
    if (numericAmount > withdrawableBalance || numericAmount < 10000) return;
    
    setIsProcessing(true);
    setErrorMsg(null);
    
    try {
      const userBalanceRef = ref(db, \`users/\${user.uid}/balance\`);
      
      const transactionResult = await runTransaction(userBalanceRef, (currentBalance) => {
        if (currentBalance === null) return currentBalance;
        if (currentBalance >= numericAmount) {
          return currentBalance - numericAmount;
        } else {
          return undefined; 
        }
      });

      if (transactionResult.committed) {
        const transactionsRef = ref(db, 'transactions');
        const newTxRef = push(transactionsRef);
        await set(newTxRef, {
          userId: user.uid,
          transactionId: newTxRef.key,
          type: "withdraw",
          source: "garuda_inves",
          destination: "jago",
          amount: numericAmount,
          status: "completed",
          createdAt: serverTimestamp()
        });
        
        setWithdrawableBalance(transactionResult.snapshot.val());
        setStep('process');
      } else {
        setErrorMsg('Penarikan gagal, saldo tidak mencukupi.');
        setStep('input');
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Terjadi kesalahan jaringan.');
      setStep('input');
    } finally {
      setIsProcessing(false);
    }
  };`;

content = content.replace(oldHandlers, newHandlers);

// 4. Update the display of Rp50,000 to use withdrawableBalance
content = content.replace(
  /<span className="text-lg font-bold text-\[#00B26A\]">\s*Rp50,000\s*<\/span>/,
  '<span className="text-lg font-bold text-[#00B26A]">Rp{withdrawableBalance.toLocaleString(\'en-US\')}</span>'
);

// Add error message display right below Amount Input
const amountInputRegex = /(<div className="px-4 mb-4">[\s\S]*?<\/div>\s*<\/div>)/;
content = content.replace(amountInputRegex, `$1
        {errorMsg && (
          <div className="px-4 mb-4 -mt-2">
            <p className="text-xs text-red-500 font-medium">{errorMsg}</p>
          </div>
        )}`);

fs.writeFileSync('src/pages/WithdrawPage.tsx', content);
