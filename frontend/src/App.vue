<script setup lang="ts">
import { ref } from 'vue';
import { githubService } from './services/github.service';

// Components
import DashboardHeader from './components/base/DashboardHeader.vue';
import ProfileCard from './components/github/ProfileCard.vue';
import ThreatAssessment from './components/github/ThreatAssessment.vue';
import RepositoryGrid from './components/github/RepositoryGrid.vue';
import VulnerabilityReport from './components/github/VulnerabilityReport.vue';

// Types
import type { GithubUser } from './types/user';
import type { GithubRepo } from './types/repository';
import type { SecurityIssue } from './types/security';

// --- Typed State ---
const usernameInput = ref('');
const user = ref<GithubUser | null>(null);
const repos = ref<GithubRepo[]>([]);
const issues = ref<SecurityIssue[]>([]);
const riskReport = ref<{ score: number; level: string } | null>(null);

const loading = ref(false);
const scanning = ref(false);
const selectedRepo = ref('');
const error = ref('');

const onSearch = async () => {
  if (!usernameInput.value.trim()) return;
  loading.value = true;
  error.value = '';
  user.value = null;
  repos.value = [];
  
  try {
    const data = await githubService.getProfile(usernameInput.value);
    user.value = data.userProfile;
    repos.value = data.repositories;
  } catch (err) {
    error.value = "Target not found in global registry.";
  } finally {
    loading.value = false;
  }
};

const handleRepoScan = async (repoName: string) => {
  // Guard Clause: Fixes the 'possibly null' and 'never' errors
  if (!user.value) return;

  selectedRepo.value = repoName;
  scanning.value = true;
  issues.value = [];
  riskReport.value = null;

  try {
    // TypeScript now knows user.value is NOT null here
    const data = await githubService.scanRepository(user.value.username, repoName);
    riskReport.value = data.risk;
    issues.value = data.issues;
  } catch (err) {
    error.value = "Audit failed for " + repoName;
  } finally {
    scanning.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-10 font-sans selection:bg-indigo-500/30">
    <div class="max-w-7xl mx-auto">
      
      <DashboardHeader 
        v-model="usernameInput" 
        :loading="loading" 
        @search="onSearch" 
      />

      <div v-if="user" class="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        <aside class="lg:col-span-4 space-y-8">
          <ProfileCard :user="user" />
          <ThreatAssessment 
            :scanning="scanning" 
            :selected-repo="selectedRepo" 
            :risk-report="riskReport" 
          />
        </aside>

        <main class="lg:col-span-8 space-y-10">
          <RepositoryGrid 
            :repos="repos" 
            :scanning-repo-name="scanning ? selectedRepo : ''" 
            @select="handleRepoScan" 
          />
          <VulnerabilityReport 
            :issues="issues" 
            :scanning="scanning" 
            :repo-name="selectedRepo" 
          />
        </main>

      </div>

      <div v-else class="py-48 text-center">
        <div class="inline-block p-12 bg-slate-900/40 rounded-[3rem] border border-slate-800/50 backdrop-blur-xl">
          <p class="text-8xl mb-8 drop-shadow-2xl">⚡</p>
          <p class="text-2xl font-light text-slate-400 max-w-md mx-auto leading-relaxed">
            Systems ready. Provide a <span class="text-white font-bold underline decoration-indigo-500 decoration-2">GitHub handle</span> to begin reconnaissance.
          </p>
        </div>
      </div>

    </div>

    <Transition name="fade">
      <div v-if="error" class="fixed bottom-8 right-8 bg-red-600 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold flex items-center gap-3">
        <span>⚠️</span> {{ error }}
      </div>
    </Transition>
  </div>
</template>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@keyframes progress-indeterminate {
  0% { transform: translateX(-100%); width: 25%; }
  50% { width: 45%; }
  100% { transform: translateX(400%); width: 25%; }
}
.animate-progress-indeterminate {
  animation: progress-indeterminate 1.8s infinite linear;
}
</style>