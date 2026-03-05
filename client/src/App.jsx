import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'

const GOOGLE_SCRIPT_ID = 'google-identity-services-script'

const loadGoogleIdentityScript = () => {
  return new Promise((resolve, reject) => {
    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID)

    if (existingScript) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.id = GOOGLE_SCRIPT_ID
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Sign-In script'))

    document.head.appendChild(script)
  })
}

function App() {
  const [authMode, setAuthMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [authUser, setAuthUser] = useState(() => localStorage.getItem('auth_username') || '')
  const [token, setToken] = useState(() => localStorage.getItem('auth_token') || '')
  const [authError, setAuthError] = useState('')
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadResult, setUploadResult] = useState(null)
  const [error, setError] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [products, setProducts] = useState([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [productsError, setProductsError] = useState('')
  const [productsMessage, setProductsMessage] = useState('')
  const [editingProductId, setEditingProductId] = useState('')
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    image: '',
    quantity: '',
    inStock: true
  })

  const apiBaseUrl = useMemo(() => {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'
  }, [])

  const googleClientId = useMemo(() => {
    return import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
  }, [])

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    setSelectedFile(file || null)
    setUploadResult(null)
    setError('')
  }

  const handleAuthSubmit = async () => {
    if (!username.trim() || !password) {
      setAuthError('Please enter username and password.')
      return
    }

    setIsAuthenticating(true)
    setAuthError('')

    try {
      const endpoint = authMode === 'register' ? 'register' : 'login'
      const response = await fetch(`${apiBaseUrl}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username.trim(),
          password
        })
      })

      const payload = await response.json()

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || payload.message || 'Authentication failed')
      }

      const incomingToken = payload.data?.token || ''
      const incomingUsername = payload.data?.user?.username || username.trim()

      setToken(incomingToken)
      setAuthUser(incomingUsername)
      localStorage.setItem('auth_token', incomingToken)
      localStorage.setItem('auth_username', incomingUsername)
      setPassword('')
    } catch (requestError) {
      setAuthError(requestError.message || 'Authentication failed')
    } finally {
      setIsAuthenticating(false)
    }
  }

  const loginWithGoogleToken = async (idToken) => {
    const response = await fetch(`${apiBaseUrl}/api/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ idToken })
    })

    const payload = await response.json()

    if (!response.ok || !payload.success) {
      throw new Error(payload.error || payload.message || 'Google authentication failed')
    }

    const incomingToken = payload.data?.token || ''
    const incomingUsername = payload.data?.user?.username || ''

    setToken(incomingToken)
    setAuthUser(incomingUsername)
    localStorage.setItem('auth_token', incomingToken)
    localStorage.setItem('auth_username', incomingUsername)
    setPassword('')
  }

  const handleGoogleLogin = async () => {
    if (!googleClientId) {
      setAuthError('Google Sign-In is not configured. Missing VITE_GOOGLE_CLIENT_ID.')
      return
    }

    setIsAuthenticating(true)
    setAuthError('')

    try {
      await loadGoogleIdentityScript()

      if (!window.google?.accounts?.id) {
        throw new Error('Google Sign-In is unavailable right now')
      }

      const idToken = await new Promise((resolve, reject) => {
        let handled = false

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => {
            if (response?.credential) {
              handled = true
              resolve(response.credential)
              return
            }

            reject(new Error('Google Sign-In did not return a valid token'))
          }
        })

        window.google.accounts.id.prompt((notification) => {
          if (handled) {
            return
          }

          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            reject(new Error('Google Sign-In was cancelled or unavailable'))
          }
        })
      })

      await loginWithGoogleToken(idToken)
    } catch (requestError) {
      setAuthError(requestError.message || 'Google authentication failed')
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleLogout = () => {
    setToken('')
    setAuthUser('')
    setPassword('')
    setUploadResult(null)
    setSelectedFile(null)
    setError('')
    setProducts([])
    setProductsError('')
    setProductsMessage('')
    setEditingProductId('')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_username')
  }

  const fetchProducts = useCallback(async () => {
    setIsLoadingProducts(true)
    setProductsError('')

    try {
      const response = await fetch(`${apiBaseUrl}/api/products`)
      const payload = await response.json()

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || payload.message || 'Failed to fetch products')
      }

      setProducts(payload.data || [])
    } catch (requestError) {
      setProductsError(requestError.message || 'Failed to fetch products')
    } finally {
      setIsLoadingProducts(false)
    }
  }, [apiBaseUrl])

  useEffect(() => {
    if (!token) {
      return
    }

    fetchProducts()
  }, [token, fetchProducts])

  const handleStartEdit = (product) => {
    setEditingProductId(product._id)
    setProductsMessage('')
    setProductsError('')
    setEditForm({
      name: product.name || '',
      category: product.category || '',
      price: String(product.price ?? ''),
      description: product.description || '',
      image: product.image || '',
      quantity: String(product.quantity ?? ''),
      inStock: Boolean(product.inStock)
    })
  }

  const handleCancelEdit = () => {
    setEditingProductId('')
    setProductsError('')
  }

  const handleEditFormChange = (field, value) => {
    setEditForm((previous) => ({
      ...previous,
      [field]: value
    }))
  }

  const handleUpdateProduct = async () => {
    if (!token || !editingProductId) {
      return
    }

    setProductsError('')
    setProductsMessage('')

    const payload = {
      name: editForm.name.trim(),
      category: editForm.category.trim(),
      description: editForm.description.trim(),
      image: editForm.image.trim(),
      inStock: editForm.inStock,
      price: Number(editForm.price),
      quantity: Number(editForm.quantity)
    }

    if (
      !payload.name ||
      !payload.category ||
      !payload.description ||
      !payload.image ||
      Number.isNaN(payload.price) ||
      Number.isNaN(payload.quantity)
    ) {
      setProductsError('Please fill all fields with valid values before updating.')
      return
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/products/${editingProductId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const responsePayload = await response.json()

      if (!response.ok || !responsePayload.success) {
        throw new Error(responsePayload.error || responsePayload.message || 'Failed to update product')
      }

      setProducts((previousProducts) =>
        previousProducts.map((product) =>
          product._id === editingProductId ? responsePayload.data : product
        )
      )
      setProductsMessage('Product updated successfully.')
      setEditingProductId('')
    } catch (requestError) {
      setProductsError(requestError.message || 'Failed to update product')
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (!token) {
      return
    }

    const confirmed = window.confirm('Delete this product permanently?')
    if (!confirmed) {
      return
    }

    setProductsError('')
    setProductsMessage('')

    try {
      const response = await fetch(`${apiBaseUrl}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const payload = await response.json()

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || payload.message || 'Failed to delete product')
      }

      setProducts((previousProducts) =>
        previousProducts.filter((product) => product._id !== productId)
      )
      setProductsMessage('Product deleted successfully.')

      if (editingProductId === productId) {
        setEditingProductId('')
      }
    } catch (requestError) {
      setProductsError(requestError.message || 'Failed to delete product')
    }
  }

  const handleUpload = async () => {
    if (!token) {
      setError('Please login to upload image.')
      return
    }

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
        headers: {
          Authorization: `Bearer ${token}`
        },
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
        <h1>WellnessWave Authentication</h1>

        {!token ? (
          <>
            <p>{authMode === 'register' ? 'Create account to continue.' : 'Login to continue.'}</p>

            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            <button type="button" onClick={handleAuthSubmit} disabled={isAuthenticating}>
              {isAuthenticating
                ? authMode === 'register'
                  ? 'Registering...'
                  : 'Logging in...'
                : authMode === 'register'
                  ? 'Register'
                  : 'Login'}
            </button>

            <button type="button" onClick={handleGoogleLogin} disabled={isAuthenticating}>
              {isAuthenticating ? 'Please wait...' : 'Continue with Google'}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setAuthMode(authMode === 'register' ? 'login' : 'register')
                setAuthError('')
              }}
            >
              {authMode === 'register' ? 'Switch to Login' : 'Switch to Register'}
            </button>

            {authError && <p className="error-message">{authError}</p>}
          </>
        ) : (
          <>
            <p>Logged in as <strong>{authUser}</strong></p>

            <input type="file" accept="image/*" onChange={handleFileChange} />

            <button type="button" onClick={handleUpload} disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Upload Image'}
            </button>

            <button type="button" className="secondary-button" onClick={handleLogout}>
              Logout
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

            <div className="result">
              <div className="products-header">
                <p>Manage Products</p>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={fetchProducts}
                  disabled={isLoadingProducts}
                >
                  {isLoadingProducts ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              {productsMessage && <p className="success-message">{productsMessage}</p>}
              {productsError && <p className="error-message">{productsError}</p>}

              {!isLoadingProducts && products.length === 0 ? (
                <p>No products found.</p>
              ) : (
                <ul className="products-list">
                  {products.map((product) => {
                    const isEditing = editingProductId === product._id

                    return (
                      <li key={product._id} className="product-item">
                        {isEditing ? (
                          <div className="edit-grid">
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(event) => handleEditFormChange('name', event.target.value)}
                              placeholder="Name"
                            />
                            <input
                              type="text"
                              value={editForm.category}
                              onChange={(event) => handleEditFormChange('category', event.target.value)}
                              placeholder="Category"
                            />
                            <input
                              type="number"
                              min="0"
                              value={editForm.price}
                              onChange={(event) => handleEditFormChange('price', event.target.value)}
                              placeholder="Price"
                            />
                            <input
                              type="number"
                              min="0"
                              value={editForm.quantity}
                              onChange={(event) => handleEditFormChange('quantity', event.target.value)}
                              placeholder="Quantity"
                            />
                            <input
                              type="text"
                              value={editForm.image}
                              onChange={(event) => handleEditFormChange('image', event.target.value)}
                              placeholder="Image URL"
                            />
                            <input
                              type="text"
                              value={editForm.description}
                              onChange={(event) => handleEditFormChange('description', event.target.value)}
                              placeholder="Description"
                            />
                            <label className="checkbox-row">
                              <input
                                type="checkbox"
                                checked={editForm.inStock}
                                onChange={(event) => handleEditFormChange('inStock', event.target.checked)}
                              />
                              In Stock
                            </label>
                            <div className="inline-actions">
                              <button type="button" onClick={handleUpdateProduct}>Save</button>
                              <button
                                type="button"
                                className="secondary-button"
                                onClick={handleCancelEdit}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p><strong>{product.name}</strong></p>
                            <p>{product.category} • ₹{product.price}</p>
                            <p>Qty: {product.quantity} • {product.inStock ? 'In Stock' : 'Out of Stock'}</p>
                            <div className="inline-actions">
                              <button type="button" onClick={() => handleStartEdit(product)}>Edit</button>
                              <button
                                type="button"
                                className="secondary-button"
                                onClick={() => handleDeleteProduct(product._id)}
                              >
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  )
}

export default App
