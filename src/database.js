import path from 'path';
import fs from 'fs/promises';

class Database {
  constructor(data, file) {
    this.data = data;
    this.file = file;
  }
  getToots(limit = 7) {
    return this.data.toots
      ? this.data.toots.slice(Math.max(this.data.toots.length - limit, 0))
      : [];
  }
  getUserToots(user) {
    return this.data.toots.filter((toot) => toot.author == user);
  }
  createToot(toot) {
    if (this.data.toots === undefined) {
      this.data.toots = [];
      this.data.tootTracker = 0;
    }
    toot.id = this.data.tootTracker++;
    this.data.toots.push(toot);
    return toot;
  }
  getToot(id) {
    return this.data.toots.find((toot) => toot.id == id);
  }
  deleteToot(id) {
    let toot = this.getToot(id);
    let index = this.data.toots.indexOf(toot);
    if (index > -1) {
      this.data.toots.splice(index, 1);
    }
    return toot;
  }
  save() {
    fs.writeFile(this.file, JSON.stringify(this.data))
  }
}

var database = null;

export default async () => {
  if (database !== null) {
    return database;
  }
  console.log('Loading database');
  let dbFile = path.join(import.meta.dirname, '../database.json');
  let file = "";
  try {
    file = await fs.readFile(dbFile);
  } catch (e) {
    // Seed the database
    let data = {
      tootTracker: 4,
      toots: [
        {
          id: 0,
          content: "First Toot!",
          author: "test-user",
          date: new Date(),
        },
        {
          id: 1,
          content: "Another Toot!",
          author: "test-user",
          date: new Date(),
        },
        {
          id: 2,
          content: "An epic Toot!",
          author: "test-user",
          date: new Date(),
        },
        {
          id: 3,
          content: "Last Toot!",
          author: "test-user",
          date: new Date(),
        },
      ]
    };
    fs.writeFile(dbFile, JSON.stringify(data));
    file = JSON.stringify(data);
  }
  let data = JSON.parse(file);
  let db = new Database(data, dbFile);
  database = db;
  return database;
};
