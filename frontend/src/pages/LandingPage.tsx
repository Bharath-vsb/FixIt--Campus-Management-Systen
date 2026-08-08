import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-on-primary py-20 px-4 md:px-8">
        <div className="max-w-container mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-display-lg font-bold mb-6">Smart Campus Maintenance</h1>
            <p className="text-body-lg text-inverse-primary mb-8 max-w-lg">
              Report issues, track repairs, and keep our campus running smoothly. FixIt connects students directly with maintenance staff.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/login" className="bg-surface text-primary px-8 py-3 rounded-lg text-label-md font-bold text-center hover:bg-surface-container-low transition-colors shadow-level-1">
                Report an Issue
              </Link>
              <Link to="/login" className="border border-inverse-primary text-on-primary px-8 py-3 rounded-lg text-label-md font-bold text-center hover:bg-primary-container transition-colors">
                Staff Login
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            {/* Decorative element replacing hero image for now */}
            <div className="w-full aspect-square max-w-md mx-auto bg-primary-container rounded-full flex items-center justify-center opacity-80 shadow-level-2">
              <span className="material-symbols-outlined text-9xl text-primary">engineering</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-headline-lg font-bold text-primary mb-4">How it Works</h2>
            <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              Three simple steps to a better campus environment.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: 'report_problem', title: '1. Report', desc: 'Spot a problem? Snap a photo and tell us where it is.' },
              { icon: 'assignment_ind', title: '2. We Assign', desc: 'Our smart system routes your issue to the right team immediately.' },
              { icon: 'task_alt', title: '3. Resolved', desc: 'Track progress in real-time and get notified when it\'s fixed.' }
            ].map((step, i) => (
              <div key={i} className="card p-8 text-center hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-3xl">{step.icon}</span>
                </div>
                <h3 className="text-headline-md font-bold text-primary mb-3">{step.title}</h3>
                <p className="text-body-md text-on-surface-variant">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-surface-container-low py-20 px-4 md:px-8">
        <div className="max-w-container mx-auto text-center">
          <h2 className="text-headline-lg font-bold text-primary mb-12">Campus Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { num: '5,000+', label: 'Issues Resolved' },
              { num: '24hr', label: 'Average Response Time' },
              { num: '98%', label: 'Student Satisfaction' },
              { num: '12', label: 'Dedicated Staff' }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-display-lg font-bold text-primary mb-2">{stat.num}</div>
                <div className="text-label-md text-on-surface-variant uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
