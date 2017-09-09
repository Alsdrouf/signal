export default class History {
  constructor(app) {
    this.app = app
    this.undoHistory = []
    this.redoHistory = []
  }

  push(action, song) {
    this.undoHistory.push(song.clone())
    this.redoHistory = []
  }

  undo() {
    const song = this.undoHistory.pop()
    if (song) {
      this.redoHistory.push(this.app.song.clone())
      this.app.song = song
    } 
  }
  
  redo() {
    const song = this.redoHistory.pop()
    if (song) {
      this.undoHistory.push(this.app.song.clone())
      this.app.song = song
    } 
  }
}