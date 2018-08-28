import scores from './scores';
import { Injectable } from '@angular/core';

declare var require: any;

const wordlist = require('./wordlist.json');

@Injectable()
export class DictionaryService { 
  get scores() {
    return scores;
  }

  get wordlist() {
    return wordlist;
  }
}
