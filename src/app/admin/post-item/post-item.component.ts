import { Component } from '@angular/core';
import { Sidebar } from '../../shared/sidebar/sidebar.component'; // 1. Add import

@Component({
  selector: 'app-post-item',
  standalone: true,
  imports: [Sidebar], // 2. Add to imports array
  templateUrl: './post-item.component.html',
  styleUrls: ['./post-item.component.scss']
})
export class PostItem {
}