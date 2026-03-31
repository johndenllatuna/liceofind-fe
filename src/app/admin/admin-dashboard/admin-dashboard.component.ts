import { Component, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router'; 
import Chart from 'chart.js/auto'; 
import { Sidebar } from '../../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [ Sidebar],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboard implements AfterViewInit { // 3. Add implements AfterViewInit
  
  public chart: any;

  // 4. This lifecycle hook ensures the HTML canvas exists BEFORE we try to draw on it
  ngAfterViewInit(): void {
    this.createChart();
  }

  createChart() {
    this.chart = new Chart("MyChart", {
      type: 'line', // We are making a line chart
      data: {
        labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], 
        datasets: [
          {
            label: 'Items Reported',
            data: [12, 19, 3, 5, 2, 8, 15], // This is our dummy data!
            backgroundColor: 'rgba(128, 0, 0, 0.1)', // A light maroon tint
            borderColor: '#800000', // Your LiceoFind Maroon
            borderWidth: 2,
            fill: true, // Fills the area under the line
            tension: 0.4 // This makes the line curve smoothly instead of jagged angles
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // This allows the chart to stretch and fill our custom box
        plugins: {
          legend: {
            display: false // Hides the legend since we only have one line anyway
          }
        }
      }
    });
  }
}