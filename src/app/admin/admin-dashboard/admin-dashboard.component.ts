import { Component, OnInit, AfterViewInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../shared/sidebar/sidebar.component';
import { Chart, registerables } from 'chart.js';
import { DashboardStats } from '../../models/dashboard.model';
import { DashboardService } from '../../services/dashboard.service';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [Sidebar, CommonModule],
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
    let gradient;

    if (ctx) {
      gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, 'rgba(138, 0, 0, 0.4)'); 
      gradient.addColorStop(1, 'rgba(138, 0, 0, 0.0)');
    }

    this.chart = new Chart('MyChart', {
      type: 'line',
      data: {
        // Map the labels and data from our submissionTrends array
        labels: this.submissionTrends.map(t => t.day), 
        datasets: [{
          label: 'Items Reported',
          data: this.submissionTrends.map(t => t.count), 
          borderColor: '#8a0000', 
          backgroundColor: gradient || 'rgba(138, 0, 0, 0.2)',
          borderWidth: 3,
          fill: true,
          tension: 0, 
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#8a0000',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f0f0f0' }, border: { display: false } },
          x: { grid: { display: false }, border: { display: false } }
        }
      }
    });
  }

}