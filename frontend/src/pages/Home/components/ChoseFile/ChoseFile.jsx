import React, {useState} from "react"
import "./ChoseFile.css"
import api from "api/api";


export default function ChoseFile ({
    addNotification,
    type,
    setInfo,
    info,
    setChats
}) {


    
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [show, setShow] = useState(false)

    const handleFileChange = (selectedFile) => {
        if (!selectedFile) return;
        
        if (!['image/jpeg', 'image/png', 'image/gif'].includes(selectedFile.type)) {
            addNotification("error", 'Только JPG, PNG или GIF разрешены')
            return;
        }
        
        if (selectedFile.size > 2 * 1024 * 1024) {
            addNotification("error", "Файл слишком большой (макс. 2MB)")
            return;
        }
        
        setFile(selectedFile)
        
        const reader = new FileReader()
        reader.onload = () => setPreview(reader.result)
        reader.readAsDataURL(selectedFile)
    }

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        
        const droppedFile = e.dataTransfer.files[0];
        handleFileChange(droppedFile);
    };

    const handleInputChange = (e) => {
        handleFileChange(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file)

        try {

            if (type === "user") {
                const response = await api.post(`${type}/avatar`, formData, {
                headers :  {
                        'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(percentCompleted);
                },
                });
               
                addNotification("success", "Аватарка обновлена!")
                setPreview("")
                setFile(null)

           
                setInfo({...info, avatar: response.data.avatar});
            } else {
                
                for (let [key, value] of formData.entries()) {
                    console.log(key, value); 
                }

                const response = await api.post(`${type}/avatar?id=${info.id}`, formData, {
                    headers :  {
                        'Content-Type': 'multipart/form-data',
                },}
                );  
                addNotification("success", "Аватарка обновлена!")
                setPreview("")
                setFile(null)
                setChats(prevChats => {
                    return prevChats.map(chat =>
                        chat.id === info.id ? {
                            ...chat,
                            avatar: response.data.avatar,
                            }
                        : chat
            )})
            
                setInfo({...info, avatar: response.data.avatar});
        }
        } catch (err) {
            addNotification("error", "Ошибка загрузки");
        } finally {
            setUploadProgress(0);
        }
    }

    return (
        <div className="avatar-upload-container setting-option" onClick={e => e.stopPropagation()}>
            <input 
                type="file" 
                id="avatar-upload"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden-input"
                
            />
            
            
            
            <div className="upload-controls">

                <div className="avatar-content btn" onClick={()=>setShow(p => !p)}>
                    <p style={{margin: "0.5em"}}>Аватар</p>

                    {show && <div className="contrl" onClick={e => e.stopPropagation()}>
                        
                <div style={{display: "flex", flexDirection: "column", gap: "12px"}}>
                <label htmlFor="avatar-upload" className="upload-button">
                    {file ? 'Выбрать другой' : 'Выбрать файл'}
                </label>
                {file && (
                <div
                    className="submit-button" 
                    onClick={handleSubmit}
                    disabled={uploadProgress > 0}
                >
                    {uploadProgress > 0 ? `Загрузка... ${uploadProgress}%` : 'Загрузить'}
                </div>
                )}
                </div>
                
                {uploadProgress > 0 && (
                <div className="progress-container">
                <div 
                    className="progress-bar" 
                    style={{ width: `${uploadProgress}%` }}
                ></div>
                </div>
            )} <div
                className={`upload-area ${isDragging ? 'dragging' : ''}`}
                onClick={() => document.getElementById('avatar-upload').click()}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                {preview ? (
                <img src={preview} alt="Preview" className="preview-image" />
                ) : (
                <div className="upload-placeholder">
                    <div className="upload-icon">
                        <span>+</span>
                        <p>Перетащите изображение или нажмите</p>
                    </div>
                </div>
                )}
            </div>

                
                    </div>}
                </div>


               
            </div>
            
            
        </div>
    )
}