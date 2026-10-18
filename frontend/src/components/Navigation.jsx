import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Chat' },
  { to: '/how-it-works', label: 'How it works' },
]

export default function Navigation() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#E4DCCB] bg-[#F6F1E7]/95">
      <div className="mx-auto grid max-w-[1600px] grid-cols-[1fr_auto] items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 justify-self-start">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F1B16] font-mono text-sm font-semibold text-[#FFFCF5]">
            BM
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#7A7064]">BuildMyML</p>
            <p className="text-sm text-[#1F1B16]">Project planner</p>
          </div>
        </div>

        <nav aria-label="Main navigation" className="flex items-center gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B5532F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F6F1E7] ${
                  isActive ? 'bg-[#FFFCF5] text-[#1F1B16] ring-1 ring-[#E4DCCB]' : 'text-[#7A7064] hover:text-[#1F1B16]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
