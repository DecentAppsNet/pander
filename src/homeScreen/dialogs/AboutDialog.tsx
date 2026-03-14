import OkayDialog from "@/components/modalDialogs/OkayDialog";

const description = `This app is for testing out game ideas where the player types or speaks messages to pander to a simulated audience.`;

type Props = {
  isOpen: boolean;
  onClose: () => void;
}

function AboutDialog({ isOpen, onClose }: Props) {
  return (
    <OkayDialog
      description={description}
      isOpen={isOpen}
      onOkay={onClose}
      title="About Pander"
    />
  );
}

export default AboutDialog;