import { type PropsWithChildren } from 'react';

export interface EditorButtonProps extends PropsWithChildren {
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function EditorButton({
  className,
  children,
  onClick,
  disabled,
  type,
}: EditorButtonProps) {
  return (
    <button
      type={type ?? 'button'}
      className={
        (className ??
          'bmscms:bg-blue-600 bmscms:text-white bmscms:rounded bmscms:px-4 bmscms:py-1 bmscms:font-semibold') +
        ' bmscms:cursor-pointer bmscms:disabled:opacity-50 bmscms:disabled:cursor-not-allowed'
      }
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default EditorButton;
