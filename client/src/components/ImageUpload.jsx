import { useRef } from 'react';
import { Upload, X, Image } from 'lucide-react';

const ImageUpload = ({ image, onImageChange, onImageRemove }) => {
    const inputRef = useRef(null);

    const handleChange = (e) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) onImageChange(file);
    };

    return (
        <div className="image-upload" onClick={() => !image && inputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files?.[0]; if (file?.type.startsWith('image/')) onImageChange(file); }}>
            <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} style={{ display: 'none' }} />
            {image ? (
                <div className="image-upload__preview">
                    <img src={typeof image === 'string' ? image : URL.createObjectURL(image)} alt="Preview" />
                    <button type="button" className="image-upload__remove" onClick={(e) => { e.stopPropagation(); onImageRemove(); }}><X size={20} /></button>
                </div>
            ) : (
                <div className="image-upload__placeholder">
                    <Upload size={40} style={{ marginBottom: 'var(--space-md)', opacity: 0.5 }} />
                    <p>Drag & drop or click to upload</p>
                    <span style={{ fontSize: 'var(--font-size-sm)', opacity: 0.6 }}>Max 5MB</span>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
