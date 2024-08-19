import { App, Modal, Setting } from 'obsidian';

/**
 * Modal to ask for the prompt to use
 * Reference: https://docs.obsidian.md/Plugins/User+interface/Modals
 */
export class PromptModal extends Modal {
  result: string;

  constructor(app: App, private onSubmit: (result: string) => void) {
    super(app);
    this.result = '';
    this.modalEl.addClass('replicate-plugin-prompt-modal');
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl('h1', { text: 'Generate image(s) using Replicate.com' });

    let submitButton: HTMLButtonElement;

    new Setting(contentEl).setName('Prompt to use:').addTextArea((text) => {
      text.onChange((value) => {
        this.result = value;
      });
      text.setPlaceholder('Enter the prompt to use');
      text.inputEl.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.key === 'Enter') {
          // Prevent default behavior if needed
          event.preventDefault();
          if (!submitButton) {
            return;
          }
          submitButton.click();
        }
      });
    });

    new Setting(contentEl).addButton((btn) => {
      submitButton = btn.buttonEl; // Store reference to the submit button
      btn
        .setButtonText('Submit')
        .setCta()
        .onClick(() => {
          this.close();
          this.onSubmit(this.result);
        });
    });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
