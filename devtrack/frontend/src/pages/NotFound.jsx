import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <p className="font-display text-7xl font-extrabold text-brand-600">404</p>
        <h1 className="mt-2 text-2xl font-bold">This page doesn't exist</h1>
        <p className="muted mt-1">The link may be broken or the page may have moved.</p>
        <Link to="/" className="btn-primary mt-6">Back to home</Link>
      </div>
    </div>
  )
}
