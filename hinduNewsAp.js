'use strict';

let stopword =  require('stopword');

let hinduApNews = require('./sectionNewsandhrapradesh');

let newsValue = Object.values(hinduApNews.sectionNews);

for (let newsItem of newsValue) {
  let newString = stopword.removeStopwords(newsItem[0].title.split(' '));
  console.log(newString);
  break;
}
