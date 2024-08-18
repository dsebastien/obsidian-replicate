import { App, Modal, Setting } from 'obsidian';

/**
 * Modal to ask for the prompt to use
 * Reference: https://docs.obsidian.md/Plugins/User+interface/Modals
 */
export class PromptModal extends Modal {
  result: string;
  onSubmit: (result: string) => void;

  constructor(app: App, onSubmit: (result: string) => void) {
    super(app);
    this.onSubmit = onSubmit;
    this.result = '';
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl('h1', { text: 'Enter the prompt' });

    new Setting(contentEl).setName('Prompt').addText((text) =>
      text.onChange((value) => {
        this.result = value;
      })
    );

    new Setting(contentEl).addButton((btn) =>
      btn
        .setButtonText('Submit')
        .setCta()
        .onClick(() => {
          this.close();
          this.onSubmit(this.result);
        })
    );
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
