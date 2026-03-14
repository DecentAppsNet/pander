import { useEffect, useState } from "react";

import styles from './HomeScreen.module.css';
import { init } from "./interactions/initialization";
import LoadScreen from '@/loadScreen/LoadScreen';
import TopBar from '@/components/topBar/TopBar';
import AboutDialog from "./dialogs/AboutDialog";
import MicrophonePermissionDialog from "@/homeScreen/dialogs/MicrophonePermissionDialog";
import { loadCharacterSpriteset } from "@/components/audienceView/characterSpriteUtil";
import CharacterSpriteset from "@/components/audienceView/types/CharacterSpriteset";
import AudienceView from "@/components/audienceView/AudienceView";
import AudienceMember from "@/game/types/AudienceMember";
import { enableSpeechAfterDialog } from "./interactions/speech";
import ChatInputBox from "@/components/chat/ChatInputBox";
import { isSpeechAvailable, toggleSpeech } from "@/speech/speechUtil";

// TODO load this from a file.
const AUDIENCE_MEMBERS:AudienceMember[] = [
  {characterId:'Jock', count:10, happiness:0.5, likes:[]},
  {characterId:'Librarian', count:5, happiness:0.8, likes:[]},
  {characterId:'Cat Lady', count:5, happiness:0.4, likes:[]},
  {characterId:'Barber', count:10, happiness:0.5, likes:[]},
  {characterId:'Plumber', count:5, happiness:0.1, likes:[]},
  {characterId:'Clown', count:15, happiness:0.9, likes:[]},
  {characterId:'Ice Skater', count:5, happiness:0.9, likes:[]},
]

function HomeScreen() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modalDialogName, setModalDialogName] = useState<string|null>(null);
  const [characterSpriteset, setCharacterSpriteset] = useState<CharacterSpriteset|null>(null);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState<boolean>(false);
  
  useEffect(() => {
    if (isLoading) return;

    init(setCharacterSpriteset).then(isModelLoaded => { 
      if (!isModelLoaded) { setIsLoading(true); return; }
      loadCharacterSpriteset('/characters/characters.md');
    });
  }, [isLoading]);

  if (isLoading) return <LoadScreen onComplete={() => setIsLoading(false)} />;

  return (
    <div className={styles.container}>
      <TopBar onAboutClick={() => setModalDialogName(AboutDialog.name)}/>
      <div className={styles.content}>
        <AudienceView characterSpriteset={characterSpriteset} audienceMembers={AUDIENCE_MEMBERS} />
        <ChatInputBox recentPrompts={[]} onSubmit={() => {}} onToggleSpeech={ () => {
          if (!isSpeechAvailable()) { setModalDialogName(MicrophonePermissionDialog.name); return; }
          setIsSpeechEnabled(toggleSpeech());
        }} isSpeechEnabled={isSpeechEnabled}/>
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