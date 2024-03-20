import * as fs from 'fs';
import * as crypto from 'crypto';
import { ParsedMethod } from '../parser/parser';

type FileElem = {
  fileHash: string,
  methods: ParsedMethod[] | null
};

export class FileKeeper {
  private files: Map<string, FileElem>;

  constructor() {
    this.files = new Map();
  }

  addFile(path: string, fileElem: FileElem) {
    this.files.set(path, fileElem);
  }

  removeFile(path: string) {
    this.files.delete(path);
  }

  getFile(path: string) {
    return this.files.get(path);
  }

  checkFileUpdate(path: string): { flag: boolean, fileContent: string, fileElem: FileElem } {
    const fileContent = fs.readFileSync(path, 'utf-8');
    const hasher = crypto.createHash('sha256');
    const hash = hasher.update(fileContent).digest('hex');
    if (this.files.has(path) && this.files.get(path)!.fileHash === hash) {
      return { flag: false, fileContent: fileContent, fileElem: this.files.get(path)! };
    }
    return { flag: true, fileContent: fileContent, fileElem: { fileHash: hash, methods: null } };
  }

  serialize(storagePath: string) {
    const data = JSON.stringify(Array.from(this.files.entries()));
    fs.writeFileSync(storagePath, data);
  }

  deserialize(storagePath: string) {
    const data = fs.readFileSync(storagePath, 'utf-8');
    const entries = JSON.parse(data);
    this.files = new Map(entries);
  }
}