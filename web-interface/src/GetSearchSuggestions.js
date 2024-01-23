import Papa from "papaparse";

const maxSuggestions = 15;
var data = null;

async function LoadSearchData(onComplete) {
    var rawdata = null;
    const response = await fetch("https://raw.githubusercontent.com/Riley229/IMDb-dataset-filtered/main/imdb.ordered-movies.modified.csv");

    rawdata = await response.text();
    rawdata = Papa.parse(rawdata, { header: true }).data;
    data = {};

    for (let i = 0; i < 26; i++) {
        const char = String.fromCharCode(97 + i);
        data[char] = rawdata
            .filter((/** @type {{ title: string; }} */ item) => item.title.substring(0, 1).toLowerCase() === char)
            .map((/** @type {{ title: string; }} */ item) => {
                const value = item.title.toLowerCase().replace(/[^a-zA-Z\d\s:]/g, " ").replace(/\s+/g, " ");
                const displayText = value.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());

                return {
                    title: displayText,
                    compare: value,
                };
            });
    }

    onComplete();
}

function GetSearchSuggestions(input) {
    const keyword = input.toLowerCase();
    const suggestions = [];

    if (data === null || keyword === '' || keyword.startsWith('.'))
        return [];

    const firstChar = keyword.substring(0, 1).toLowerCase();
    if (data[firstChar] === undefined)
        return [];

    // iterate over each entry and match with keyword
    for (let i = 0; i < data[firstChar].length; i++) {
        const item = data[firstChar][i];
        if (item.compare.startsWith(keyword) && !suggestions.includes(item.title) && item.compare !== keyword)
            suggestions.push(item.title);

        if (suggestions.length >= maxSuggestions)
            return suggestions;
    }

    return suggestions;
}

export {
    GetSearchSuggestions,
    LoadSearchData,
}
