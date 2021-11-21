// Globals to store arrays that'll be used everywhere

var HIRAGANA_LETTERS = [
    ["あ", "い", "う", "え", "お"],
    ["か", "き", "く", "け", "こ"],
    ["さ", "し", "す", "せ", "そ"],
    ["た", "ち", "つ", "て", "と"],
    ["な", "に", "ぬ", "ね", "の"],
    ["は", "ひ", "ふ", "へ", "ほ"],
    ["ま", "み", "む", "め", "も"],
    ["や", "ゆ", "よ"],
    ["ら", "り", "る", "れ", "ろ"],
    ["わ", "を"],
    ["ん"]
];

var KATAKANA_LETTERS = [
    ["ア", "イ", "ウ", "エ", "オ"],
    ["カ", "キ", "ク", "ケ", "コ"],
    ["サ", "シ", "ス", "セ", "ソ"],
    ["タ", "チ", "ツ", "テ", "ト"],
    ["ナ", "ニ", "ヌ", "ネ", "ノ"],
    ["ハ", "ヒ", "フ", "ヘ", "ホ"],
    ["マ", "ミ", "ム", "メ", "モ"],
    ["ヤ", "ユ", "ヨ"],
    ["ラ", "リ", "ル", "レ", "ロ"],
    ["ワ", "ヲ"],
    ["ン"]
];

var ROMAJI_EQUIVALENTS = [
    ["a", "i", "u", "e", "o"],
    ["ka", "ki", "ku", "ke", "ko"],
    ["sa", "shi", "su", "se", "so"],
    ["ta", "chi", "tsu", "te", "to"],
    ["na", "ni", "nu", "ne", "no"],
    ["ha", "hi", "hu", "he", "ho"],
    ["ma", "mi", "mu", "me", "mo"],
    ["ya", "yu", "yo"],
    ["ra", "ri", "ru", "re", "ro"],
    ["wa", "wo"],
    ["n"]
];

var VALUE_MAP = {
    "hiragana": HIRAGANA_LETTERS,
    "katakana": KATAKANA_LETTERS,
    "romaji": ROMAJI_EQUIVALENTS
};

// Global that works as a flag
var isStarted = false;

// ------------------------------------------Functions start here----------------------------------------

function randInt(a, b){
    /**
     * Returns a pseudo random integer between a (inclusive) and b (exclusive)
     */
    return a + Math.floor(Math.random() * b)
}

function disableOptions(){
    /**
     * Function that disables all customization options in the DOM,
     * and enables the input/checking elements
     */
    let rangeFrom = document.getElementById("rangeFrom");
    let rangeTo = document.getElementById("rangeTo");
    let qType = document.getElementById("qType");
    let answerInp = document.getElementById("answerInp");
    let checkBtn = document.getElementById("checkBtn");

    answerInp.disabled = false;
    checkBtn.disabled = false;
    rangeFrom.disabled = true;
    rangeTo.disabled = true;
    qType.disabled = true;
};

function enableOptions(){
    /**
     * Function that enables all customization options in the DOM,
     * and disables the input/checking elements
     */
    let rangeFrom = document.getElementById("rangeFrom");
    let rangeTo = document.getElementById("rangeTo");
    let qType = document.getElementById("qType");
    let answerInp = document.getElementById("answerInp");
    let checkBtn = document.getElementById("checkBtn");

    answerInp.disabled = true;
    checkBtn.disabled = true;
    rangeFrom.disabled = false;
    rangeTo.disabled = false;
    qType.disabled = false;
};

function constructDict(type){
    /**
     * Constructs an object that maps hiragana/katakana letters to their 
     * romaji equivalents and returns it.
     * 
     * Parameters:
     *  type (string): Whether to map hiragana or katakana to romaji
     */
    let sType;
    switch (type){
        case "hiragana":
        sType = HIRAGANA_LETTERS;
        break;

        case "katakana":
        sType = KATAKANA_LETTERS;
        break;
    }

    let retDict = {};

    for (let i = 0; i < sType.length; i++){
        for (let j = 0; j < sType[i].length; j++){
            retDict[sType[i][j]] = ROMAJI_EQUIVALENTS[i][j];
        }
    }
    return retDict;
};

function onLoad(){
    /**
     * Function that takes care of things that need to happen on webpage load, 
     * called only once, as part of the <body> onload listener
     */


    let rangeFrom = document.getElementById("rangeFrom");
    let rangeTo = document.getElementById("rangeTo");
    let answerInp = document.getElementById("answerInp");

    // Loop that fills up the rangeFrom and rangeTo <select>s with the required options
    // Basically creates options of the format a-b for all subarrays inside ROMAJI_EQUIVALENTS
    // where a is the first element of the subarray and b is the last one
    for (let i = 0; i < ROMAJI_EQUIVALENTS.length; i++){

        let self = ROMAJI_EQUIVALENTS[i];
        let option = document.createElement("option");

        option.value = i;
        option.text = self[0] + "-" + self[self.length - 1];

        let clone = option.cloneNode(true);

        rangeFrom.appendChild(option);
        rangeTo.appendChild(clone);
    }

    // Adds an event listener that makes the Enter key inside the answer input have the same 
    // effect as clicking the button next to it.
    answerInp.addEventListener('keyup', function enterEvent(e){
        if (e.key == "Enter"){
            checkBtnResponse();
        }
    });

};

function verifySoln(){
    /**
     * Function to check whether the romaji entered in the text box is
     * the correct equivalent of the kana in the question box or not
     */
    let questionHeading = document.getElementById("questionHeading");
    let solutionHeading = document.getElementById("solutionHeading");
    let tickCross = document.getElementById("tickCross");
    let checkBtn = document.getElementById("checkBtn");

    let qType = document.getElementById("qType").value;
    let answerInp = document.getElementById("answerInp");

    let dict = constructDict(qType);

    // Style first format later, most web browsers are more than capable 
    // of handling this fast enough to not be an issue
    solutionHeading.innerHTML = dict[questionHeading.innerHTML];

    if (dict[questionHeading.innerHTML] == answerInp.value.toLowerCase().trim()) {
        solutionHeading.style.color = "green";
        tickCross.style.color = "green";
        tickCross.innerHTML = "✓";
    } else {
        solutionHeading.style.color = "red";
        tickCross.style.color = "red";
        tickCross.innerHTML = "✗";
    }

    // Change the content of the button to "Next" after checking 
    // is done
    checkBtn.innerHTML = "Next";
};

function nextQ(){
    /**
     * Function to display the next question on the whiteboard
     * Parameters: none
     * Returns: null
     */

    // Get the containers for the question and solution <h1>s
    let questionHeading = document.getElementById("questionHeading");
    let solutionHeading = document.getElementById("solutionHeading");

    // Clear the section that holds the tick/cross signs next to the answer input
    document.getElementById("tickCross").innerHTML = "";

    // Store the current question in a variable
    let prevQ = questionHeading.innerHTML;

    // Clear the containers that hold the question and solution so new ones can take their placce
    questionHeading.innerHTML = "";
    solutionHeading.innerHTML = "";

    // Get the document elements that hold the from and to <select>s
    let rangeFrom = document.getElementById("rangeFrom");
    let rangeTo = document.getElementById("rangeTo");

    // If the "To" value is less than the "From" value, swap them
    if (parseInt(rangeFrom.value) > parseInt(rangeTo.value)){
        let temp = rangeFrom.value;
        rangeFrom.value = rangeTo.value;
        rangeTo.value = temp;
    }

    // Get the DOM elements for the answer input field and the button to check the response
    let checkBtn = document.getElementById("checkBtn");
    let answerInp = document.getElementById("answerInp");

    // Get the type of kana the question is supposed to stem from
    let qType = document.getElementById("qType").value;
    let qPool = VALUE_MAP[qType]; // Generate a pool of the valid question characters

    // Slice the pool based off the range selected in the DOM <select> such that "From" and "To" are both inclusive
    let qRange = qPool.slice(parseInt(rangeFrom.value), parseInt(rangeTo.value) + 1);

    // Make a random choice out of the pool to get a single string array stored in qArr
    let outerIndex = randInt(0, qRange.length);
    let qArr = qRange[outerIndex];

    // Make a random choice out of qArr to get a single hiragana letter and store it in the variable `question`
    let innerIndex = randInt(0, qArr.length);
    let question = qArr[innerIndex];


    // I know this is not the best way to avoid duplicates but given
    // the scale, it works good enough to not be noticeable
    while (qArr[innerIndex] == prevQ){
        innerIndex = randInt(0, qArr.length);
        question = qArr[innerIndex];
    }

    // Finally change the question part of the whiteboard to accomodate this question, and
    // change the button to say "Check" instead of "Next", and also clear the input field.
    questionHeading.innerHTML = question;
    checkBtn.innerHTML = "Check";
    answerInp.value = "";
}

function checkBtnResponse(){
    /**
     * Fired when the Check/Next button are fired
     * Does something based on whether the content is
     * "Next" or "Check"
     */
    let checkBtn = document.getElementById("checkBtn");

    if (checkBtn.innerHTML == "Next"){
        nextQ();
    } else {
        verifySoln();
    }
    
}

function startLookupTest(){
    /**
     * Function to start lookup test.
     */
    if (isStarted){
        return;
    }
    disableOptions();
    isStarted = true;

    nextQ();
}

function stopLookupTest(){
    /**
     * Function to stop lookup test.
     */
    if (!isStarted){
        return;
    }
    enableOptions();
    isStarted = false;

    let questionHeading = document.getElementById("questionHeading");
    let solutionHeading = document.getElementById("solutionHeading");
    let tickCross = document.getElementById("tickCross");
    let answerInp = document.getElementById("answerInp");
    let checkBtn = document.getElementById("checkBtn");



    questionHeading.innerHTML = "";
    solutionHeading.innerHTML = "";
    tickCross.innerHTML = "";
    answerInp.value = "";
    checkBtn.innerHTML = "Check";
}

function checkAlert(){
    /**
     * Function that stops lookup test
     * if any of the options are touched
     * while it's running
     */
    stopLookupTest();
    enableOptions();
}