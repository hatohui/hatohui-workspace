import { useRef, type ChangeEvent } from 'react';
import { Camera } from 'lucide-react';
import { Avatar } from './avatar';
import { cn } from '../../lib/utils';

type Props = {
  imageUrl?: string | null;
  alt: string;
  accept: string;
  isUploading?: boolean;
  onFileSelected: (file: File) => void;
  className?: string;
};

function AvatarUploadInline({
  imageUrl,
  alt,
  accept,
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
      className={cn(
        'group relative size-24 shrink-0 self-start rounded-full disabled:opacity-50',
        className,
      )}
    >
      <Avatar src={imageUrl} alt={alt} />
      <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-colors group-hover:bg-black/40">
        <Camera className="size-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
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
