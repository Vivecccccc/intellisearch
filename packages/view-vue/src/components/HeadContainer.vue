
<script>
import { UserFilled } from '@element-plus/icons-vue'
// const logoUrl = useWebviewPublicPath(logoPath)
// console.log(logoUrl)
const vscode = acquireVsCodeApi()

export default {
  data() {
    return {
      searchQuery: '',
      fullscreenLoading: false,
      // logoUrl: useWebviewPublicPath(logoPath),
      userFilled: UserFilled
    };
  },
  methods: {
    login() {
      console.log('Login')
      vscode.postMessage({
        command: 'login'
      });
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
};
</script>

<template>
  <div class="head-container">
    <div class="avatar" @click="login">
      <el-avatar :icon="userFilled" />
    </div>
    <el-input type="textarea" class="search-bar" v-model="searchQuery" placeholder="Search..." :autosize="{minRows:1, maxRows:4}" resize="none"></el-input>
    <!-- <el-button color="#FF3333">Search</el-button> -->
    <el-button
      v-loading.fullscreen.lock="fullscreenLoading"
      type="primary"
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