import NoteModel from "../models/Note.model.js";
import NoteCollectionModel from "../models/NoteCollection.model.js";

let isInit = false;

const channel = {
  init() {
    if (isInit) {
      return;
    }

    const channel = new BroadcastChannel('haiku');
    const noteCollectionModel = NoteCollectionModel.getInstance();

    noteCollectionModel.subscribe(({ noteId, type }, blockBroadcast = false) => {
      if (blockBroadcast) {
        return;
      }
      console.log('Send Channel Message:', type, noteId);
      channel.postMessage({
        type,
        noteId,
      });
    });

    channel.onmessage = (msgEvent) => {
      const { noteId, type } = msgEvent.data;
      console.log('Channel Message received:', type, noteId);
      switch (type) {
        case 'create':
          noteCollectionModel.addNoteId(noteId, true);
          break;
        case 'change':
          NoteModel.getInstance(noteId).refresh(true);
          break;
        case 'remove':
          NoteModel.getInstance(noteId).delete(true);
          break;
      }
    };
    isInit = true;
  }
}

export default channel;