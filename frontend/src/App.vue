<script setup lang="ts">
import { ref, nextTick } from 'vue';
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

// --- State Management ---
const usernameInput = ref('');
const user = ref<GithubUser | null>(null);
const repos = ref<GithubRepo[]>([]);
const issues = ref<SecurityIssue[]>([]);
const sensitiveFiles = ref<string[]>([]);
const riskReport = ref<{ score: number; level: string } | null>(null);

const loading = ref(false);
const scanning = ref(false);
const showModal = ref(false); // Controls the VulnerabilityReport Modal
const selectedRepo = ref('');
const error = ref('');

/**
 * Fetches user profile and repository list
 */
const onSearch = async () => {
  if (!usernameInput.value.trim()) return;
  
  loading.value = true;
  error.value = '';
  user.value = null;
  repos.value = [];
  showModal.value = false;

  try {
    const data = await githubService.getProfile(usernameInput.value);
    user.value = data.userProfile;
    repos.value = data.repositories;
  } catch (err) {
    error.value = 'Target not found in global registry.';
  } finally {
    loading.value = false;
  }
};

/**
 * Handles the deep-scan logic for a specific repository
 */
const handleRepoScan = async (repoName: string) => {
  if (!user.value) return;

  selectedRepo.value = repoName;
  scanning.value = true;
  error.value = '';
  
  // Reset previous scan data
  issues.value = [];
  sensitiveFiles.value = [];
  riskReport.value = null;

  try {
    const data = await githubService.scanRepository(user.value.username, repoName);

    // Populate reactive state with backend results
    issues.value = data.issues;
    riskReport.value = data.risk;
    sensitiveFiles.value = data.sensitiveFiles || [];

    // Small delay for UI smoothness before popping the modal
    await nextTick();
    scanning.value = false;
    showModal.value = true; 
  } catch (err) {
    error.value = 'Reconnaissance failed. API limit or network error.';
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

      <div v-if="user" class="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-10">
        
        <aside class="lg:col-span-4 space-y-8">
          <ProfileCard :user="user" />
          
          <Transition name="slide-up">
            <ThreatAssessment 
              :scanning="scanning" 
              :selected-repo="selectedRepo" 
              :risk-report="riskReport" 
            />
          </Transition>
        </aside>

        <main class="lg:col-span-8">
          <RepositoryGrid 
            :repos="repos" 
            :scanning-repo-name="scanning ? selectedRepo : ''"
            @select="handleRepoScan"
          />
        </main>
      </div>



    </div>

    <VulnerabilityReport
      :is-open="showModal"
      :issues="issues"
      :sensitive-files="sensitiveFiles"
      :repo-name="selectedRepo"
      @close="showModal = false"
    />

    <Transition name="fade">
      <div v-if="error" class="fixed bottom-8 right-8 bg-red-600 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold flex items-center gap-3 z-[100]">
        <span>⚠️</span> {{ error }}
      </div>
    </Transition>
  </div>
</template>

<style>
/* Transition animations */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-up-enter-active { transition: all 0.4s ease-out; }
.slide-up-enter-from { transform: translateY(20px); opacity: 0; }

/* Global scrollbar styling for a darker aesthetic */
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: #020617; }
::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: #334155; }
</style>