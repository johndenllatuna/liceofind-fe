import { Component, ChangeDetectorRef, OnInit, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; 
import { Router } from '@angular/router';
import flatpickr from 'flatpickr';
import { ItemService } from '../../services/item.service'; 
import { Image } from '../../services/image.service'; 
import { Sidebar } from '../../shared/sidebar/sidebar.component'; 
import { ImageUploadComponent } from '../../shared/image-upload/image-upload.component';
import { Item } from '../../models/item.model'; 

@Component({
  selector: 'app-post-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Sidebar, ImageUploadComponent], 
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

  maxDate: string = '';

  constructor() {
    this.postItemForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      location: ['', Validators.required],
      date: ['', Validators.required],
      image: [null, Validators.required]
    });
  }

  ngOnInit() {
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];
  }

  ngAfterViewInit() {
    // Trigger entrance animation cleanly
    setTimeout(() => {
      this.pageEntered = true;
      this.cdr.detectChanges();
    }, 50);

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed

    // Helper: rebuild the year <select> and sync flatpickr state
    const buildYearSelect = (fp: any) => {
      const wrapper = fp.calendarContainer?.querySelector('.numInputWrapper') as HTMLElement;
      if (!wrapper) return;

      // Avoid re-building if already a select
      if (wrapper.querySelector('.fp-year-select')) return;

      // Hide the native year input
      const nativeInput = wrapper.querySelector('input.cur-year') as HTMLElement;
      if (nativeInput) nativeInput.style.display = 'none';

      // Build a <select> with years from 2015 to current year
      const sel = document.createElement('select');
      sel.className = 'fp-year-select';
      for (let y = currentYear; y >= 2015; y--) {
        const opt = document.createElement('option');
        opt.value = String(y);
        opt.textContent = String(y);
        if (y === fp.currentYear) opt.selected = true;
        sel.appendChild(opt);
      }

      sel.addEventListener('change', () => {
        const chosenYear = parseInt(sel.value, 10);
        // Clamp month: if chosen year is current year, cap month at current month
        const clampedMonth = (chosenYear === currentYear)
          ? Math.min(fp.currentMonth, currentMonth)
          : fp.currentMonth;
        fp.changeYear(chosenYear);
        fp.changeMonth(clampedMonth, false);
        syncMonthDropdown(fp);
      });

      wrapper.appendChild(sel);
    };

    // Helper: remove future months from the native month <select>
    const syncMonthDropdown = (fp: any) => {
      const monthSel = fp.calendarContainer?.querySelector('.flatpickr-monthDropdown-months') as HTMLSelectElement;
      if (!monthSel) return;
      Array.from(monthSel.options).forEach((opt: any) => {
        const monthIdx = parseInt(opt.value, 10);
        opt.disabled = (fp.currentYear === currentYear && monthIdx > currentMonth);
        opt.hidden   = (fp.currentYear === currentYear && monthIdx > currentMonth);
      });
    };

    // Helper: keep year select in sync when month navigation changes the year
    const syncYearSelect = (fp: any) => {
      const sel = fp.calendarContainer?.querySelector('.fp-year-select') as HTMLSelectElement;
      if (!sel) return;
      sel.value = String(fp.currentYear);
    };

    // Initialize Flatpickr
    const fpInstance: any = flatpickr('input[formControlName="date"]', {
      maxDate: 'today',
      dateFormat: 'Y-m-d',
      allowInput: false,
      disableMobile: true,
      onReady: (_: any, __: any, fp: any) => {
        buildYearSelect(fp);
        syncMonthDropdown(fp);
      },
      onMonthChange: (_: any, __: any, fp: any) => {
        // Prevent navigating into a future month
        if (fp.currentYear > currentYear ||
           (fp.currentYear === currentYear && fp.currentMonth > currentMonth)) {
          fp.changeMonth(currentMonth - fp.currentMonth, false);
          fp.changeYear(currentYear);
        }
        buildYearSelect(fp);
        syncYearSelect(fp);
        syncMonthDropdown(fp);
      },
      onYearChange: (_: any, __: any, fp: any) => {
        buildYearSelect(fp);
        syncYearSelect(fp);
        syncMonthDropdown(fp);
      },
      onChange: (selectedDates: any, dateStr: string, _fp: any) => {
        this.postItemForm.patchValue({ date: dateStr });
        this.postItemForm.get('date')?.markAsTouched();
      }
    });

    // Allow clicking the calendar icon to open the picker
    const icon = document.querySelector('.calendar-icon') as HTMLElement;
    if (icon && fpInstance?.open) {
      icon.addEventListener('click', () => fpInstance.open());
    }
  }

  onImageChanged(file: File | null) {
    this.selectedFile = file;
    this.imagePreview = null; // ImageUploadComponent handles the preview, but we can sync if needed
    
    this.postItemForm.patchValue({ image: file });
    this.postItemForm.get('image')?.updateValueAndValidity();
    this.cdr.detectChanges();
  }

  onSubmit() {
    if (this.postItemForm.invalid || !this.selectedFile) {
      this.postItemForm.markAllAsTouched();
      return;
    }

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
        this.isUploading = false;
        this.showSuccessMessage = true;
        
        // Reset form
        this.postItemForm.reset();
        this.selectedFile = null;
        this.imagePreview = null;
        
        // Delay navigation to let the success toast be visible
        setTimeout(() => {
          this.showSuccessMessage = false;
          this.router.navigate(['/item-management']);
          this.cdr.detectChanges(); 
        }, 2500);
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