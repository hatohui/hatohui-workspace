import { useRef, type ChangeEvent } from 'react';
import { Avatar } from './avatar';
import { Button } from './button';

type Props = {
  imageUrl?: string | null;
  alt: string;
  accept: string;
  uploadLabel: string;
  isUploading?: boolean;
  onFileSelected: (file: File) => void;
};

function AvatarUpload({
  imageUrl,
  alt,
  accept,
  uploadLabel,
  isUploading,
  onFileSelected,
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
    <div className="flex items-center gap-4">
      <Avatar src={imageUrl} alt={alt} />
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
      <Button
        type="button"
        variant="outline"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploadLabel}
      </Button>
    </div>
  );
}

export { AvatarUpload };
