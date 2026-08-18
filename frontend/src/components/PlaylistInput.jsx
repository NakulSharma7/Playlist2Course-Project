import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { ArrowRight, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react'

function PlaylistInput() {
  const { isLoaded, isSignedIn } = useUser()
  const navigate = useNavigate()

  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [notification, setNotification] = useState('')
  const [loading, setLoading] = useState(false)

  const isValidUrl = (string) => {
    try {
      const parsed = new URL(string)
      return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch {
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNotification('')

    // If user is not signed in, redirect to sign-in page
    if (isLoaded && !isSignedIn) {
      navigate('/sign-in')
      return
    }

    const trimmed = url.trim()

    if (!trimmed) {
      setError('Please paste a playlist URL.')
      return
    }

    if (!isValidUrl(trimmed)) {
      setError('Please enter a valid playlist URL.')
      return
    }

    try {
      setLoading(true)
      const res = await fetch('http://localhost:5000/api/courses/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistUrl: trimmed })
      })

      const data = await res.json()
      if (data.success && data.courseId) {
        navigate(`/course/${data.courseId}`)
      } else {
        setError(data.error || 'Failed to generate course.')
      }
    } catch (err) {
      setError('Network error. Please make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="playlist-input" className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xl glow-brand">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                if (error) setError('')
                if (notification) setNotification('')
              }}
              placeholder="Paste your playlist URL here..."
              className={`w-full px-5 py-4 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-slate-50 border rounded-xl sm:rounded-2xl transition-all outline-none ${
                error
                  ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-200'
                  : 'border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100'
              }`}
              aria-label="Playlist URL input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-7 py-4 text-sm sm:text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-60"
          >
            <span>{loading ? 'Processing...' : 'Create Course'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Feedback Messages */}
        <div className="mt-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
          <p className="text-slate-500 flex items-center gap-1.5">
            <Sparkles size={14} className="text-indigo-500" />
            Supports educational video playlists.
          </p>

          {error && (
            <p className="text-red-600 font-medium flex items-center gap-1.5 bg-red-50 px-3 py-1 rounded-lg border border-red-100">
              <AlertCircle size={15} />
              {error}
            </p>
          )}

          {notification && (
            <p className="text-emerald-700 font-medium flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
              <CheckCircle2 size={15} className="text-emerald-600" />
              {notification}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

export default PlaylistInput
