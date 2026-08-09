export default function TopNavBar() {

  return (
    <nav className="md:hidden fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-surface shadow-sm">
      <div className="text-headline-md font-bold text-primary">FixIt</div>
      <div className="flex gap-4 text-primary">
        <button className="hover:bg-surface-container-low transition-colors rounded-full p-2">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="hover:bg-surface-container-low transition-colors rounded-full p-2">
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </div>
    </nav>
  );
}
