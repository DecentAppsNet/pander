import {useState, useEffect} from "react";
import styles from './LoadScreen.module.css';
import { startLoadingModel } from "./interactions/initialization";
import ProgressBar from '@/components/progressBar/ProgressBar';
import TopBar from '@/components/topBar/TopBar';
import AboutDialog from "@/homeScreen/dialogs/AboutDialog";

type Props = {
  onComplete: () => void;
}

function LoadScreen(props:Props) {
  const [percentComplete, setPercentComplete] = useState(0);
  const [modalDialogName, setModalDialogName] = useState<string|null>(null);
  const [currentTask, setCurrentTask] = useState('Loading');
  const {onComplete} = props;

  useEffect(() => {
    startLoadingModel(setPercentComplete, setCurrentTask)
      .then((isInitialized) => { if (isInitialized) onComplete(); });
  }, []);
  
  return (
    <div className={styles.container}>
      <TopBar onAboutClick={() => setModalDialogName(AboutDialog.name)}/>
      <div className={styles.content}>
        <div className={styles.progressBarContainer}>
            <ProgressBar percentComplete={percentComplete}/>
            {currentTask}
        </div>
      </div>
      <AboutDialog
        isOpen={modalDialogName === AboutDialog.name}
        onClose={() => setModalDialogName(null)}
      />
    </div>
  );
}

export default LoadScreen;