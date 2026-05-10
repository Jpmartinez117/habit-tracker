import type { Page } from '../App'

interface Props {
  navigate: (page: Page) => void
}

interface FeatureRowProps {
  icon: string
  title: string
  description: string
}

function FeatureRow({ icon, title, description }: FeatureRowProps) {
  return (
    <div className="d-flex align-items-start gap-3 py-3">
      <div
        className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
        style={{ width: 38, height: 38, backgroundColor: '#e9ecef', fontSize: '1.1rem' }}
      >
        {icon}
      </div>
      <div>
        <div className="fw-semibold mb-1" style={{ fontSize: '0.95rem', color: '#212529' }}>{title}</div>
        <div className="text-muted" style={{ fontSize: '0.85rem' }}>{description}</div>
      </div>
    </div>
  )
}

export default function LandingPage({ navigate }: Props) {
  return (
    <div className="min-vh-100 bg-white d-flex align-items-center">
      <div className="container px-5">
        <div className="row align-items-center justify-content-center g-5">

          {/* Left column — branding hero */}
          <div className="col-md-6 text-center text-md-start">
            <div className="mb-4 d-inline-block">
              <svg viewBox="0 0 64 64" width="150" height="150" xmlns="http://www.w3.org/2000/svg">
                {/* Background */}
                <rect width="64" height="64" rx="14" fill="#1a1a2e" />
                <rect x="1.5" y="1.5" width="61" height="61" rx="13" fill="none" stroke="white" strokeOpacity="0.12" strokeWidth="1.5" />

                {/* 4×3 grid cells */}
                {/* Row 0 */}
                <rect x="9"  y="15" width="10" height="10" rx="2" fill="white" fillOpacity="0.18" />
                <rect x="21" y="15" width="10" height="10" rx="2" fill="white" fillOpacity="0.18" />
                <rect x="33" y="15" width="10" height="10" rx="2" fill="white" fillOpacity="0.18" />
                <rect x="45" y="15" width="10" height="10" rx="2" fill="white" fillOpacity="0.18" />
                {/* Row 1 */}
                <rect x="9"  y="27" width="10" height="10" rx="2" fill="white" fillOpacity="0.18" />
                <rect x="21" y="27" width="10" height="10" rx="2" fill="white" fillOpacity="0.18" />
                <rect x="33" y="27" width="10" height="10" rx="2" fill="white" fillOpacity="0.18" />
                <rect x="45" y="27" width="10" height="10" rx="2" fill="white" fillOpacity="0.18" />
                {/* Row 2 */}
                <rect x="9"  y="39" width="10" height="10" rx="2" fill="white" fillOpacity="0.18" />
                <rect x="21" y="39" width="10" height="10" rx="2" fill="white" fillOpacity="0.18" />
                <rect x="33" y="39" width="10" height="10" rx="2" fill="white" fillOpacity="0.18" />
                <rect x="45" y="39" width="10" height="10" rx="2" fill="white" fillOpacity="0.18" />

                {/* Green checkmarks — cells (1,0), (3,0), (2,1) */}
                <path d="M22 21 L25 24 L30 17" stroke="#198754" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M46 21 L49 24 L54 17" stroke="#198754" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M34 33 L37 36 L42 29" stroke="#198754" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

                {/* Red X — cell (0,2) */}
                <path d="M11 41 L17 47 M17 41 L11 47" stroke="#dc3545" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </svg>
            </div>

            <p className="fs-3 fw-semibold mb-1" style={{ color: '#495057' }}>Welcome to</p>
            <h1 className="display-2 fw-bold mb-2" style={{ color: '#198754', lineHeight: 1.0 }}>
              uGoal
            </h1>
            <p className="fs-4 text-muted mt-2 mb-0">
              Set goals. Build habits. See your progress.
            </p>
          </div>

          {/* Right column — features + CTA */}
          <div className="col-md-6">
            <div className="border rounded-3 px-4 mb-4" style={{ borderColor: '#dee2e6' }}>
              <FeatureRow
                icon="🎯"
                title="Set Goals"
                description="Create daily and weekly habits that matter to you."
              />
              <hr className="my-0" />
              <FeatureRow
                icon="📅"
                title="Track Progress"
                description="Log completions and stay consistent day after day."
              />
              <hr className="my-0" />
              <FeatureRow
                icon="📊"
                title="See Patterns"
                description="Visualize your data with monthly heatmaps and streaks."
              />
            </div>

            <button
              className="btn btn-primary w-100 py-2 fw-semibold mb-3"
              style={{ fontSize: '1rem' }}
              onClick={() => navigate('register')}
            >
              Get Started
            </button>

            <p className="text-center text-muted mb-0" style={{ fontSize: '0.875rem' }}>
              Already have an account?{' '}
              <button
                className="btn btn-link p-0 fw-semibold align-baseline"
                style={{ color: '#0d6efd', textDecoration: 'none', fontSize: '0.875rem' }}
                onClick={() => navigate('login')}
              >
                Login
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
