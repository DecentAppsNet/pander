import ModalDialog from "@/components/modalDialogs/ModalDialog";
import DialogButton from "@/components/modalDialogs/DialogButton";
import DialogFooter from "@/components/modalDialogs/DialogFooter";

type Props = {
  isOpen: boolean,
  isComplete: boolean,
  onNextLevel: () => void,
  onRetryLevel: () => void
}

function LevelEndDialog({ isOpen, isComplete, onNextLevel, onRetryLevel }: Props) {
  if (!isOpen) return null;

  const title = isComplete ? `Victory!` : `Defeat!`;
  const nextButtonContent = isComplete ? <DialogButton text="Next Level" onClick={onNextLevel} isPrimary /> : null;
  const retryButtonContent = <DialogButton text="Retry Level" onClick={onRetryLevel} isPrimary={!isComplete} />
  const description = isComplete ? "You beat the level. Keep going!" : "Sorry, the people weren't happy enough. Give it another shot?";
  return (
    <ModalDialog isOpen title={title}>
      <p>{description}</p>
      <DialogFooter>
        {retryButtonContent}
        {nextButtonContent}
      </DialogFooter>
    </ModalDialog>
  )
}

export default LevelEndDialog;