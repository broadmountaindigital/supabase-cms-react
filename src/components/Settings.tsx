import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { toggleEditMode } from '../store/slices/editingToolsSlice';

export interface SettingsProps {
  className?: string;
}

export default function Settings(props: SettingsProps) {
  const { className } = props;
  const isInEditMode = useSelector(
    (state: RootState) => state.editingTools.isInEditMode
  );
  const dispatch = useDispatch();

  return (
    <div className={className}>
      <button
        className="bg-blue-500 text-white p-4 rounded-full text-xs cursor-pointer"
        onClick={() => dispatch(toggleEditMode())}
      >
        {isInEditMode ? 'Close' : 'Edit'}
      </button>
    </div>
  );
}
