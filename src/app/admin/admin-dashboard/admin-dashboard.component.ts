import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Sidebar } from '../../shared/sidebar/sidebar.component'; // Adjust path if needed
import { Chart, registerables } from 'chart.js';

// 1. Register all Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [Sidebar],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboard implements OnInit, AfterViewInit {
  public chart: any;

  ngOnInit() {}

  // 2. We use ngAfterViewInit so the HTML canvas is fully loaded before we draw on it
  ngAfterViewInit() {
    this.createChart();
  }

  createChart() {
    const canvas = document.getElementById('MyChart') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    let gradient;
    if (ctx) {
      gradient = ctx.createLinearGradient(0, 0, 0, 400);
      // CHANGED: Using Liceo Maroon (138, 0, 0) for the shadow
      gradient.addColorStop(0, 'rgba(138, 0, 0, 0.4)'); 
      gradient.addColorStop(1, 'rgba(138, 0, 0, 0.0)');
    }

    this.chart = new Chart('MyChart', {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], 
        datasets: [
          {
            label: 'Items Reported',
            data: [12, 18, 25, 20, 30, 8, 4], 
            // CHANGED: Liceo Maroon for all the lines and dots
            borderColor: '#8a0000', 
            backgroundColor: gradient || 'rgba(138, 0, 0, 0.2)',
            borderWidth: 3,
            fill: true,
            tension: 0, 
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#8a0000', // CHANGED
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // This forces the chart to fill your CSS .chart-box
        plugins: {
          legend: {
            display: false // Hides the default legend to look cleaner, just like your image
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#f0f0f0', // Very light horizontal grid lines
            },
            border: {
              display: false // Hides the hard vertical axis line
            }
          },
          x: {
            grid: {
              display: false, // Hides vertical grid lines for a cleaner look
            },
            border: {
              display: false // Hides the hard horizontal axis line
            }
          }
        }
      }
    });
  }
}