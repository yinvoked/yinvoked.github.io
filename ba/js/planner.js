let requestURL = "../data/timeline.json";
let request = new XMLHttpRequest();
request.open('GET', requestURL);
request.responseType = 'text';
request.send();

request.onload = function() {
    const responseText = request.response;
    const timeline = JSON.parse(responseText);
    console.log(timeline);
}