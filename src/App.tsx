import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Code2,
  Copy,
  ExternalLink,
  Filter,
  GitBranch,
  MoonStar,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Star,
  SunMedium,
} from 'lucide-react'

type ThemeMode = 'light' | 'dark'

type IssueItem = {
  id: number
  title: string
  repo: string
  language: string
  html_url: string
  labels: string[]
  created_at: string
  updated_at: string
  stars: number
  isBeginnerFriendly: boolean
  source: string
}

type ScenarioKey = 'general' | 'docs' | 'bugfix' | 'ui'

const LANGUAGE_OPTIONS = [
  'All languages',
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C++',
  'HTML',
  'CSS',
  'Rust',
  'Go',
]

const DEMO_ISSUES: IssueItem[] = [
  {
    id: 1,
    title: 'Fix accessibility contrast in onboarding flow',
    repo: 'github/docs',
    language: 'TypeScript',
    html_url: 'https://github.com/github/docs/issues/1',
    labels: ['good first issue', 'accessibility'],
    created_at: '2024-01-08T12:00:00Z',
    updated_at: '2024-01-10T10:00:00Z',
    stars: 208,
    isBeginnerFriendly: true,
    source: 'Demo mode: public issue examples',
  },
  {
    id: 2,
    title: 'Document local dev setup for new contributors',
    repo: 'open-source-starter/tooling',
    language: 'Markdown',
    html_url: 'https://github.com/open-source-starter/tooling/issues/12',
    labels: ['documentation', 'help wanted'],
    created_at: '2024-02-15T12:30:00Z',
    updated_at: '2024-02-19T09:10:00Z',
    stars: 89,
    isBeginnerFriendly: true,
    source: 'Demo mode: public issue examples',
  },
]

const gitCommandLibrary = {
  clone: {
    command: 'git clone https://github.com/OWNER/REPO.git',
    description: 'Downloads a copy of the repository to your local machine.',
    whenToUse: 'Use when you want to work on a project for the first time.',
    safeExample: 'git clone https://github.com/microsoft/vscode.git',
    commonMistakes: 'Using the wrong URL, or cloning a repository without checking the README first.',
  },
  status: {
    command: 'git status',
    description: 'Shows which files are modified, added, or untracked.',
    whenToUse: 'Use before committing or after making a few changes.',
    safeExample: 'git status',
    commonMistakes: 'Ignoring the repository state and committing unrelated files.',
  },
  switch: {
    command: 'git switch -c feature/my-change',
    description: 'Creates a new branch and switches to it.',
    whenToUse: 'Use before making a new code change in a fork or local repo.',
    safeExample: 'git switch -c docs/fix-typo',
    commonMistakes: 'Working directly on the default branch when you need isolated changes.',
  },
  add: {
    command: 'git add src/App.tsx',
    description: 'Stages your selected file changes for commit.',
    whenToUse: 'Use after you finish a focused edit and before committing.',
    safeExample: 'git add src/App.tsx README.md',
    commonMistakes: 'Adding every file in the repository without checking what changed.',
  },
  commit: {
    command: 'git commit -m "Fix issue navigation for beginners"',
    description: 'Saves a snapshot of your staged changes with a clear message.',
    whenToUse: 'Use after reviewing the diff and making sure the change is intentional.',
    safeExample: 'git commit -m "Add missing README setup instructions"',
    commonMistakes: 'Committing without reading the diff or using vague messages like "updates".',
  },
  pull: {
    command: 'git pull --ff-only origin main',
    description: 'Brings the latest changes from the branch you are tracking.',
    whenToUse: 'Use before making changes or when you want to sync with the latest upstream work.',
    safeExample: 'git pull --ff-only origin main',
    commonMistakes: 'Pulling with merge conflicts unresolved or ignoring upstream updates.',
  },
  push: {
    command: 'git push origin feature/my-change',
    description: 'Uploads your local branch to your fork or remote repository.',
    whenToUse: 'Use after committing and when ready to open a pull request.',
    safeExample: 'git push origin feature/my-change',
    commonMistakes: 'Pushing to the wrong remote branch or forgetting to create a feature branch first.',
  },
  diff: {
    command: 'git diff -- src/App.tsx',
    description: 'Shows the exact changes made in a file before you commit or open a PR.',
    whenToUse: 'Use to review code before submission and spot mistakes quickly.',
    safeExample: 'git diff -- README.md src/App.tsx',
    commonMistakes: 'Skipping the review step and accepting accidental edits.',
  },
} as const

const scenarioSteps: Record<ScenarioKey, string[]> = {
  general: [
    'Find a suitable repository.',
    'Read its README and CONTRIBUTING guide.',
    'Check the issue and ask questions if needed.',
    'Fork the repository.',
    'Clone the fork.',
    'Create a feature branch.',
    'Make a small change.',
    'Run tests and review the diff.',
    'Commit changes.',
    'Push the branch to the user\'s fork.',
    'Open a pull request.',
    'Respond to maintainer feedback.',
  ],
  docs: [
    'Find a suitable repository.',
    'Read its README and CONTRIBUTING guide.',
    'Check the issue and ask questions if needed.',
    'Fork the repository.',
    'Clone the fork.',
    'Create a feature branch.',
    'Update the documentation or examples.',
    'Run relevant checks and review the diff.',
    'Commit changes.',
    'Push the branch to the user\'s fork.',
    'Open a pull request.',
    'Respond to maintainer feedback.',
  ],
  bugfix: [
    'Find a suitable repository.',
    'Read its README and CONTRIBUTING guide.',
    'Reproduce the bug locally.',
    'Check the issue and ask questions if needed.',
    'Fork the repository.',
    'Clone the fork.',
    'Create a feature branch.',
    'Make a small, testable fix.',
    'Run tests and review the diff.',
    'Commit changes.',
    'Push the branch to the user\'s fork.',
    'Open a pull request.',
    'Respond to maintainer feedback.',
  ],
  ui: [
    'Find a suitable repository.',
    'Read its README and CONTRIBUTING guide.',
    'Check the issue and ask questions if needed.',
    'Fork the repository.',
    'Clone the fork.',
    'Create a feature branch.',
    'Build a small UI improvement.',
    'Run tests and review the diff.',
    'Commit changes.',
    'Push the branch to the user\'s fork.',
    'Open a pull request.',
    'Respond to maintainer feedback.',
  ],
}

const scenarioCommandMap: Record<ScenarioKey, string[]> = {
  general: [
    'git clone https://github.com/OWNER/REPO.git',
    'git switch -c feature/my-change',
    'git add .',
    'git commit -m "Fix beginner contribution issue"',
    'git push origin feature/my-change',
  ],
  docs: [
    'git clone https://github.com/OWNER/REPO.git',
    'git switch -c docs/fix-setup-guide',
    'git add README.md docs/',
    'git commit -m "Clarify setup for new contributors"',
    'git push origin docs/fix-setup-guide',
  ],
  bugfix: [
    'git clone https://github.com/OWNER/REPO.git',
    'git switch -c fix/login-error',
    'git add src/ auth/',
    'git commit -m "Fix login validation bug"',
    'git push origin fix/login-error',
  ],
  ui: [
    'git clone https://github.com/OWNER/REPO.git',
    'git switch -c ui/contrast-tweak',
    'git add src/components/',
    'git commit -m "Improve accessibility in onboarding UI"',
    'git push origin ui/contrast-tweak',
  ],
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(value),
  )

function App() {
  const [issues, setIssues] = useState<IssueItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('All languages')
  const [selectedStatus, setSelectedStatus] = useState('open')
  const [repoFilter, setRepoFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [demoMode, setDemoMode] = useState(false)
  const [page, setPage] = useState(1)
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light'
    return window.localStorage.getItem('openhub-theme') === 'dark' ? 'dark' : 'light'
  })
  const [scenario, setScenario] = useState<ScenarioKey>('general')
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({})

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('openhub-theme', theme)
  }, [theme])

  const loadIssues = useCallback(
    async (nextPage = 1) => {
      const queryParts = ['is:issue', 'state:open']
      if (searchTerm.trim()) {
        queryParts.push(searchTerm.trim())
      }
      if (selectedLanguage !== 'All languages') {
        queryParts.push(`language:${selectedLanguage}`)
      }
      if (repoFilter.trim()) {
        queryParts.push(`repo:${repoFilter.trim()}`)
      }
      if (selectedStatus && selectedStatus !== 'all') {
        queryParts.push(`state:${selectedStatus}`)
      }
      if (nextPage === 1) {
        setIssues([])
      }

      setIsLoading(true)
      setError('')

      try {
        const query = encodeURIComponent(queryParts.join(' '))
        const response = await fetch(
          `https://api.github.com/search/issues?q=${query}&sort=updated&order=desc&per_page=5&page=${nextPage}`,
        )

        if (!response.ok) {
          const message =
            response.status === 403 || response.status === 429
              ? 'GitHub API rate limit reached. Please retry soon or use demo mode.'
              : `GitHub API request failed (${response.status}: ${response.statusText || 'unknown error'}).`
          throw new Error(message)
        }

        const data = await response.json()
        const items = Array.isArray(data.items) ? data.items : []

        const normalized = await Promise.all(
          items
            .filter((item: { pull_request?: { url?: string } }) => !item.pull_request)
            .map(async (item: any) => {
              const repoMeta = await fetch(item.repository_url)
              const repoData = repoMeta.ok ? await repoMeta.json() : null

              const labels = Array.isArray(item.labels)
                ? item.labels.map((label: any) => label.name).filter(Boolean)
                : []

              return {
                id: item.id,
                title: item.title,
                repo: item.repository?.full_name || item.repository_url.replace('https://api.github.com/repos/', ''),
                language: repoData?.language || selectedLanguage || 'TypeScript',
                html_url: item.html_url,
                labels,
                created_at: item.created_at,
                updated_at: item.updated_at,
                stars: repoData?.stargazers_count || 0,
                isBeginnerFriendly:
                  labels.some((label: string) =>
                    ['good first issue', 'first-timers-only', 'help wanted'].includes(label.toLowerCase()),
                  ) || item.title.toLowerCase().includes('beginner'),
                source: `GitHub Issue • ${item.repository?.full_name || item.repository_url}`,
              }
            }),
        )

        const deduped = normalized.filter((item) => item.title && item.repo)
        setIssues((current) => (nextPage === 1 ? deduped : [...current, ...deduped]))
        setDemoMode(false)
      } catch (errorValue) {
        const message =
          errorValue instanceof Error
            ? errorValue.message
            : 'Unable to load public issues right now. Try demo mode.'
        setError(message)
        setIssues(DEMO_ISSUES)
        setDemoMode(true)
      } finally {
        setIsLoading(false)
      }
    },
    [repoFilter, searchTerm, selectedLanguage, selectedStatus],
  )

  useEffect(() => {
    void loadIssues(1)
  }, [loadIssues])

  useEffect(() => {
    if (page > 1) {
      void loadIssues(page)
    }
  }, [loadIssues, page])

  const visibleIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (selectedLanguage !== 'All languages' && issue.language !== selectedLanguage) {
        return false
      }
      if (searchTerm.trim()) {
        const haystack = `${issue.title} ${issue.repo} ${issue.labels.join(' ')}`.toLowerCase()
        if (!haystack.includes(searchTerm.trim().toLowerCase())) {
          return false
        }
      }
      return true
    })
  }, [issues, selectedLanguage, searchTerm])

  const toggleStep = (step: string) => {
    setCompletedSteps((current) => ({ ...current, [step]: !current[step] }))
  }

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      // no-op for success state in UI; the button text updates during event handling below
    } catch {
      window.alert('Clipboard access is unavailable. Please copy the command manually.')
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <header className="sticky top-0 z-20 mb-8 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
          <nav className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white dark:bg-slate-100 dark:text-slate-900">
                GH
              </div>
              <div>
                <p className="text-lg font-semibold">OpenHub</p>
              </div>
            </div>

            <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex dark:text-slate-300">
              <a href="#issues" className="transition hover:text-slate-900 dark:hover:text-white">Explore Issues</a>
              <a href="#cheat-sheet" className="transition hover:text-slate-900 dark:hover:text-white">PR Cheat Sheet</a>
              <a href="#git-basics" className="transition hover:text-slate-900 dark:hover:text-white">Git Basics</a>
            </div>

            <button
              type="button"
              aria-label="Toggle dark mode"
              onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {theme === 'dark' ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </nav>
        </header>

        <main className="space-y-10">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  Beginner buckets
                </div>
                <div className="space-y-4">
                  <h1 className="max-w-xl text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                    Your First Open Source Contribution Starts Here.
                  </h1>
                  <p className="max-w-xl text-base text-slate-600 dark:text-slate-300">
                    Explore real GitHub issues, understand what “beginner-friendly” actually means, and build confidence with a guided first PR checklist.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                    <Search className="h-4 w-4" /> Public GitHub issue discovery
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                    <ShieldAlert className="h-4 w-4" /> Read-only by default
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/60">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    Why it matters
                  </p>
                  <BookOpen className="h-5 w-5 text-emerald-600" />
                </div>
                <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex gap-3"><ChevronRight className="mt-0.5 h-4 w-4 text-emerald-600" /> Find issues that match your current skill level.</li>
                  <li className="flex gap-3"><ChevronRight className="mt-0.5 h-4 w-4 text-emerald-600" /> Learn Git commands in plain English.</li>
                  <li className="flex gap-3"><ChevronRight className="mt-0.5 h-4 w-4 text-emerald-600" /> Avoid common mistakes before making your first PR.</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="issues" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Explore Issues</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Beginner-friendly GitHub issues</h2>
              </div>
              <button
                type="button"
                onClick={() => void loadIssues(1)}
                className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <label className="space-y-2 text-sm font-medium text-slate-600 dark:text-slate-300 xl:col-span-2">
                <span>Search issues</span>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    aria-label="Search issues"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search titles, repos, technologies"
                    className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
                  />
                </div>
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                <span>Language</span>
                <select
                  aria-label="Language"
                  value={selectedLanguage}
                  onChange={(event) => setSelectedLanguage(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {LANGUAGE_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                <span>Issue status</span>
                <select
                  aria-label="Issue status"
                  value={selectedStatus}
                  onChange={(event) => setSelectedStatus(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="all">All</option>
                </select>
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                <span>Repository</span>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800">
                  <Filter className="h-4 w-4 text-slate-400" />
                  <input
                    aria-label="Repository"
                    value={repoFilter}
                    onChange={(event) => setRepoFilter(event.target.value)}
                    placeholder="owner/repo"
                    className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
                  />
                </div>
              </label>
            </div>

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                <AlertTriangle className="mt-0.5 h-4 w-4" />
                <div>
                  <p className="font-semibold">{demoMode ? 'Demo mode active' : 'Issue load error'}</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-48 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
                  ))}
                </div>
              ) : visibleIssues.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center dark:border-slate-700 dark:bg-slate-800/60">
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">No issues match your filters.</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Try removing a search term or selecting a different language to explore more repositories.
                  </p>
                </div>
              ) : (
                <>
                  {visibleIssues.map((issue) => (
                    <article
                      key={issue.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/60"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                            <span className="rounded-full bg-slate-200 px-2 py-1 dark:bg-slate-700">{issue.repo}</span>
                            {issue.isBeginnerFriendly && (
                              <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                                beginner-friendly
                              </span>
                            )}
                          </div>

                          <a href={issue.html_url} target="_blank" rel="noreferrer" className="text-xl font-semibold text-slate-900 hover:text-sky-600 dark:text-white">
                            {issue.title}
                          </a>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                            <span className="inline-flex items-center gap-1"><Code2 className="h-4 w-4" /> {issue.language}</span>
                            <span className="inline-flex items-center gap-1"><Star className="h-4 w-4" /> {issue.stars} stars</span>
                            <span>Created {formatDate(issue.created_at)}</span>
                          </div>
                        </div>

                        <a
                          href={issue.html_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 self-start rounded-full bg-slate-900 px-3 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-900"
                        >
                          View issue
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {issue.labels.length > 0 ? (
                          issue.labels.map((label) => (
                            <span key={label} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200">
                              {label}
                            </span>
                          ))
                        ) : (
                          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200">
                            No labels provided
                          </span>
                        )}
                      </div>

                      <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                        {issue.source} • Labels are assigned by maintainers and do not guarantee that an issue is easy.
                      </p>
                    </article>
                  ))}

                  <div className="flex justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => setPage((current) => current + 1)}
                      className="rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
                    >
                      Load more
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>

          <section id="cheat-sheet" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">PR Cheat Sheet</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">First pull request guide</h2>
              </div>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className="space-y-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                <span>Contribution scenario</span>
                <select
                  aria-label="Contribution scenario"
                  value={scenario}
                  onChange={(event) => setScenario(event.target.value as ScenarioKey)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="general">General contribution</option>
                  <option value="docs">Docs / onboarding</option>
                  <option value="bugfix">Bug fix</option>
                  <option value="ui">UI improvement</option>
                </select>
              </label>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-3">
                {scenarioSteps[scenario].map((step) => (
                  <label key={step} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                    <input
                      type="checkbox"
                      checked={Boolean(completedSteps[step])}
                      onChange={() => toggleStep(step)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{step}</span>
                  </label>
                ))}
              </div>

              <div className="space-y-4">
                {scenarioCommandMap[scenario].map((command) => (
                  <div key={command} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Git command</span>
                      <button
                        type="button"
                        onClick={() => void copyToClipboard(command)}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                      >
                        <Copy className="h-3.5 w-3.5" /> Copy
                      </button>
                    </div>
                    <code className="block overflow-x-auto rounded-xl bg-slate-900 px-3 py-2 text-sm text-sky-100">{command}</code>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="git-basics" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Git Basics</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Common commands explained clearly</h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {Object.entries(gitCommandLibrary).map(([key, value]) => (
                <article key={key} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/60">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 font-mono text-sm font-semibold text-slate-900 dark:text-white">
                      <GitBranch className="h-4 w-4 text-emerald-600" />
                      {key === 'switch' ? 'git switch -c' : `git ${key}`}
                    </div>
                    <button
                      type="button"
                      onClick={() => void copyToClipboard(value.command)}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                    >
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </button>
                  </div>

                  <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">{value.description}</p>
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <li><span className="font-semibold text-slate-900 dark:text-white">When to use it:</span> {value.whenToUse}</li>
                    <li><span className="font-semibold text-slate-900 dark:text-white">Safe example:</span> {value.safeExample}</li>
                    <li><span className="font-semibold text-slate-900 dark:text-white">Common mistakes:</span> {value.commonMistakes}</li>
                  </ul>
                </article>
              ))}
            </div>
          </section>
        </main>

        <footer className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-base font-semibold text-slate-900 dark:text-white">OpenHub</p>
              <p className="mt-1">A beginner-friendly portal to find public open-source issues and learn Git confidently.</p>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-sky-600">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-900 dark:bg-slate-700 dark:text-slate-100">GH</span>
                GitHub
              </a>
              <a href="https://github.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-sky-600">
                <CheckCircle2 className="h-4 w-4" /> Contribution guidelines
              </a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}

export default App
