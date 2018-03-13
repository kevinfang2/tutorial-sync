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
      'tutorial:toggle': () => this.toggle(),
    }));

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'tutorial:publish': () => this.publish(),
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
      let all_text = editor.getText().split('\n')
      let channel_name = all_text[0].replace('/\/g', '')

      pubnub.subscribe({
          channels: [channel_name]
      });

      pubnub.addListener({
          message: function(m) {
              var channelName = m.channel;
              var channelGroup = m.subscription;
              var msg = m.message;
              editor.insertText(msg["code"])
          },
          presence: function(p) {
          },
          status: function(s) {
              var affectedChannelGroups = s.affectedChannelGroups;
              var affectedChannels = s.affectedChannels;
              var category = s.category;
              var operation = s.operation;
          }
      });
    }
  },

  publish(){
    if (editor = atom.workspace.getActiveTextEditor()) {
      let all_text = editor.getText().split('\n')
      let channel = all_text[0].replace('/\/g', '')

      let message = all_text.slice(1).join('\n')

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
              console.log(status)
          } else {
              console.log("message Published w/ timetoken", response.timetoken)
          }
        }
      );
    }
  }

};
