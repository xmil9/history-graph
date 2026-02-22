import { Component, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'prompt-view',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './prompt-view.html',
  styleUrl: './prompt-view.css',
})
export class PromptView {
  prompt = signal('');
  isLoading = input(false);
  submit = output<string>();

  constructor() {
    effect(() => {
      if (!this.isLoading()) {
        this.prompt.set('');
      }
    });
  }

  onSubmit() {
    if (this.prompt().trim() && !this.isLoading()) {
      this.submit.emit(this.prompt());
    }
  }
}
