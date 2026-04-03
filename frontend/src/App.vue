<script setup lang="ts">
import { ref } from 'vue';
import { githubService } from './services/github.service';

// Import the separated interfaces
import type { GithubUser } from './types/user';
import type { GithubRepo } from './types/repository';
import type { SecurityIssue } from './types/security';

// Import reusable components
import UserProfile from './components/github/UserProfile.vue';
import RepoCard from './components/github/RepoCard.vue';
import SecurityIssueItem from './components/github/SecurityIssueItem.vue';
import BaseButton from './components/base/BaseButton.vue';

// --- State with Explicit TypeScript Generics ---
const username = ref('');
const user = ref<GithubUser | null>(null);
const repos = ref<GithubRepo[]>([]);
const issues = ref<SecurityIssue[]>([]);

const loading = ref(false);
const scanning = ref(false);
const selectedRepo = ref('');
const error = ref('');

// --- Logic ---
const onSearch = async () => {
  if (!username.value.trim()) return;
  
  loading.value = true;
  error.value = '';
  try {
    user.value = await githubService.getUser(username.value);
    repos.value = await githubService.getRepos(username.value);
    issues.value = [];
    selectedRepo.value = '';
  } catch (err) {
    error.value = 'Failed to fetch user data. Please check the username.';
    user.value = null;
    repos.value = [];
  } finally {
    loading.value = false;
  }
};

const onScan = async (repoName: string) => {
  if (!user.value) return;

  selectedRepo.value = repoName;
  scanning.value = true;
  error.value = '';
  
  try {
    issues.value = await githubService.scanRepo(user.value.username, repoName);
  } catch (err) {
    error.value = `Failed to scan ${repoName}`;
  } finally {
    scanning.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12 font-sans">
    <div class="max-w-6xl mx-auto">
      
      <header class="mb-12 flex flex-col md:flex-row gap-4 items-center">
        <div class="flex-1 w-full">
          <h1 class="text-3xl font-black text-white mb-2">DevFocus Audit</h1>
          <p class="text-slate-500 text-sm">Full-stack security reconnaissance tool</p>
        </div>
        
        <div class="flex w-full md:w-auto gap-3 bg-slate-900 p-2 rounded-2xl border border-slate-800 shadow-xl">
          <input 
            v-model="username" 
            placeholder="Enter GitHub Username" 
            class="bg-transparent px-4 py-2 focus:outline-none flex-1 md:w-64"
            @keyup.enter="onSearch"
          />
          <BaseButton @click="onSearch" :loading="loading">
            Analyze
          </BaseButton>
        </div>
      </header>

      <div v-if="error" class="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
        {{ error }}
      </div>

      <div v-if="user" class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <aside class="lg:col-span-4 space-y-6">
          <UserProfile :user="user" />

          <div v-if="selectedRepo" class="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h3 class="text-white font-bold mb-4 flex items-center justify-between">
              <span>Scan Results</span>
              <span class="text-[10px] text-slate-500 font-mono">{{ selectedRepo }}</span>
            </h3>
            
            <div v-if="scanning" class="py-8 text-center animate-pulse text-slate-500">
              Analyzing repository structure...
            </div>

            <div v-else-if="issues.length > 0" class="space-y-1">
              <SecurityIssueItem 
                v-for="issue in issues" 
                :key="issue.path" 
                :issue="issue" 
              />
            </div>
            
            <div v-else class="py-8 text-center text-green-500">
              <p class="text-2xl mb-2">🛡️</p>
              <p class="text-sm font-bold">No leaks detected in top files.</p>
            </div>
          </div>
        </aside>

        <main class="lg:col-span-8 space-y-4">
          <h2 class="text-xl font-bold text-white px-2">Active Repositories</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RepoCard 
              v-for="repo in repos" 
              :key="repo.fullName" 
              :repo="repo" 
              :is-scanning="scanning && selectedRepo === repo.name"
              @scan="onScan" 
            />
          </div>
        </main>

      </div>

      <div v-else-if="!loading" class="text-center py-24 opacity-30">
        <p class="text-6xl mb-4">🔍</p>
        <p class="text-xl font-medium">Search for a developer to begin the audit</p>
      </div>

    </div>
  </div>
</template>

<style>
/* FIX: In Tailwind v4, styles using @apply MUST reference 
  the main CSS file so the compiler knows what 'bg-slate-950' is.
*/
@reference "./assets/main.css";

body {
  @apply bg-slate-950;
  margin: 0;
}
</style>