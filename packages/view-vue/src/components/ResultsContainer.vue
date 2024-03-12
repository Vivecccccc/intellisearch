<template>
  <el-container class="results-container">
    <el-main>
      <el-card v-if="searchResults.length > 0" class="results-wrapper-upper">
        <FunctionContainer v-for="result in searchResults" :key="result.id" :code="result.code" :path="result.path" :lang="result.lang"/>
      </el-card>
      <p v-else>No search results</p>
      <el-divider content-position="left">Other Functions</el-divider>
      <el-card v-infinite-scroll="loadMore" infinite-scroll-distance="20" class="results-wrapper-lower">
        <FunctionContainer v-for="item in items" :key="item.id" :code="item.code" :path="item.path" :lang="item.lang"/>
      </el-card>
    </el-main>
  </el-container>
</template>

<script>
import FunctionContainer from './FunctionContainer.vue';
import { ElLoading } from 'element-plus';

export default {
  components: {
    FunctionContainer,
  },
  data() {
    return {
      // Mock data for search results
      searchResults: [
        { id: 1, code: 'var a = b + 1', path: '/path-to-code-1', lang: 'javascript' },
        { id: 2, code: 'import Prism from \'prismjs\'; \nimport \'prismjs/themes/prism.css\';', path: '/path-to-code-2', lang: 'javascript' },
      ],
      // Mock data for items that could be loaded
      items: [
        { id: 3, code: 'def add(a, b):\n    print("The sum is", a + b)\n\nadd(3, 4)', path: '/path-to-code-3', lang: 'python' },
        { id: 4, code: 'public class Main {\n    public static void main(String[] args) {\n        add(3, 4);\n    }\n    \n    public static void add(int a, int b) {\n        System.out.println("The sum is " + (a + b));\n    }\n}', path: '/path-to-code-4', lang: 'java' },
        { id: 5, code: '#include <iostream>\n\nvoid add(int a, int b) {\n    std::cout << "The sum is " << (a + b) << std::endl;\n}\n\nint main() {\n    add(3, 4);\n    return 0;\n}', path: '/path-to-code-5', lang: 'cpp' },
        { id: 6, code: 'using System;\n\nclass Program {\n    static void Main() {\n        Add(3, 4);\n    }\n    \n    static void Add(int a, int b) {\n        Console.WriteLine("The sum is " + (a + b));\n    }\n}', path: '/path-to-code-6', lang: 'csharp' },
        { id: 7, code: 'fn add(a: i32, b: i32) {\n    println!("The sum is {}", a + b);\n}\n\nfn main() {\n    add(3, 4);\n}', path: '/path-to-code-7', lang: 'rust' },
        { id: 8, code: 'function add(a: number, b: number): void {\n    console.log(`The sum is ${a + b}`);\n}\n\nadd(3, 4);', path: '/path-to-code-8', lang: 'typescript' },
        { id: 9, code: '#include <stdio.h>\n\nvoid add(int a, int b) {\n    printf("The sum is %d\\n", a + b);\n}\n\nint main() {\n    add(3, 4);\n    return 0;\n}', path: '/path-to-code-9', lang: 'c' },
        { id: 10, code: 'package main\n\nimport "fmt"\n\nfunc add(a int, b int) {\n    fmt.Printf("The sum is %d\\n", a + b)\n}\n\nfunc main() {\n    add(3, 4)\n}', path: '/path-to-code-10', lang: 'go' },
      ],
      busy: false,
    };
  },
  methods: {
    loadMore() {
      console.log(this.busy)
      if (this.busy) return;
      this.busy = true;
      let loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(122, 122, 122, 0.4)'
      })
      setTimeout(() => {
        let newItems = [];
        for(let i = 0; i < 2; i++) {
          newItems.push({ id: this.items.length + i, code: 'import Prism from \'prismjs\'; \nimport \'prismjs/themes/prism.css\';', path: `/path-to-code-${this.items.length + i}`, lang: 'javascript'});
        }
        this.items = [...this.items, ...newItems];
        this.busy = false;
        loading.close()
      }, 1000);
    },
  },
};
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
.results-wrapper-lower {
  background-color: transparent;
  border: none;
  box-shadow: -5px 5px 10px rgba(0, 0, 0, 0.12), /* 加深左下角阴影 */
  5px 5px 10px rgba(0, 0, 0, 0.12), /* 加深右下角阴影 */
  0px 3px 5px rgba(0, 0, 0, 0.12) !important;   /* 微小但加深的向下阴影 */ 
}
</style>