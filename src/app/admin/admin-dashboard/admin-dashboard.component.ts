import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Chart, registerables } from 'chart.js';
import { DashboardStats } from '../../models/dashboard.model';
import { DashboardService } from '../../services/dashboard.service';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboard implements OnInit, AfterViewInit {
  private cdr = inject(ChangeDetectorRef);
  private dashboardService = inject(DashboardService);

  public chart: any;

  // --- ANIMATION STATE ---
  pageEntered: boolean = false;

  dashboardStats: DashboardStats = {
    pendingClaims: 0,
    activeListings: 0,
    settledItems: 0,
  };

  submissionTrends: any[] = [];

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.dashboardService.getStats().subscribe((stats: DashboardStats) => {
      this.dashboardStats = stats;
      this.cdr.detectChanges();
    });

    this.dashboardService.getTrends().subscribe((trends: any[]) => {
      this.submissionTrends = trends;
      this.createChart();
      this.cdr.detectChanges();
    });
  }

  ngAfterViewInit() {
    this.createChart();

    // Trigger entrance animation cleanly
    setTimeout(() => {
      this.pageEntered = true;
      this.cdr.detectChanges(); // Force Angular to evaluate [class.is-entered] immediately
    }, 50);
  }

  createChart() {
    if (this.chart) {
      this.chart.destroy();
    }
    
    if (this.submissionTrends.length === 0) return;

    const canvas = document.getElementById('MyChart') as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let barGradient;

    if (ctx) {
      // Adjust the gradient height based on typical chart height
      barGradient = ctx.createLinearGradient(0, 0, 0, canvas.height || 400);
      barGradient.addColorStop(0, '#A11E26'); // Rich maroon top
      barGradient.addColorStop(1, '#7D1016'); // Darker maroon bottom
    }

    const labels = this.submissionTrends.map(t => t.day);
    const data   = this.submissionTrends.map(t => Number(t.count));

    // Custom Plugin: Bar Drop Shadow
    const shadowPlugin = {
      id: 'shadowPlugin',
      beforeDatasetsDraw: (chart: any) => {
        const chartCtx = chart.ctx;
        chartCtx.save();
        chartCtx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        chartCtx.shadowBlur = 10;
        chartCtx.shadowOffsetX = 0;
        chartCtx.shadowOffsetY = 4;
      },
      afterDatasetsDraw: (chart: any) => {
        chart.ctx.restore();
      }
    };

    // Custom Plugin: Data Labels above bars
    const dataLabelsPlugin = {
      id: 'dataLabelsPlugin',
      afterDatasetsDraw: (chart: any) => {
        const chartCtx = chart.ctx;
        chart.data.datasets.forEach((dataset: any, i: number) => {
          const meta = chart.getDatasetMeta(i);
          if (!meta.hidden) {
            meta.data.forEach((element: any, index: number) => {
              const dataString = dataset.data[index].toString();
              // Optionally skip drawing '0' labels for a cleaner look
              if (dataString === '0') return; 
              
              chartCtx.fillStyle = '#64748b'; // slate-500
              chartCtx.font = 'bold 12px "Inter", sans-serif';
              chartCtx.textAlign = 'center';
              chartCtx.textBaseline = 'bottom';
              
              const padding = 6;
              const position = element.tooltipPosition();
              chartCtx.fillText(dataString, position.x, position.y - padding);
            });
          }
        });
      }
    };

    this.chart = new Chart('MyChart', {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Items Reported',
          data,
          backgroundColor: barGradient || '#A11E26',
          hoverBackgroundColor: '#8a0000',
          borderRadius: 10,
          borderSkipped: 'bottom',
          barPercentage: 0.5, // slightly slimmer bars look more premium
          categoryPercentage: 0.8
        }]
      },
      plugins: [shadowPlugin, dataLabelsPlugin],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 25 // Make room for data labels
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)', // Dark slate tooltip
            titleFont: { family: 'Inter', size: 13 },
            bodyFont: { family: 'Inter', size: 13 },
            padding: 10,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              label: (ctx) => ` ${ctx.parsed.y} item${ctx.parsed.y !== 1 ? 's' : ''} reported`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              precision: 0,
              color: '#94a3b8',
              font: { family: 'Inter', size: 11 }
            },
            grid: { 
              color: '#f1f5f9' // Very subtle light grey grid lines
            },
            border: { display: false }
          },
          x: {
            ticks: {
              color: '#64748b',
              font: { family: 'Inter', size: 12, weight: 500 }
            },
            grid: { display: false },
            border: { display: false }
          }
        }
      }
    });
  }

}