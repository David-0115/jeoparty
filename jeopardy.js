const apiURL = 'https://jservice.io/api/'
let categories = []
let clickCount = 0;
let questions = [{ clues: [] }, { clues: [] }, { clues: [] }, { clues: [] }, { clues: [] }, { clues: [] }]

//When New Game is clicked, prepares dom removing table bg image, credits, New Game btn, and adding table borders.
//Triggers getCategoryIds function.
$('#new-game').on('click', function () {
    $('#gameboard').removeClass('off').addClass('on').addClass('border');
    $('#new-game').addClass('d-none');
    $('.credit').addClass('d-none');
    $('.question').addClass('border');
    $('.category').addClass('border');
    $('#22').text('LOADING...');
    $('#32').html('<div class="spin" id="end"></div');
    getCategoryIds();
});

//connects to jservcie api, returns object with 100 categories. Passes object to randomCategories.
async function getCategoryIds() {
    const catIds = await axios.get(`${apiURL}categories?count=100`)
    randomCategories(catIds);
};

//takes object from get CategoryIds, randomly selects 6 category ids, passes array with ids to getCategory
function randomCategories(catIds) {
    const randomCat = []
    for (let i = 1; i <= 10; i++) {
        const randomNum = Math.floor(Math.random() * 100)
        randomCat.push(catIds.data[randomNum].id);
    };
    const randomized = randomCat.filter(function (num, idx) { return randomCat.indexOf(num) == idx });
    const result = [];
    let idx = 0;
    while (result.length < 6) {
        result.push(randomized[idx]);
        idx++
    };
    getCategory(result);
};

//takes the result array with category id's connects to api pushes object with Q&A's to categories array.
function getCategory(catId) {
    catId.forEach(async function (val) {
        categories.push(await axios.get(`${apiURL}category?id=${val}`))
    });
    checkPromise();
};

//validates getCategory promise has fulfilled and categories has 6 items, starts setShowing()
function checkPromise() {
    if (categories.length !== 6) {
        setTimeout(checkPromise, 100);
    } else {
        setShowing();
    }
};

// ensures category has 5 clues, creates showing:null key:value in the categories object, starts fillTable();
function setShowing() {
    let clueUnder5 = '';
    for (let i = 0; i < categories.length; i++) {
        if (categories[i].data.clues_count < 5) {
            clueUnder5 = true;
            categories = [];
            getCategoryIds();
            break;
        } else {
            for (let j = 0; j < 5; j++) {
                let obj = categories[i].data.clues[j];
                obj.showing = null;
            }
        }
        if (categories[5].data.clues[4].showing == null) {
            clueUnder5 = false;
        }
    }
    setTimeout(clueCheck(), 100);
    function clueCheck() {
        if (clueUnder5 === false) {
            fillTable();
        }
    }

};

//calculates the number of clues in each category, randomly pushes a question to questions array
function randomQuestions() {
    for (let i = 0; i < categories.length; i++) {
        let numClues = categories[i].data.clues_count;
        let clues = []
        for (let j = 0; questions[i].clues.length < 5; j++) {
            let idx = 0;
            const random = (() => idx = (Math.floor(Math.random() * numClues)));
            random();
            if (clues.indexOf(idx) !== -1) {
                random();
            } else {
                clues.push(idx);
                questions[i].clues.push(categories[i].data.clues[idx]);
            }

        }
    }
}


//executes randomQuestions(), fills thead with categories, tbody with ? image
function fillTable() {
    randomQuestions();
    $('.question').html('<img src="q.png">');
    const $domCat = $('.category');
    try {
        for (let i = 0; i <= 6; i++) {
            let title = (`${categories[i].data.title.toUpperCase()}`);
            $domCat[i].innerText = title;
        };
    }
    catch {
        if ($domCat[0].innerText == categories[0].data.title.toUpperCase() &&
            $domCat[5].innerText == categories[5].data.title.toUpperCase()) {
            console.log('Try successful, no error')
        } else {
            fillTable();
        }
    }


}

//when gameboard is clicked determines target and passes to handleClick()
$('#gameboard').on('click', function (e) {
    if (e.target.nodeName === "IMG") {
        handleClick(e.target.parentElement);
    } else {
        handleClick(e.target)
    }

});

/*target is passed in from gameboard click, turns clicked cell to question on 1st click answer on 2nd click
each successful click adds to clickCount, if clickCount = 60 ends game and starts showLoadingView()
*/
function handleClick(eTarget) {
    const id = eTarget.getAttribute('id');
    const col = id[0];
    const row = id[1];
    let path = questions[col].clues[row]
    if (path.showing == null) {
        $(`#${id}`).html('').text(`${path.question}`);
        path.showing = 'q'
        clickCount++
    } else if (path.showing == 'q') {
        $(`#${id}`).html('').text(`${path.answer}`).css('background-color', '#28a200');
        path.showing = 'a'
        clickCount++
        if (clickCount === 60) {
            showLoadingView();
        }
    } else {
        //ignore click;
    }
};

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    const endMsgHead = ['GAME', 'OVER'];
    const endMsg = ['Thank', 'you', 'for', 'playing', 'Jeoparty'];
    const row2 = [22, 32]
    const row3 = [13, 23, 33, 43, 56]
    setTimeout(function () {
        $('.category').text('');
        $('.question').text('').css('background-color', '#060ce9');
        endMsgHead.forEach((val, idx) => $(`#${row2[idx]}`).text(`${val}`));
        endMsg.forEach((val, idx) => $(`#${row3[idx]}`).text(`${val}`));
    }, 1500);
    setTimeout(function () {
        $('.category').text('');
        $('.question').text('');
        $('#22').text('LOADING...');
        $('#32').html('<div class="spin" id="end"></div');
    }, 3500);
    setTimeout(resetGame, 5500);


}

//resets game to original 
function resetGame() {
    categories = [];
    clickCount = 0;
    questions = [{ clues: [] }, { clues: [] }, { clues: [] }, { clues: [] }, { clues: [] }, { clues: [] }];
    $('.question').text('');
    $('.question').html('');
    $('.question').text('').css('background-color', '');
    $('#gameboard').removeClass('on').addClass('off').removeClass('border');
    $('#new-game').removeClass('d-none');
    $('.credit').removeClass('d-none');
    $('.question').removeClass('border');
    $('.category').removeClass('border');
}
