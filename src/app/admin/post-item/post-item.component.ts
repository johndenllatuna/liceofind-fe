import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; 
import { ItemService } from '../../services/item.service'; 
import { Sidebar } from '../../shared/sidebar/sidebar.component'; 
import { Item } from '../../models/item.model'; // 👈 1. Added the Item model import

@Component({
  selector: 'app-post-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Sidebar], 
  templateUrl: './post-item.component.html',
  styleUrl: './post-item.component.scss'
})
export class PostItem {
  postItemForm: FormGroup;

  constructor(private fb: FormBuilder, private itemService: ItemService) {
    this.postItemForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      location: ['', Validators.required],
      date: ['2026-01-16', Validators.required]
    });
  }

  onSubmit() {
    if (this.postItemForm.valid) {
      
      // 👈 2. Added the ': Item' type so TypeScript strictly checks our work
      const newItem: Item = {
        id: 0, // 👈 3. Changed to a number. The service will auto-assign the real ID.
        name: this.postItemForm.value.name,
        description: this.postItemForm.value.description,
        location: this.postItemForm.value.location,
        date: this.postItemForm.value.date,
        imageUrl: '/assets/icons/no-img.svg', // 👈 4. Updated to use your working fallback image path
        status: 'Available' // 👈 5. ADDED THE MISSING STATUS!
      };

      this.itemService.addItem(newItem);
      
      alert('Item successfully posted!');
      
      this.postItemForm.reset({ date: '2026-01-16' }); 
    } else {
      alert('Please fill out all fields.');
    }
  }
}