<template>
  <el-card class="function-container" shadow="hover">
    <template #header>
      <div class="file-path">
        <span>{{ path }}</span>
      </div>
    </template>
    <el-scrollbar class="code-container">
      <pre><code v-html="highlightedCode"></code></pre>
    </el-scrollbar>
  </el-card>
</template>
  
<script>
import hljs from 'highlight.js/lib/core';
import 'highlight.js/styles/github-dark.css';

import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import go from 'highlight.js/lib/languages/go';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import rust from 'highlight.js/lib/languages/rust';
import typescript from 'highlight.js/lib/languages/typescript';

const registerLanguages = () => {
  hljs.registerLanguage('c', c);
  hljs.registerLanguage('cpp', cpp);
  hljs.registerLanguage('csharp', csharp);
  hljs.registerLanguage('go', go);
  hljs.registerLanguage('java', java);
  hljs.registerLanguage('javascript', javascript);
  hljs.registerLanguage('python', python);
  hljs.registerLanguage('rust', rust);
  hljs.registerLanguage('typescript', typescript);
};

registerLanguages();
export default {
  props: {
    code: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    lang: {
      type: String,
      required: true,
    },
  },
  computed: {
    highlightedCode() {
      return this.highlightCode(this.code);
    },
  },
  methods: {
    highlightCode(code) {
      return hljs.highlight(code, { language: this.lang, ignoreIllegals: true }).value;
    },
  }
};
</script>

<style scoped>
.function-container {
  margin-bottom: 20px;
  min-height: 100px;
  background-color: var(--vscode-editor-background);
  border: none
}

.el-card:deep(.el-card__header) {
  padding: 5px 10px;
  color: var(--vscode-input-foreground)
}

.code-container {
  max-height: 200px;
  overflow: auto;
}

.file-path {
  font-size: 14px;
  font-weight: bold;
  font-style: italic;
  color: var(--vscode-editor-foreground);
}
</style>