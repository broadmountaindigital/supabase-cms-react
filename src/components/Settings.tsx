import { useSupabaseCMS } from '../hooks/useSupabaseCMS';

export interface SettingsProps {
  className?: string;
}

export default function Settings(props: SettingsProps) {
  const { className } = props;
  const { isInEditMode, toggleEditMode } = useSupabaseCMS();

  return (
    <div className={className}>
      <button
        className="bg-blue-500 text-white p-4 rounded-full text-xs cursor-pointer"
        onClick={toggleEditMode}
      >
        {isInEditMode ? 'Close' : 'Edit'}
      </button>
    </div>
  );
}
