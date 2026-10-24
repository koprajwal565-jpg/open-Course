import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import App from './App'

describe('OpenHub app', () => {
  it('filters and searches issues and excludes pull requests', async () => {
    const originalFetch = globalThis.fetch
    globalThis.fetch = vi.fn((input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('search/issues')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            items: [
              {
                id: 1,
                title: 'Fix login bug',
                html_url: 'https://github.com/org/repo/issues/1',
                repository_url: 'https://api.github.com/repos/org/repo',
                user: { login: 'alice' },
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-02T00:00:00Z',
                labels: [{ name: 'good first issue' }, { name: 'bug' }],
                pull_request: undefined,
                repository: { full_name: 'org/repo', stargazers_count: 135 },
              },
              {
                id: 2,
                title: 'Feature request',
                html_url: 'https://github.com/org/repo/pull/2',
                repository_url: 'https://api.github.com/repos/org/repo',
                user: { login: 'bob' },
                created_at: '2024-01-03T00:00:00Z',
                updated_at: '2024-01-04T00:00:00Z',
                labels: [{ name: 'help wanted' }],
                pull_request: { url: 'https://api.github.com/repos/org/repo/pulls/2' },
                repository: { full_name: 'org/repo', stargazers_count: 50 },
              },
              {
                id: 3,
                title: 'Improve TypeScript docs',
                html_url: 'https://github.com/org/docs/issues/7',
                repository_url: 'https://api.github.com/repos/org/docs',
                user: { login: 'charlie' },
                created_at: '2024-01-06T00:00:00Z',
                updated_at: '2024-01-07T00:00:00Z',
                labels: [{ name: 'documentation' }],
                pull_request: undefined,
                repository: { full_name: 'org/docs', stargazers_count: 220 },
              },
            ],
          }),
        } as Response)
      }
      return Promise.resolve({ ok: true, json: async () => ({}) } as Response)
    }) as typeof fetch

    render(<App />)

    const searchInput = await screen.findByLabelText(/search issues/i)
    fireEvent.change(searchInput, { target: { value: 'login' } })

    const languageSelect = screen.getByLabelText(/language/i)
    fireEvent.change(languageSelect, { target: { value: 'TypeScript' } })

    await waitFor(() => {
      expect(screen.getByText('Fix login bug')).toBeInTheDocument()
      expect(screen.queryByText('Improve TypeScript docs')).not.toBeInTheDocument()
    })

    expect(screen.queryByText('Feature request')).not.toBeInTheDocument()

    globalThis.fetch = originalFetch
  })

  it('builds a first pull request checklist from the selected scenario', async () => {
    render(<App />)

    const scenarioSelect = screen.getByLabelText(/contribution scenario/i)
    fireEvent.change(scenarioSelect, { target: { value: 'docs' } })

    expect(await screen.findByText('Find a suitable repository.')).toBeInTheDocument()
    expect(screen.getByText('Open a pull request.')).toBeInTheDocument()
  })

  it('shows an error message when GitHub API fails', async () => {
    const originalFetch = globalThis.fetch
    globalThis.fetch = vi.fn(() => Promise.resolve({ ok: false, status: 403, statusText: 'rate limited' } as Response)) as typeof fetch

    render(<App />)

    expect(await screen.findByText(/GitHub API rate limit|rate limited/i)).toBeInTheDocument()

    globalThis.fetch = originalFetch
  })
})
