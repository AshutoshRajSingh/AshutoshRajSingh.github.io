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

var IsStarted = false;
var IntervalId = -1;

function randomChoice(arr){
    /**
     * Selects a random element from a supplied array
     */
    let choice = arr[Math.floor(Math.random() * arr.length)];
    return choice;
};

function randInt(a, b){
    /**
     * Returns a pseudo random integer between a (inclusive) and b (exclusive)
     */
    let subuwu = a + Math.floor(Math.random() * b)
    return subuwu;
};

function sleep(ms) {
    /**
     * Sleeps for x ms somehow by using (Promises)?
     * I wonder when js will fulfil the promise of not being a malignant clusterfuck
     */
    return new Promise(resolve => setTimeout(resolve, ms));
};

function onLoad(){
    /**
     * Function that takes care of the stuff that needs to happen 
     * as the webpage loads, including populating the <select>s labelled 
     * "From" and "To"
     */
    let rangeFrom = document.getElementById("rangeFrom");
    let rangeTo = document.getElementById("rangeTo");

    for (let i = 0; i < ROMAJI_EQUIVALENTS.length; i++){

        let self = ROMAJI_EQUIVALENTS[i];
        let option = document.createElement("option");

        option.value = i;
        option.text = self[0] + "-" + self[self.length - 1];

        let clone = option.cloneNode(true);

        rangeFrom.appendChild(option);
        rangeTo.appendChild(clone);
    }
}

function disableOptions(){
    /**
     * Function that disables all the options in the 
     * stresstest page.
     */
    let rangeFrom = document.getElementById("rangeFrom");
    let rangeTo = document.getElementById("rangeTo");
    let timeoutInp = document.getElementById("timeoutInp");
    let waitInp = document.getElementById("waitInp");
    let sType = document.getElementById("sType");

    rangeFrom.disabled = true;
    rangeTo.disabled = true;
    timeoutInp.disabled = true;
    waitInp.disabled = true;
    sType.disabled = true;
};

function enableOptions(){
    /**
     * Function that enables all the options in the 
     * stresstest page.
     */
    let rangeFrom = document.getElementById("rangeFrom");
    let rangeTo = document.getElementById("rangeTo");
    let timeoutInp = document.getElementById("timeoutInp");
    let waitInp = document.getElementById("waitInp");
    let sType = document.getElementById("sType");

    rangeFrom.disabled = false;
    rangeTo.disabled = false;
    timeoutInp.disabled = false;
    waitInp.disabled = false;
    sType.disabled = false;
}

function checkAlert(){
    /**
     * Function primarily used to stop stresstest if the user
     * tries to touch the options while it's running
     */
    if (IsStarted){
        stopStressTest();
    }
}

function startStressTest(){
    /**
     * Function that starts the stress test, not that anyone other than me is gonna see this
     * but this blew my brains out to the point I literally have no idea how I got around to making
     * it therefore as it stands any PRs to this function will be immediately rejected as I'm too scared
     */

    // Short circuit if test already started
    if (IsStarted){
        return;
    }

    // Set the flag to true
    IsStarted = true;

    // Does what it says
    disableOptions();

    // Get elements from the DOM
    let questionContainer = document.getElementById("questionContainer");
    let solutionContainer = document.getElementById("solutionContainer");
    let timeoutInp = document.getElementById("timeoutInp");
    let waitInp = document.getElementById("waitInp");
    let sType = document.getElementById("sType");

    // Read the values for timeout and wait
    let timeOut = parseInt(timeoutInp.value) * 1000;
    let waitPeriod = parseInt(waitInp.value) * 1000;

    // A rather mundane smartass-proofing solution in the event someone tries to enter
    // a smaller number than permitted
    if (timeOut < parseInt(timeoutInp.min)){
        timeoutInp.value = parseInt(timeoutInp.min);
        timeOut = parseInt(timeoutInp.min) * 1000;
    }

    if (waitPeriod < parseInt(waitInp.min)){
        waitInp.value = parseInt(waitInp.min);
        waitPeriod = parseInt(waitInp.min) * 1000;
    }

    // Get the DOM elements from the From and To <select>s
    let rangeFrom = document.getElementById("rangeFrom");
    let rangeTo = document.getElementById("rangeTo");

    // If from > to, swap them
    if (parseInt(rangeFrom.value) > parseInt(rangeTo.value)){
        let temp = rangeFrom.value;
        rangeFrom.value = rangeTo.value;
        rangeTo.value = temp;
    }

    // Get the type of answer to be displayed, Hiragana or Katakana
    let questionType = VALUE_MAP["romaji"];
    let solutionType = VALUE_MAP[sType.value];

    let Qrange, Srange;

    // Generate pool out of the arrays that come in between the range specified by the
    // From and To <select>s (both inclusive)
    Qrange = questionType.slice(rangeFrom.value, parseInt(rangeTo.value)+1);
    Srange = solutionType.slice(rangeFrom.value, parseInt(rangeTo.value)+1);

    let lastChoice = "", choice = "";
    

    async function changeValue(){
        /**
         * Function that handles changing the value then displaying the result after the "Timeout" period
         * very naive but functional, not sure if I'm gonna refactor later.
         */
        solutionContainer.innerHTML = "";
        let index;
        let rangeIndex = randInt(0, Qrange.length);
        let Qrangeselect = Qrange[rangeIndex];
        let Srangeselect = Srange[rangeIndex];

        // Again, mundane method of avoiding repetition give me a goddamn break okay
        // this is javascript
        while (lastChoice === choice){
            index = randInt(0, Qrangeselect.length);
            choice = Qrangeselect[index];
        }

        // Gotta make sure the sleep from an earlier iteration before the test was stopped won't 
        // appear on the answer section.
        if (IsStarted){
            questionContainer.innerHTML = "<h1>"+ choice +"</h1>";
            await sleep(timeOut);
            if (IsStarted && questionContainer.innerHTML === "<h1>" + choice + "</h1>"){
                solutionContainer.innerHTML = "<h1>" + Srangeselect[index] + "</h1>";   
            }
        }
        lastChoice = choice;
    };

    // Gotta do it once when starting
    changeValue();

    // This starts the loop that makes things happen after every waitPeriod + timeOut seconds
    IntervalId = setInterval(changeValue, waitPeriod + timeOut);
}

function stopStressTest(){
    /**
     * Function to stop the stress test and do any cleanup
     * necessary
     */
    if (!IsStarted){
        return;
    }
    enableOptions();
    let questionContainer = document.getElementById("questionContainer");
    let solutionContainer = document.getElementById("solutionContainer");

    // The "cleanup"
    questionContainer.innerHTML = "";
    solutionContainer.innerHTML = "";

    clearInterval(IntervalId);
    IsStarted = false;
    IntervalId = -1;
}
