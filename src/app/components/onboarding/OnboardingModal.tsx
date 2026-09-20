import { ImportModal } from "../import/Modal";
import { useOnboarding } from "../../../hooks/useOnboarding";

type OnboardingModalProps = {
  onComplete: () => void;
};

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const onboarding = useOnboarding();
  
  if (!onboarding.shouldShow) return null;
  
  return (
    <ImportModal
      onClose={onComplete}
    />
  );
}
