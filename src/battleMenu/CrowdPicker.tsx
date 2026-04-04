import { useState } from "react";

import styles from './CrowdPicker.module.css';
import { CrowdComposition } from "@/multiplayer/types/Challenge";

type CharacterInfo = {
  id: string;
  title: string;
};

type Props = {
  characters: CharacterInfo[];
  opponentName: string;
  onConfirm: (crowd: CrowdComposition[]) => void;
  onCancel: () => void;
};

const MAX_CROWD_SIZE = 20;

function CrowdPicker({ characters, opponentName, onConfirm, onCancel }: Props) {
  const [counts, setCounts] = useState<Record<string, number>>({});

  const totalCount = Object.values(counts).reduce((sum, c) => sum + c, 0);

  function _adjustCount(characterId: string, delta: number) {
    setCounts(prev => {
      const current = prev[characterId] ?? 0;
      const next = Math.max(0, current + delta);
      if (delta > 0 && totalCount >= MAX_CROWD_SIZE) return prev;
      return { ...prev, [characterId]: next };
    });
  }

  function _onConfirm() {
    const crowd: CrowdComposition[] = Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([characterId, count]) => ({ characterId, count }));
    if (crowd.length === 0) return;
    onConfirm(crowd);
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <h3 className={styles.title}>Pick Your Crowd</h3>
        <p className={styles.subtitle}>
          Choose the audience for your battle vs {opponentName}.
          Stack the crowd in your favor!
        </p>
        <div className={styles.characterList}>
          {characters.map(char => (
            <div key={char.id} className={styles.characterRow}>
              <span className={styles.characterName}>{char.title}</span>
              <div className={styles.counter}>
                <button
                  className={styles.counterButton}
                  onClick={() => _adjustCount(char.id, -1)}
                  disabled={(counts[char.id] ?? 0) === 0}
                >-</button>
                <span className={styles.counterValue}>{counts[char.id] ?? 0}</span>
                <button
                  className={styles.counterButton}
                  onClick={() => _adjustCount(char.id, 1)}
                  disabled={totalCount >= MAX_CROWD_SIZE}
                >+</button>
              </div>
            </div>
          ))}
        </div>
        <p className={styles.crowdCount}>{totalCount} / {MAX_CROWD_SIZE}</p>
        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onCancel}>Cancel</button>
          <button
            className={styles.confirmButton}
            onClick={_onConfirm}
            disabled={totalCount === 0}
          >Send Challenge</button>
        </div>
      </div>
    </div>
  );
}

export default CrowdPicker;
