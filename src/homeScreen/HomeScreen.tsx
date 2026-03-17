import { useEffect, useState } from "react";

import styles from './HomeScreen.module.css';
import { init } from "./interactions/initialization";
import LoadScreen from '@/loadScreen/LoadScreen';
import TopBar from '@/components/topBar/TopBar';
import AboutDialog from "./dialogs/AboutDialog";
import MicrophonePermissionDialog from "@/homeScreen/dialogs/MicrophonePermissionDialog";
import CharacterSpriteset from "@/components/audienceView/types/CharacterSpriteset";
import AudienceView from "@/components/audienceView/AudienceView";
import AudienceMember from "@/game/types/AudienceMember";
import { enableSpeechAfterDialog } from "./interactions/speech";
import ChatInputBox from "@/components/chat/ChatInputBox";
import { isSpeechAvailable, toggleSpeech } from "@/speech/speechUtil";
import { promptFromChatInput, startLevel } from "./interactions/game";
import LevelSelector from "@/components/levelSelector/LevelSelector";
import HappinessMeter from "@/components/happinessMeter/HappinessMeter";
import { DEFAULT_HAPPINESS } from "@/game/happinessUtil";

function HomeScreen() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modalDialogName, setModalDialogName] = useState<string|null>(null);
  const [characterSpriteset, setCharacterSpriteset] = useState<CharacterSpriteset|null>(null);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState<boolean>(false);
  const [recentPrompts, setRecentPrompts] = useState<string[]>([]);
  const [audienceMembers, setAudienceMembers] = useState<AudienceMember[]>([]);
  const [levelId, setLevelId] = useState<string|null>(null);
  const [averageHappiness, setAverageHappiness] = useState<number>(DEFAULT_HAPPINESS);
  
  useEffect(() => {
    if (isLoading) return;

    init(setRecentPrompts, setAverageHappiness).then(initResults => { 
      if (!initResults) { setIsLoading(true); return; }
      setCharacterSpriteset(initResults.characterSpriteset);
      setLevelId(initResults.levelId);
    });
  }, [isLoading]);

  useEffect(() => {
    if (levelId === null) return;
    startLevel(levelId, setAudienceMembers);
  }, [levelId]);

  if (isLoading) return <LoadScreen onComplete={() => setIsLoading(false)} />;

  return (
    <div className={styles.container}>
      <TopBar onAboutClick={() => setModalDialogName(AboutDialog.name)}/>
      <div className={styles.content}>
        <LevelSelector selectedLevelId={levelId} onSelect={setLevelId} />
        <AudienceView characterSpriteset={characterSpriteset} audienceMembers={audienceMembers} />
        <ChatInputBox recentPrompts={recentPrompts} onSubmit={promptFromChatInput} onToggleSpeech={ () => {
          if (!isSpeechAvailable()) { setModalDialogName(MicrophonePermissionDialog.name); return; }
          setIsSpeechEnabled(toggleSpeech());
        }} isSpeechEnabled={isSpeechEnabled}/>
      </div>
      <div className={styles.infoPanel}>
        <HappinessMeter happiness={averageHappiness} />
      </div>

      <AboutDialog
        isOpen={modalDialogName === AboutDialog.name}
        onClose={() => setModalDialogName(null)}
      />
      <MicrophonePermissionDialog
        isOpen={modalDialogName === 'MicrophonePermissionDialog'}
        onApprove={() => enableSpeechAfterDialog(setModalDialogName, setIsSpeechEnabled)}
        onCancel={() => setModalDialogName(null)}
      />
    </div>
  );
}

export default HomeScreen;