// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-50 to-primary-50 dark:from-surface-950 dark:to-primary-950 p-6">
      <div className="text-center animate-slide-up">
        <div className="text-9xl font-black gradient-text mb-4 leading-none">404</div>
        <h1 className="text-2xl font-bold text-surface-800 dark:text-surface-200 mb-2">
          Page not found
        </h1>
        <p className="text-surface-500 dark:text-surface-400 mb-8 max-w-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/rooms" className="btn-primary px-8 py-3 text-base shadow-lg shadow-primary-500/30">
          Back to Rooms
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
