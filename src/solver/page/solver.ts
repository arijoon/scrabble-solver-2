import { DictionaryService } from './../dictionary.service';
import { Component } from '@angular/core';
import { NavController, LoadingController, Loading } from 'ionic-angular';
import { FormBuilder, FormControl, Validators } from '../../../node_modules/@angular/forms';

const maxFormatLength = 20;

@Component({
  selector: 'page-solver',
  templateUrl: 'solver.html'
})
export class SolverPage {
  // Template variables
  preventDuplicates = false;
  searching = true;
  characters = "";
  wordFormat = "";

  // Temp values
  matchDic: any = null;
  matches: string[] = [];
  settings: any = {
    duplicatesWhitelist: ""
  };

  charactersPattern = "^[a-z]+_?$";
  wordFormatPattern = "^[\?_\!\|0-9a-z]+$";

  // form validators
  forms: any;

  constructor(public navCtrl: NavController,
     public loadingCtrl: LoadingController,
     private fb: FormBuilder,
     private dictionaries: DictionaryService) {
    this.setDebugValues();

    this.forms = fb.group({
      characters: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern(this.charactersPattern)
      ])),

      wordFormat: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern(this.wordFormatPattern)
      ]))
    })
  }

  public async findMatch() {
    let characters = this.forms.value['characters'];
    let wordFormat = this.forms.value['wordFormat'];
    this.searching = true;

    this.load(true);

    this.matches = [];
    this.matchDic = {};

    wordFormat = this.applyNumberMultiplier(wordFormat);

    if(wordFormat.length > maxFormatLength) {
      wordFormat = wordFormat.slice(0,maxFormatLength);
    }

    const obj = this.sanitiseCharacters(characters);

    return new Promise((resolve, reject) => {

      setTimeout(() => {
        const innerFind = (wordFormat) => {

          const afterSpecialConversion = this.applyStaticConversions(wordFormat, characters),
            myRegex = new RegExp("^" + afterSpecialConversion + "$", "gi");

          console.log(myRegex);

          const wordlist = this.dictionaries.wordlist;
          for (let key in wordlist) {

            if (!wordlist.hasOwnProperty(key) || this.matchDic[key]) continue;

            if (myRegex.test(key) && this.checkAdditional(key)) {

              this.matchDic[key] = this.calculateScore(key);
            }
          }
        }

        if (obj.shouldBrute) {

          characters = obj.characters;

          const possibleFormats = this.generatePossibleFormats(wordFormat);

          for (let i = 0; i < possibleFormats.length; i++) {
            innerFind(possibleFormats[i]);
          }

        } else {

          innerFind(wordFormat);
        }

        resolve();
      }, 300);

    }).then(() => {

      this.matches = Object.keys(this.matchDic);

      this.matches.sort((a, b) => {
        return this.matchDic[b] - this.matchDic[a];
        // return b.length - a.length;
      });

      this.searching = false;

      this.load(false);
    }).catch((err) => {

      console.log(err)
      this.load(false);
    });
  }

  loader: Loading;
  private load(state: boolean) {
    if(!this.loader) {
      this.loader = this.loadingCtrl.create({
        content: 'Please wait ...'
      });
    }

    if(state) {
      this.loader.present();
    } else {
      this.loader.dismiss();
      this.loader = null;
    }
  }

  private sortMatches(method) {
    if(method == 'length') {

      this.matches.sort((a, b) => {
        return b.length - a.length;
      });

    } else if(method == 'score') {
      this.matches.sort((a, b) => {
        return this.matchDic[b] - this.matchDic[a];
      });

    } else {
      console.error('[!] Unknown sort method ' + method);
    }
  }

  private checkAdditional(word) {
    let result = true,
        regex = this.hasDuplicates();

    do {
      var match = regex.exec(word);

      if(match) {
        const char = match[0];

        if(this.settings.duplicatesWhitelist.indexOf(char) === -1) {
          result = false;
        }
      }
    } while (match);

    return result;
  }

  private hasDuplicates() {
    return /(.)(?=.*\1)/g;
  }

  private calculateScore(word) {
    let score = 0;

    for(let i = 0; i< word.length; i++) {
      score += this.dictionaries.scores[word[i]];
    }

    return score;
  }
  private applyStaticConversions(input, charset) {
    let mapping = {
      '_': "[a-z]{1}",
      '!': "[a-z]?",
      '|': "[" + charset + "]?",
      '?' : "[" + charset + "]{1}"
    };

    let order = ['?', '!', '_', '|'];

    for(let i = 0 ; i < order.length ; i++) {
      let key = order[i];

      if(!mapping.hasOwnProperty(key))  continue;

      input = input.replaceAll(key, "(" + mapping[key] + ")");
    }

    return input;
  }

  private applyNumberMultiplier(input) {
    let regex = /([0-9]+)([_\!\|\?a-z])/ig;

    return input.replace(regex, function(a ,b, c) {
      let result = Array(parseInt(b) + 1).join(c);

      return result;
    });
  }

  private sanitiseCharacters(characters) {

    let result = false;

    if(characters.indexOf('_') !== -1) {
      result = true;
      characters = characters.replace(/_/g, "");
    }

    return {
      characters : characters,
      shouldBrute: result
    }
  }

  private generatePossibleFormats(wordFormat) {
    let mapping = {
      '|': '!'
    };

    let count = (wordFormat.match(/\|/g) || []).length,
        result = [];

    for(let i = 0, n = 0, format; i < count; i++) {

      n = 0;
      format = wordFormat.replace(/\|/g, function(match, j, original) {
        return (n++ == i) ? mapping['|'] : match;
      });

      result.push(format);
    }

    return result;
  }

  private setDebugValues() {
    this.characters = "qoftvdw";
    this.wordFormat = "||||a||||"
  }
}
