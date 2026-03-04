import { useMemo, useState } from 'react'
import './App.css'

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadResult, setUploadResult] = useState(null)
  const [error, setError] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const apiBaseUrl = useMemo(() => {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'
  }, [])

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    setSelectedFile(file || null)
    setUploadResult(null)
    setError('')
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please choose an image file first.')
      return
    }

    setIsUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)

      const response = await fetch(`${apiBaseUrl}/api/products/upload-image`, {
        method: 'POST',
        body: formData
      })

      const payload = await response.json()

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || payload.message || 'Upload failed')
      }

      setUploadResult(payload.data)
    } catch (uploadError) {
      setUploadResult(null)
      setError(uploadError.message || 'Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <main className="uploader-page">
      <section className="uploader-card">
        <h1>WellnessWave Image Upload</h1>
        <p>Upload one product image and get a reusable image URL.</p>

        <input type="file" accept="image/*" onChange={handleFileChange} />

        <button type="button" onClick={handleUpload} disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Upload Image'}
        </button>

        {error && <p className="error-message">{error}</p>}

        {uploadResult?.imageUrl && (
          <div className="result">
            <p>Uploaded successfully:</p>
            <a href={uploadResult.imageUrl} target="_blank" rel="noreferrer">
              {uploadResult.imageUrl}
            </a>
            <img src={uploadResult.imageUrl} alt="Uploaded preview" />
          </div>
        )}
      </section>
    </main>
  )
}

export default App
