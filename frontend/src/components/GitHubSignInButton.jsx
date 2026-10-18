import { getGitHubSignInUrl } from '../api'

export default function GitHubSignInButton() {
  const handleClick = () => {
    window.location.href = getGitHubSignInUrl()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E4DCCB] bg-[#FFFCF5] px-4 py-2 text-sm font-medium text-[#1F1B16] transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B5532F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F6F1E7]"
      aria-label="Sign in with GitHub"
    >
      <span aria-hidden="true">GitHub</span>
      <span aria-hidden="true" className="text-base font-semibold">→</span>
    </button>
  )
}
