import { LogOut } from 'lucide-react';
import useAppStore from '../../store/useAppStore';
import { wipeAllData } from '../../services/storage';

export default function PanicButton() {
  const panicExit = useAppStore((s) => s.panicExit);

  const handlePanic = async () => {
    // Wipe IndexedDB data
    try {
      await wipeAllData();
    } catch (e) {
      // Continue even if wipe fails — safety first
    }

    // Clear sessionStorage and localStorage
    try {
      sessionStorage.clear();
      localStorage.removeItem('safestep_passcode');
    } catch (e) {
      // Fail silently
    }

    // Call store panic (clears state + navigates to Google)
    panicExit();
  };

  return (
    <button
      className="panic-button"
      onClick={handlePanic}
      aria-label="Quick exit — leave this page immediately"
      title="Quick Exit"
    >
      <LogOut size={22} />
    </button>
  );
}
