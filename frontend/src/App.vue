<script setup lang="ts">
import { ref } from 'vue'

interface GithubUser {
  id: string
  username: string
  displayName: string | null
  avatarUrl: string
  bio: string | null
  repoCount: number
  totalCommits?: number
}

interface GithubRepo {
  name: string
  fullName: string
  isPrivate: boolean
  description: string | null
  language: string | null
  stars: number
  forks: number
}

interface SecurityIssue {
  path: string
  reason: string
}

const username = ref('')
const user = ref<GithubUser | null>(null)
const loading = ref(false)
const error = ref('')
const repos = ref<GithubRepo[]>([])
const repoLoading = ref(false)
const selectedRepo = ref<string | null>(null)
const issues = ref<SecurityIssue[]>([])
const scanning = ref(false)

const fetchUser = async () => {
  if (!username.value.trim()) return
  loading.value = true
  error.value = ''
  try {
    const response = await fetch(`http://localhost:3000/github/user/${username.value}`)
    if (!response.ok) throw new Error('User not found')
    user.value = await response.json()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred'
    user.value = null
    repos.value = []
  } finally {
    loading.value = false
  }
}

const fetchRepos = async () => {
  if (!user.value) return
  repoLoading.value = true
  error.value = ''
  try {
    const response = await fetch(`http://localhost:3000/github/user/${user.value.username}/repos`)
    if (!response.ok) throw new Error('Repos not found')
    repos.value = await response.json()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred'
    repos.value = []
  } finally {
    repoLoading.value = false
  }
}

const scanRepo = async (repoName: string) => {
  selectedRepo.value = repoName
  scanning.value = true
  issues.value = []
  error.value = ''
  try {
    const response = await fetch(`http://localhost:3000/github/user/${user.value?.username}/repos/${repoName}/security`)
    if (!response.ok) throw new Error('Security scan failed')
    issues.value = await response.json()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred'
    issues.value = []
  } finally {
    scanning.value = false
  }
}
</script>

<template>
  <div class="app">
    <h1>GitHub User Profile</h1>
    <div class="search">
      <input v-model="username" placeholder="Enter GitHub username" @keyup.enter="fetchUser" />
      <button @click="fetchUser" :disabled="loading">Search</button>
    </div>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="user" class="profile">
      <img :src="user.avatarUrl" :alt="user.username" class="avatar" />
      <h2>{{ user.displayName || user.username }}</h2>
      <p>@{{ user.username }}</p>
      <p v-if="user.bio">{{ user.bio }}</p>
      <p>Repositories: {{ user.repoCount }}</p>
      <p v-if="user.totalCommits !== undefined">Total Commits: {{ user.totalCommits }}</p>
      <button @click="fetchRepos" :disabled="repoLoading">Load Repos</button>

      <div v-if="repoLoading" class="loading">Loading repositories...</div>

      <ul v-if="repos.length" class="repo-list">
        <li v-for="repo in repos" :key="repo.fullName">
          <h4>{{ repo.name }}</h4>
          <p>{{ repo.description || 'No description' }}</p>
          <p>Language: {{ repo.language || 'N/A' }}</p>
          <p>★{{ repo.stars }} | Forks: {{ repo.forks }}</p>
          <button @click="scanRepo(repo.name)" :disabled="scanning">Scan for .env-like files</button>
        </li>
      </ul>

      <div v-if="selectedRepo" class="issues">
        <h4>Security scan for {{ selectedRepo }}</h4>
        <div v-if="scanning" class="loading">Scanning...</div>
        <div v-else>
          <ul v-if="issues.length">
            <li v-for="issue in issues" :key="issue.path"><strong>{{ issue.path }}</strong>: {{ issue.reason }}</li>
          </ul>
          <p v-else>No suspicious files found!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.search {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

input {
  flex: 1;
  padding: 10px;
  font-size: 16px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  font-size: 18px;
}

.error {
  color: red;
  text-align: center;
}

.profile {
  text-align: center;
}

.avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  margin-bottom: 20px;
}

h2 {
  margin-bottom: 10px;
}
</style>
