import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; 
import { ItemService } from '../../services/item.service'; 
import { Image } from '../../services/image.service'; // 👈 1. Import your new service
import { Sidebar } from '../../shared/sidebar/sidebar.component'; 
import { Item } from '../../models/item.model'; // 👈 Fixed the typo here!

@Component({
  selector: 'app-post-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Sidebar], 
  templateUrl: './post-item.component.html',
  styleUrl: './post-item.component.scss'
})
export class PostItem {
  postItemForm: FormGroup;
  
  // 2. New variables to hold our image data
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isUploading: boolean = false;

  // 3. Inject the ImageService
  constructor(
    private fb: FormBuilder, 
    private itemService: ItemService,
    private imageService: Image 
  ) {
    this.postItemForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      location: ['', Validators.required],
      date: ['2026-01-16', Validators.required]
    });
  }

  // 4. This method runs when the user picks a file from their computer
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Create a quick local URL just so the user can see a preview
      this.imagePreview = URL.createObjectURL(file);
    }
  }

  onSubmit() {
    if (this.postItemForm.valid) {
      this.isUploading = true; // Changes the button text to "Uploading..."

      const formValues = this.postItemForm.value;

      // 5. If they selected a file, upload it first!
      if (this.selectedFile) {
        this.imageService.uploadImage(this.selectedFile).subscribe((uploadedUrl) => {
          this.finalizeSubmission(formValues, uploadedUrl);
        });
      } else {
        // If they didn't upload an image, just use the fallback right away
        this.finalizeSubmission(formValues, '/assets/icons/no-img.svg');
      }
    } else {
      alert('Please fill out all fields.');
    }
  }

  // 6. A helper method to keep our code clean
  private finalizeSubmission(formValues: any, finalImageUrl: string) {
    const newItem: Item = {
      id: 0,
      name: formValues.name,
      description: formValues.description,
      location: formValues.location,
      date: formValues.date,
      imageUrl: finalImageUrl,
      status: 'Available' 
    };

    this.itemService.addItem(newItem);
    
    alert('Item successfully posted!');
    
    // Reset everything back to default
    this.postItemForm.reset({ date: '2026-01-16' });
    this.selectedFile = null;
    this.imagePreview = null;
    this.isUploading = false;
  }
}