import { createApp } from 'vue';
import App from './App.vue';
import ECharts from 'vue-echarts';
import { use } from 'echarts/core';

// Import necessary charts and components
import { CanvasRenderer } from 'echarts/renderers';
import { GraphChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components';

use([
  CanvasRenderer,
  GraphChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
]);

const app = createApp(App);
app.component('v-chart', ECharts);
app.mount('#app');