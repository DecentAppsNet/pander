import { useRef, useEffect, useState } from 'react';

import styles from './TurnTimer.module.css';
import { clamp } from '@/common/mathUtil';

type Props = {
  duration: number; // msecs
}

function TurnTimer({duration}:Props) {
  const startTimeRef = useRef<number>(performance.now());
  
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => (t + 1) % 1000000), 50);
    return () => clearInterval(id);
  }, []);

  const elapsed = performance.now() - startTimeRef.current;
  const completionValue = clamp(elapsed / duration, 0, 1) * 100;

  return <div className={styles.dial} style={{ ['--value' as any]: '' + completionValue }} />
}

export default TurnTimer;