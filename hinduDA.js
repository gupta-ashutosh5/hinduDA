'use strict';

const request = require('request');
const cheerio = require('cheerio');
const url = 'https://www.thehindu.com/todays-paper/';
const fs = require('fs');

let count = 0;
const getPage = (url, cb) => {
  request(url, {
    timeout: 3000
  }, (error, response, body) => {
    if (!error) {
      cb(body);
    } else {
      console.log(count++);
    }
  });
};

const savePage = (data, sectionTitle, sectionNewsTitle) => {
  let contents = 'exports.' + sectionTitle + ' = ';
  contents += JSON.stringify(data) + ';\n\n';

  fs.appendFileSync(__dirname + '/' + sectionNewsTitle + '.js', contents);
};

const parsePage = (data, selector) => {
  const $ = cheerio.load(data);
  let output = [];
  $(selector).each((i, elem) => {
    let $a = $(elem);
    let datum = {
      title: $a.text(),
      url: $a.attr('href')
    };
    output.push(datum);
  });
  return output;
};

getPage(url, (html) => {
  let data = parsePage(html, "#subnav-tpbar-latest a");
  savePage(data, 'hinduTpSections', 'hinduTpSections');
});

setTimeout(function () {
  const {hinduTpSections} = require('./hinduTpSections');

  for (let hinduTpSection of hinduTpSections) {
    let sectionNewsTitle = 'sectionNews' + hinduTpSection.title.split(" ").join('');
    getPage(hinduTpSection.url, (html) => {
      let data = parsePage(html, ".archive-list > li > a");
      savePage(data, 'sectionNews', sectionNewsTitle);
      setTimeout(function () {
        let sectionNewsLinks = require('./' + sectionNewsTitle);
        let index = 1;
        fs.writeFileSync(__dirname + '/' + sectionNewsTitle + '.js', "'use strict';" + '\n\n');
        for (let sectionNews of sectionNewsLinks.sectionNews) {
          getNewsBody(index, sectionNews, sectionNewsTitle);
          index++;
        }
      }, 4000);
    });
  }

  function getNewsBody(index, sectionNews, sectionNewsTitle) {
    setTimeout(function () {
      getPage(sectionNews.url, (html) => {
        let data = parsePage(html, ".paywall");
        savePage(data, 'sectionNews.news' + index, sectionNewsTitle);
      });
    }, 3000 * index)
  }

}, 4000);

