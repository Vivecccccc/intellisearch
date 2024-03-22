<template>
  <div id="app">
    <HeadContainer class="head" />
    <ResultsContainer class="results"/>
  </div>
</template>

<script>
import HeadContainer from './components/HeadContainer.vue';
import ResultsContainer from './components/ResultsContainer.vue';

export const vscodeApi = acquireVsCodeApi();

export default {
  components: {
    HeadContainer,
    ResultsContainer,
  },
};
</script>

<style>
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}
#app {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  font-family: 'Consolas', 'Courier New', monospace;
  background-color: transparent;
}
#app pre, #app code {
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: small;
  background-color: transparent;
  padding-left: 0px;
}

.head {
  flex: 0.15;
  margin-bottom: 10px;
}

.results {
  flex: 0.85;
  overflow: auto;
}
</style>
