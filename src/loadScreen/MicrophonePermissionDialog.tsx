import { useState } from "react";
import ModalDialog from "@/components/modalDialogs/ModalDialog";
import DialogButton from "@/components/modalDialogs/DialogButton";
import DialogFooter from "@/components/modalDialogs/DialogFooter";

type Props = {
  isOpen: boolean,
  onApprove: () => void,
  onSkip: () => void
}

function MicrophonePermissionDialog({ isOpen, onApprove, onSkip }: Props) {
  const [approved, setApproved] = useState(false);

  const handleApprove = () => {
    setApproved(true);
    setTimeout(onApprove, 600);
  };

  return (
    <ModalDialog isOpen={isOpen} title="Microphone Access">
      <p>This app supports voice input through speech recognition. Your browser will request microphone permission.</p>
      <DialogFooter>
        <DialogButton text="Skip" onClick={onSkip} disabled={approved} />
        <DialogButton
          text={approved ? "Approved" : "Allow Microphone"}
          onClick={handleApprove}
          isPrimary
          disabled={approved}
        />
      </DialogFooter>
    </ModalDialog>
  );
}

export default MicrophonePermissionDialog;
