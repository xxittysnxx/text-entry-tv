const fs = require('fs');

const inputFile = './imdb.movies.tsv';
const ratingsFile = './title.ratings.tsv';
const outputFile = './imdb.ordered-movies.csv';

const minVotes = 3000;
const meanVote = 6.9;

// calculated weightedRating based on rating and number of votes
function weightedRating(rating, votes) {
  const voteSum = votes + minVotes;
  return ((votes / voteSum) * rating + (minVotes / voteSum)) * meanVote;
}

// load input files
const rawInput = fs.readFileSync(inputFile, 'utf-8');
const rawRatings = fs.readFileSync(ratingsFile, 'utf-8');

// process input files
const input = rawInput.split('\n').map((line) => {
  const values = line.split('\t');
  return {
    id: values[0],
    title: values[1],
  };
});

const ratings = {};
rawRatings.split('\n').forEach((line) => {
  const values = line.split('\t');
  ratings[values[0]] = weightedRating(parseFloat(values[1]), parseInt(values[2]));
});

// sort input based on ratings
const sorted = input.sort((entry1, entry2) => {
  const rating1 = ratings[entry1.id];
  const rating2 = ratings[entry2.id];

  if (rating1 === rating2 === undefined) {
    return 0;
  } else if (rating1 === undefined) {
    return 1;
  } else if (rating2 === undefined) {
    return -1;
  }

  return rating2 - rating1;
});

// write the title line first
fs.appendFileSync(outputFile, 'title');

sorted.forEach(entry => {
  fs.appendFileSync(outputFile, `\n${entry.title}`);
});