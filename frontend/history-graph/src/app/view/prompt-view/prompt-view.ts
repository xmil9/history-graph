import { Component, output, signal } from '@angular/core';
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
  submit = output<string>();

  onSubmit() {
    if (this.prompt().trim()) {
      this.submit.emit(this.prompt());
      this.prompt.set('');
    }
  }
}
