const fs = require('fs');
const readline = require('readline');

const inputFile = './title.basics.tsv';
const outputFile = './imdb.movies.tsv';
// possible values: movie, tvSeries, tvEpisode, short
const acceptedTypes = ['movie'];

// determine if title is non-english (contains only alphanumeric characters and punctuation)
function isLatinString(str) {
  var i, charCode;
  for (i = str.length; i--;) {
    charCode = str.charCodeAt(i)

    if (charCode < 32 || charCode > 126)
      return false;
  }

  return true;
}

// process input file
void (async () => {
  // create interface for reading input file
  const rl = readline.createInterface({
    input: fs.createReadStream(inputFile),
    crlfDelay: Infinity,
  });

  // write the title line first
  fs.appendFileSync(outputFile, 'id,title');

  // iterate line by line
  rl.on('line', (entry) => {
    const data = entry.split('\t');
    var id = data[0], type = data[1], title = data[2], year = data[5];
    if (title.includes(','))
      title = `"${title}"`;

    if (acceptedTypes.includes(type) && title.length > 1 && parseInt(year) > 1960 && isLatinString(title))
      fs.appendFileSync(outputFile, `\n${id}\t${title}`);
  });
})();
