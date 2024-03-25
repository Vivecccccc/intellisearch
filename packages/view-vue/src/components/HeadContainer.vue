
<script>
import { UserFilled } from '@element-plus/icons-vue'
// const logoUrl = useWebviewPublicPath(logoPath)
// console.log(logoUrl)
import { vscodeApi } from '../App.vue';

export default {
  data() {
    return {
      searchQuery: '',
      fullscreenLoading: false,
      // logoUrl: useWebviewPublicPath(logoPath),
      userFilled: UserFilled,
      userId: '',
      expiry: 0,
      countdownInterval: null,
    };
  },
  methods: {
    login() {
      vscodeApi.postMessage({
        command: 'login'
      });
    },
    fetchLoginCredential(msg) {
      const command = msg.command;
      if (command === 'loginSuccess') {
        this.userId = msg.credential.userId;
        this.expiry = msg.credential.expiry;
        console.log('Expiry:', this.expiry, 'UserId:', this.userId);
        this.startCountdown();
      }
    },
    startCountdown() {
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
      }
      this.countdownInterval = setInterval(() => {
        if (this.expiry <= 0) {
          clearInterval(this.countdownInterval);
          this.countdownInterval = null;
          this.userId = '';
          this.expiry = 0;
        } else {
          this.expiry -= 1;
        }
      }, 1000);
    },
    search() {
      console.log('Search:', this.searchQuery)
    },
    openFullScreen() {
      this.fullscreenLoading = true;
      setTimeout(() => {
        this.fullscreenLoading = false;
      }, 2000);
    },
  },
  mounted() {
    window.addEventListener('message', event => {
      const message = event.data;
      this.fetchLoginCredential(message)
    });
    if (!this.userId || !this.expiry) {
      this.login();
    }
  },
  beforeUnmount() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  },
  // watch for userId and expiry changing to '' and 0
  watch: {
    userId: function (newVal, oldVal) {
      if (newVal === '' && oldVal !== '') {
        vscodeApi.postMessage({
          command: 'logout'
        });
      }
    },
    expiry: function (newVal, oldVal) {
      if (newVal === 0 && oldVal !== 0) {
        vscodeApi.postMessage({
          command: 'logout'
        });
      }
    }
  }
};
</script>

<template>
  <div class="head-container">
    <div class="avatar" @click="login">
      <el-avatar v-if="!userId" :icon="userFilled"></el-avatar>
      <el-avatar v-else> {{ userId }} </el-avatar>
    </div>
    <el-input type="textarea" class="search-bar" v-model="searchQuery" placeholder="Search..." :autosize="{minRows:1, maxRows:4}" resize="none"></el-input>
    <el-button
      v-loading.fullscreen.lock="fullscreenLoading"
      type="primary"
      :disabled="!userId"
      @click="openFullScreen" element-loading-background="rgba(122, 122, 122, 0.4)" class="search-button">Search</el-button>
  </div>
</template>

<style scoped>
.head-container {
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  background-color: transparent;
  padding: 10px;
  box-shadow: var(--el-box-shadow-light);
}

.avatar {
  cursor: pointer;
  margin-right: 10px;
}

.search-bar {
  flex: 1;
  padding: 5px;
  background-color: transparent;
}
.search-bar:deep(.el-textarea__inner) {
  background-color: var(--vscode-input-background);
  border: none;
  box-shadow: none;
}
.search-bar:deep(.el-textarea__inner::placeholder) {
  color: var(--vscode-input-placeholderForeground);
}
.search-bar:deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px var(--vscode-editor-foreground) inset !important;
}
.search-bar:deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px var(--vscode-inputOption-activeBorder) inset;
}
.search-button {
  background-color: var(--vscode-button-background);
  border: none;
  color: var(--vscode-button-foreground)
}
.search-button:hover, .search-button:active {
  background-color: var(--vscode-button-hoverBackground);
  border: none;
  color: var(--vscode-button-foreground)
}


</style>