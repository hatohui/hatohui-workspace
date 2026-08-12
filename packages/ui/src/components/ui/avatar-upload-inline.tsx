import { useRef, type ChangeEvent } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { Avatar } from './avatar';
import { cn } from '../../lib/utils';

type Props = {
  imageUrl?: string | null;
  alt: string;
  accept: string;
  label: string;
  isUploading?: boolean;
  onFileSelected: (file: File) => void;
  className?: string;
};

function AvatarUploadInline({
  imageUrl,
  alt,
  accept,
  label,
  isUploading,
  onFileSelected,
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) {
      onFileSelected(file);
    }
  };

  return (
    <button
      type="button"
      disabled={isUploading}
      onClick={() => inputRef.current?.click()}
      aria-label={label}
      className={cn(
        'group relative size-24 shrink-0 self-start rounded-full disabled:opacity-50',
        className,
      )}
    >
      <Avatar src={imageUrl} alt={alt} />
      <span
        className={cn(
          'absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-colors group-hover:bg-black/40',
          isUploading && 'bg-black/40',
        )}
      >
        {isUploading ? (
          <Loader2 className="size-6 animate-spin text-white" />
        ) : (
          <Camera className="size-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
    </button>
  );
}

export { AvatarUploadInline };
