<template>
  <el-container class="results-container">
    <el-main>
      <el-card v-if="searchResults.length > 0" v-infinite-scroll="loadMore" infinite-scroll-distance="20" class="results-wrapper-upper">
        <FunctionContainer v-for="result in searchResults" :key="result.hash" :code="result.code"  :path="result.path" :lang="result.lang"/>
      </el-card>
      <el-divider v-else content-position="left">No Search Results</el-divider>
    </el-main>
  </el-container>
</template>

<script>
import FunctionContainer from './FunctionContainer.vue';
import { ElLoading } from 'element-plus';

import { vscodeApi } from '../App.vue';

export default {
  components: {
    FunctionContainer,
  },
  data() {
    return {
      searchResults: [],
      busy: false,
      loadingState: null,
    };
  },
  methods: {
    loadMore() {
      console.log(this.busy)
      if (this.busy) return;
      this.busy = true;
      this.loadingState = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(122, 122, 122, 0.25)',
      })
      vscodeApi.postMessage({ command: 'loadMore', numOfMethods: 5 });
    },
    fetchMethods(msg) {
      const command = msg.command;
      if (command === 'updateMethods') {
        const { methods, addOp } = msg;
        methods.forEach(methodElem => {
          this.operateData(methodElem, addOp)
        });
      };
    },
    operateData(methodElem, addOp) {
      const { hash, filePath, method, shown, lang } = methodElem;
      const methodFull = method.full;
      if (addOp && shown) {
        this.searchResults.push({ hash, code: methodFull, path: filePath, lang });
      } 
      else if (!addOp && !shown) {
        const index = this.searchResults.findIndex(item => item.hash === hash);
        this.searchResults.splice(index, 1);
      }
    }
  },
  mounted() {
    window.addEventListener('message', event => {
      const message = event.data;
      const loadingStateInstance = this.loadingState;
      // take an arbitrary break...
      const timeout = Math.random() * 1.3 + 0.2;
      setTimeout(() => {
        this.fetchMethods(message);
        if (loadingStateInstance !== null) {
          console.log(this.busy)
          this.busy = false;
          loadingStateInstance.close();
        }
      }, timeout * 1000);
    });
    this.loadMore();
  },
}
</script>

<style scoped>
.results-container {
  margin-top: 0px;
}

.boundary-line {
  text-align: center;
  margin: 20px 0;
}

.el-divider:deep(.el-divider__text) {
  background-color: var(--vscode-sideBar-background);
  color: var(--vscode-editor-foreground);
  font-weight: bold;
}
.el-divider--horizontal {
  border-top: 1.5px var(--vscode-editor-foreground) solid;
}
.el-card {
  border-radius: 10px;
}
.results-wrapper-upper {
  background-color: transparent;
  border: none;
  box-shadow: -5px -5px 10px rgba(0, 0, 0, 0.12), /* 加深左上角阴影 */
  5px -5px 10px rgba(0, 0, 0, 0.12), /* 加深右上角阴影 */
  0px -3px 5px rgba(0, 0, 0, 0.12) !important;   /* 微小但加深的向上阴影 */
}
</style>