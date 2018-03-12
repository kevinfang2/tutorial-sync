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
      let selection = editor.getSelectedText()
      let split = selection.split(' ')

      if(split[0] == "subscribe"){
        let channel_name = split[1]

        pubnub.addListener({
            message: function(m) {
                var channelName = m.channel; // The channel for which the message belongs
                var channelGroup = m.subscription; // The channel group or wildcard subscription match (if exists)
                var msg = m.message; // The Payload
                if(channelName == channel_name){
                  editor.insertText(msg)
                }
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
      else{
        atom.notifications.addWarning('Please place in format subscribe/create channel_name');
      }
    }
  },

  publish(){
    if (editor = atom.workspace.getActiveTextEditor()) {
      let selection = editor.getSelectedText()
      let split = selection.split('\n')
      let channel = split[0]
      let message = split.splice(0, 1).join("\n")
      console.log(message)

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
