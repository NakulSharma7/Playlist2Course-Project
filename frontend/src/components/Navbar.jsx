import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Anvil, Menu, X, ArrowRight } from 'lucide-react'

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Courses', href: '/dashboard' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Features', href: '/#features' },
    { label: 'FAQ', href: '/#faq' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-indigo-600 group-hover:bg-indigo-700 rounded-xl flex items-center justify-center shadow-md shadow-indigo-600/20 transition-all duration-200">
              <Anvil size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Playlist2Course
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors duration-150"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors duration-150 cursor-pointer">
              Log in
            </button>
            <a
              href="#playlist-input"
              className="inline-flex items-center gap-1.5 px-4.5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-150"
            >
              Get Started
              <ArrowRight size={15} />
            </a>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            <button className="w-full py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
              Log in
            </button>
            <a
              href="#playlist-input"
              onClick={() => setMobileOpen(false)}
              className="w-full py-2.5 text-center text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
            >
              Get Started
            </a>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
