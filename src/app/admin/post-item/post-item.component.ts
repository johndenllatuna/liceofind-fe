import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; 
import { ItemService } from '../../services/item.service'; 
import { Image } from '../../services/image.service'; 
import { Sidebar } from '../../shared/sidebar/sidebar.component'; 
import { Item } from '../../models/item.model'; 

@Component({
  selector: 'app-post-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Sidebar], 
  templateUrl: './post-item.component.html',
  styleUrl: './post-item.component.scss'
})
export class PostItem {
  postItemForm: FormGroup;
  
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isUploading: boolean = false;
  
  showSuccessMessage: boolean = false;
  showErrorMessage: boolean = false; // Add state for the error toast

  constructor(
    private fb: FormBuilder, 
    private itemService: ItemService,
    private imageService: Image,
    private cdr: ChangeDetectorRef
  ) {
    this.postItemForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      location: ['', Validators.required],
      date: ['2026-01-16', Validators.required]
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.imagePreview = URL.createObjectURL(file);
    }
  }

  onSubmit() {
    if (this.postItemForm.valid) {
      this.isUploading = true; 

      const formValues = this.postItemForm.value;

      if (this.selectedFile) {
        this.imageService.uploadImage(this.selectedFile).subscribe((uploadedUrl) => {
          this.finalizeSubmission(formValues, uploadedUrl);
        });
      } else {
        this.finalizeSubmission(formValues, '/assets/icons/no-img.svg');
      }
    } else {
      // Trigger the red error toast instead of an alert
      this.showErrorMessage = true;
      setTimeout(() => {
        this.showErrorMessage = false;
        this.cdr.detectChanges(); 
      }, 3000);
    }
  }

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
    
    this.showSuccessMessage = true;
    
    setTimeout(() => {
      this.showSuccessMessage = false;
      this.cdr.detectChanges(); 
    }, 3000);
    
    this.postItemForm.reset({ date: '2026-01-16' });
    this.selectedFile = null;
    this.imagePreview = null;
    this.isUploading = false;
  }
}