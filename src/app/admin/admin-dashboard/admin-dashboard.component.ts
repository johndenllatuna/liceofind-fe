import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; // Add this for @if and @for
import { Sidebar } from '../../shared/sidebar/sidebar.component';
import { Chart, registerables } from 'chart.js';
import { DashboardStats } from '../../models/dashboard.model';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [Sidebar, CommonModule], // Added CommonModule
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboard implements OnInit, AfterViewInit {
  public chart: any;

  // --- ANIMATION STATE ---
  pageEntered: boolean = false;

  // 👈 Injected ChangeDetectorRef
  constructor(private cdr: ChangeDetectorRef) {}

  // --- MOCK DATA READY FOR BACKEND ---
  // When you connect to a DB, you'll just overwrite these variables
  dashboardStats: DashboardStats = {
  pendingClaims: 36,
  activeListings: 67,
  settledItems: 23,
  };

  submissionTrends = [
    { day: 'Mon', count: 12 },
    { day: 'Tue', count: 18 },
    { day: 'Wed', count: 25 },
    { day: 'Thu', count: 20 },
    { day: 'Fri', count: 30 },
    { day: 'Sat', count: 8 },
    { day: 'Sun', count: 4 }
  ];

  ngOnInit() {}

  ngAfterViewInit() {
    this.createChart();

    // Trigger entrance animation cleanly
    setTimeout(() => {
      this.pageEntered = true;
      this.cdr.detectChanges(); // Force Angular to evaluate [class.is-entered] immediately
    }, 50);
  }

  createChart() {
    const canvas = document.getElementById('MyChart') as HTMLCanvasElement;
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