export default function AdminManagement() {
  return (
    <div className="space-y-6 animate-fade-in-up max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-primary">System Management</h1>
          <p className="text-body-md text-on-surface-variant">Manage categories and locations.</p>
        </div>
      </div>

      <div className="bg-surface border border-outline-variant rounded-xl p-8 text-center mt-8">
        <span className="material-symbols-outlined text-4xl text-outline mb-2">construction</span>
        <h3 className="text-headline-md text-primary mb-1">Coming Soon</h3>
        <p className="text-body-md text-on-surface-variant">
          Category and Location management is marked as a secondary feature for the MVP.
        </p>
      </div>
    </div>
  );
}
