'use babel';

import TutorialView from './tutorial-view';
import { CompositeDisposable } from 'atom';
import request from 'request'
import PubNub from 'pubnub'

var pubnub = new PubNub({
    subscribeKey: process.env.subscribepub,
    publishKey: process.env.publishpub,
    secretKey: process.env.secretpub,
    ssl: true
})

function publish(message, channel_name){
  pubnub.publish(
    {
      message: {
          code: message
      },
      channel: channel,
      sendByPost: false,
      storeInHistory: false,
      meta: {
          "cool": "meta"
      }
    },
    function (status, response) {
      if (status.error) {
          // handle error
          console.log(status)
      } else {
          console.log("message Published w/ timetoken", response.timetoken)
      }
    }
  );
}

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

    // Events subscribed to in atom's `system can be easily cleaned up with a CompositeDisposable
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
    if (editor = atom.workspace.getActiveTextEditor()) {
      let selection = editor.getSelectedText()
      let split = selection.split(' ')

      if(split[0] == "create"){
        let channel_name = split[1]

      }
      else if(split[0] == "subscribe"){
        let channel_name = split[1]
        pubnub.subscribe({
          channels: [channel_name],
        });
      }
      else{
        atom.notifications.addWarning('Please place in format subscribe/create channel_name');
      }
    }
  },

  update(){
    console.log("hey")
  }

};
