<script lang="ts">
  import { onMount } from 'svelte';
  import { getStoryCountsByDay, type StoryCountByDay } from '$lib/api/admin';
  import { Chart, registerables } from 'chart.js';
  import { BarChart } from 'lucide-svelte';

  Chart.register(...registerables);

  let chartCanvas: HTMLCanvasElement;
  let chart: Chart<'bar'> | null = null;
  let loading = true;
  let error: string | null = null;
  let chartData: StoryCountByDay[] = [];
  let days = 30;
  const dayOptions = [7, 14, 30, 90];

  async function loadAndRender() {
    loading = true;
    error = null;
    chartData = [];
    try {
      const res = await getStoryCountsByDay(days);
      if (!res.success || !res.data) {
        error = res.error ?? 'Failed to load data';
        return;
      }
      chartData = res.data;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Unknown error';
    } finally {
      loading = false;
    }
  }

  function renderChart(counts: StoryCountByDay[]) {
    if (chart) {
      chart.destroy();
      chart = null;
    }
    if (!chartCanvas || !counts.length) return;

    const labels = counts.map((d) => d.date);
    const values = counts.map((d) => d.count);

    chart = new Chart(chartCanvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Stories generated',
            data: values,
            backgroundColor: 'rgba(30, 64, 175, 0.7)',
            borderColor: 'rgb(30, 64, 175)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Story generations per day'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
            title: { display: true, text: 'Count' }
          },
          x: {
            title: { display: true, text: 'Date' },
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              maxTicksLimit: 20
            }
          }
        }
      }
    });
  }

  $: if (chartCanvas && chartData.length > 0 && !loading) {
    renderChart(chartData);
  }

  onMount(() => {
    loadAndRender();
    return () => {
      if (chart) {
        chart.destroy();
        chart = null;
      }
    };
  });

  function onDaysChange() {
    loadAndRender();
  }
</script>

<svelte:head>
  <title>Analysis – Admin</title>
</svelte:head>

<div class="analysis-page">
  <div class="page-header">
    <h1 class="page-title">
      <BarChart size={28} />
      Analysis
    </h1>
    <p class="page-description">Story generation metrics from the stories table</p>
  </div>

  <div class="controls">
    <label for="days">Last</label>
    <select id="days" bind:value={days} on:change={onDaysChange}>
      {#each dayOptions as d}
        <option value={d}>{d} days</option>
      {/each}
    </select>
  </div>

  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading story counts…</p>
    </div>
  {:else if error}
    <div class="error-state">
      <p>{error}</p>
    </div>
  {:else if chartData.length === 0}
    <div class="empty-state">
      <p>No story generations in the last {days} days.</p>
    </div>
  {:else}
    <div class="chart-container">
      <canvas bind:this={chartCanvas}></canvas>
    </div>
  {/if}
</div>

<style>
  .analysis-page {
    max-width: 960px;
  }

  .page-header {
    margin-bottom: 1.5rem;
  }

  .page-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
    margin: 0 0 0.25rem 0;
  }

  .page-description {
    margin: 0;
    color: #6b7280;
    font-size: 0.9375rem;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .controls label {
    font-size: 0.875rem;
    color: #374151;
  }

  .controls select {
    padding: 0.375rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    background: white;
    color: #111827;
  }

  .chart-container {
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    height: 400px;
  }

  .loading-state,
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 3rem;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .loading-state p,
  .error-state p {
    margin: 0;
    color: #6b7280;
    font-size: 0.9375rem;
  }

  .error-state p {
    color: #dc2626;
  }

  .empty-state {
    padding: 3rem;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  .empty-state p {
    margin: 0;
    color: #6b7280;
    font-size: 0.9375rem;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #e5e7eb;
    border-top-color: #1e40af;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
