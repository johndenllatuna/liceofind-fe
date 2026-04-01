import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ItemService } from '../../services/item.service'; // Adjust path if needed

@Component({
  selector: 'app-post-item',
  templateUrl: './post-item.component.html',
  styleUrls: ['./post-item.component.scss']
})
export class PostItemComponent {
  postItemForm: FormGroup;

  constructor(private fb: FormBuilder, private itemService: ItemService) {
    // Set up the form controls to match your HTML inputs
    this.postItemForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      location: ['', Validators.required],
      date: ['2026-01-16', Validators.required]
    });
  }

  onSubmit() {
    if (this.postItemForm.valid) {
      // Create a new item object from the form values
      const newItem = {
        id: Date.now().toString(), // Generate a random ID
        name: this.postItemForm.value.name,
        description: this.postItemForm.value.description,
        location: this.postItemForm.value.location,
        date: this.postItemForm.value.date,
        // Hardcode a placeholder image since we aren't doing file uploads yet
        imageUrl: 'assets/airpods.jpg' 
      };

      // Send it to the service!
      this.itemService.addItem(newItem);
      
      alert('Item successfully posted!');
      
      // Reset the form but keep the default date
      this.postItemForm.reset({ date: '2026-01-16' }); 
    } else {
      alert('Please fill out all fields.');
    }
  }
}