<template>
  <div id="app">
    <v-chart :option="chartOptions" style="width: 100vh; height: 100vh;"></v-chart>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';

export default {
  name: 'App',
  setup() {
    const chartOptions = ref({
      title: {
        text: 'Relationship Graph',
        left: 'center'
      },
      tooltip: {
        formatter: function (params) {
          return params.data.name;
        }
      },
      legend: [{
        data: ['Nodes']
      }],
      series: [{
        type: 'graph',
        layout: 'circular',
        circular: {
          rotateLabel: true
        },
        edgeSymbol: ['arrow'],
        data: [],
        links: [],
        roam: true,
        label: {
          show: true,
          position: 'right',
          formatter: '{b}'
        },
        lineStyle: {
          color: 'source',
          curveness: 0.2
        },
        force: {
          repulsion: 200,
          edgeLength: [10, 200],
          gravity: 0.2
        },
        labelLayout: {
          hideOverlap: true
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 3
          }
        },
      }]
    });

    const fetchGraphData = async () => {
      try {
        const response = await axios.get('/contacts.json');
        const data = response.data;

        const nodes = data.nodes.map(node => ({
          id: node.id,
          name: node.name,
          symbolSize: Math.min(30, node.symbolSize),  // Adjust the multiplier and minimum size as needed
          category: node.id.split('\\').pop().split('::')[0],
        }));

        const edges = data.edges.map(edge => ({
          source: edge.source,
          target: edge.target
        }));
        // get categories from nodes and put into form of "categories": [{"name": "A"}, {"name": "B"}]
        const categories = [...new Set(nodes.map(node => node.category))].map(category => ({ name: category }));

        chartOptions.value.series[0].data = nodes;
        chartOptions.value.series[0].links = edges;
        chartOptions.value.series[0].categories = categories;
      } catch (error) {
        console.error('Error fetching graph data:', error);
      }
    };

    onMounted(() => {
      fetchGraphData();
    });

    return {
      chartOptions
    };
  }
};
</script>

<style>
#app {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>