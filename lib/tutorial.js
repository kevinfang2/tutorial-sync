'use babel';

import TutorialView from './tutorial-view';
import { CompositeDisposable } from 'atom';

export default {

  tutorialView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.tutorialView = new TutorialView(state.tutorialViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.tutorialView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'tutorial:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.tutorialView.destroy();
  },

  serialize() {
    return {
      tutorialViewState: this.tutorialView.serialize()
    };
  },

  toggle() {
    console.log('Tutorial was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
