import { Component, ChangeDetectorRef, OnInit, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; 
import { Router } from '@angular/router';
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
export class PostItem implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private itemService = inject(ItemService);
  private imageService = inject(Image);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  postItemForm: FormGroup;
  
  // --- ANIMATION STATE ---
  pageEntered: boolean = false;
  
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isUploading: boolean = false;
  isDragging: boolean = false; // New state for Drag & Drop feedback
  
  showSuccessMessage: boolean = false;
  showErrorMessage: boolean = false; // Add state for the error toast

  constructor() {
    this.postItemForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      location: ['', Validators.required],
      date: ['', Validators.required],
      image: [null, Validators.required]
    });
  }

  ngOnInit() {}

  ngAfterViewInit() {
    // Trigger entrance animation cleanly
    setTimeout(() => {
      this.pageEntered = true;
      this.cdr.detectChanges(); // Force Angular to evaluate [class.is-entered] immediately
    }, 50);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.processFile(file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      this.processFile(file);
    }
  }

  private processFile(file: File) {
    this.selectedFile = file;
    this.postItemForm.patchValue({ image: file });
    this.postItemForm.get('image')?.updateValueAndValidity();
    
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  onSubmit() {
    if (this.postItemForm.valid && this.selectedFile) {
      this.isUploading = true; 

      const formValues = this.postItemForm.value;

      this.imageService.uploadImage(this.selectedFile).subscribe({
        next: (uploadedUrl) => {
          this.finalizeSubmission(formValues, uploadedUrl);
        },
        error: (err) => {
          this.isUploading = false;
          this.showErrorMessage = true;
          console.error('Image upload failed:', err);
          setTimeout(() => {
            this.showErrorMessage = false;
            this.cdr.detectChanges();
          }, 3000);
        }
      });
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

    this.itemService.addItem(newItem).subscribe({
      next: () => {
        this.showSuccessMessage = true;
        this.isUploading = false;
        
        // Reset form
        this.postItemForm.reset();
        this.selectedFile = null;
        this.imagePreview = null;
        
        setTimeout(() => {
          this.showSuccessMessage = false;
          // Redirect to item management as requested by the user flow ("reflected on item management")
          this.router.navigate(['/item-management']);
          this.cdr.detectChanges(); 
        }, 2000);
      },
      error: (err) => {
        this.isUploading = false;
        this.showErrorMessage = true;
        console.error('Failed to post item:', err);
        setTimeout(() => {
          this.showErrorMessage = false;
          this.cdr.detectChanges();
        }, 3000);
      }
    });
  }
}