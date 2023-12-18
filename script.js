const root = document.querySelector(':root');
const body = document.querySelector('body');
let quote = document.getElementById('quote');
let answerTextbox = document.getElementById("answerTextbox");
let transcriptLines = [];
let randomLine;
let randomIndex;
let trophyDiv = document.getElementById('trophyDiv');
let profilePicture = document.getElementById('profilePicture');
const characters = ['Alfred', 'Bane', 'Bruce Wayne', 'Catwoman', 'Commissioner Gordon', 'Harvey Dent', 'John Blake', 'Joker', 'Lucius Fox', 'Miranda Tate', "Ra's al Ghul", 'Scarecrow'];
let usernameTextbox = document.getElementById('usernameTextbox');
let nameTextbox = document.getElementById('nameTextbox');
let textAbove = document.getElementById('textAbove4');
let descriptionTextarea = document.getElementById('descriptionTextarea');
const statsDisplays = {
    played: document.getElementById('quotesPlayed'),
    won: document.getElementById('quotesWon'),
    accuracy: document.getElementById('quotesAccuracy')
}
let shortStorage = {};
let gamemode = 'normal';
let finishDiv = document.getElementById('finishDiv');
let quizQuestion = 0;
let currentMovie = 'The Dark Knight';
let quizCorrect = 0;
let endlessLength = 0;
let scoreSaved = true;
let newGameIsNeeded = true;
let goingBack = undefined;
let nextGame = {};
let movies = {
    "The Dark Knight": {},
    "Inception": {},
    "The Dark Knight Rises": {},
    "Batman Begins": {}
}
let movieStatsDropdown = document.getElementById('movieStatsDropdown');
let gamemodeDropdown = document.getElementById('gamemodeDropdown');
{
    let keys = Object.keys(movies);
    keys.splice(0, 0, "All");
    keys.forEach(key => {
        let option = document.createElement('option');
        option.textContent = key;
        option.value = key;
        movieStatsDropdown.appendChild(option);
    });
}

if(!localStorage.info) {
    let character = characters[Math.floor(Math.random() * characters.length)];
    profilePicture.src = `Characters/${character}.png`;

    localStorage.info = JSON.stringify({
        username: '',
        name: '',
        description: '',
        character: character
    });
    shortStorage.stats = {
        total: {
            played: 0,
            won: 0,
        }
    };
    let keys = Object.keys(movies);
    for(let i = 0; i < keys.length; i++) {
        shortStorage.stats[keys[i]] = {
            total: {
                played: 0,
                won: 0
            },
            normal: {
                played: 0,
                won: 0
            },
            quiz: {
                played: 0,
                averageScore: 0,
                recordAccuracy: 0
            },
            endless: {
                played: 0,
                recordLength: 0,
                averageLength: 0
            }
        }
    }
    localStorage.stats = JSON.stringify(shortStorage.stats);

    localStorage.version = 1.0;
}
shortStorage.info = JSON.parse(localStorage.info);
shortStorage.stats = JSON.parse(localStorage.stats);
usernameTextbox.value = shortStorage.info.username;
nameTextbox.value = shortStorage.info.name;
descriptionTextarea.value = shortStorage.info.description;
profilePicture.src = `Characters/${shortStorage.info.character}.png`;

let getTranscript = (movie) => {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', `Transcripts/${movie}_transcript.txt`, true);
    xhr.onreadystatechange = function() {
        if(xhr.readyState === 4 && xhr.status === 200) {
            let transcript = xhr.responseText;
            transcript = format(transcript);
            movies[movie].lines = transcript
        }
    };
    xhr.send();
}

{
    let keys = Object.keys(movies);
    keys.forEach(key => {
        let div = document.createElement('div');
        div.classList.add('movieNameDiv');

        let h3 = document.createElement('h3');
        h3.classList.add('movieName');
        h3.innerHTML = key;
        div.appendChild(h3);
        document.querySelector('#movieList').appendChild(div);

        div.addEventListener('click', () => {
            let movieNamesDiv = document.querySelectorAll('.movieNameDiv');
            movieNamesDiv.forEach(noBorder => {
                noBorder.style.border = '0';
            });
            div.style.border = '1vh solid var(--borderColor)';
            newQuote(key);
        });

        getTranscript(key);
    });
}

let submit = (movie = currentMovie) => {
    let submitButton = document.getElementById('submitButton');
    if(submitButton.dataset.enabled === "true" && !newGameIsNeeded) {
        let guess = answerTextbox.value;
        quote.innerHTML = `Answer: "${movies[movie].lines[randomIndex + 1]}"`;
        let gotCorrect = false;
        if(areSentencesSame(guess, movies[movie].lines[randomIndex + 1])) {
            body.style.backgroundColor = 'green';
            gotCorrect = true;
            shortStorage.stats.total.won++;
            shortStorage.stats[movie].total.won++;
            if(gamemode == 'normal') {
                shortStorage.stats[movie].normal.won++;
                newGameIsNeeded = true;
                scoreSaved = true;
            } else if(gamemode == 'quiz') {
                quizCorrect++;
            } else if(gamemode == 'endless') {
                endlessLength++;
            }
        } else {
            body.style.backgroundColor = 'red';
            if(gamemode == 'endless') {
                newGameIsNeeded = true;
                if(shortStorage.stats[currentMovie].endless.played != 0) {
                    shortStorage.stats[currentMovie].endless.averageLength = ((shortStorage.stats[currentMovie].endless.played-1)*shortStorage.stats[currentMovie].endless.averageLength + endlessLength)/shortStorage.stats[currentMovie].endless.played;
                }
                displayEndlessResults();
                if(endlessLength > shortStorage.stats[currentMovie].endless.recordLength) {
                    shortStorage.stats[currentMovie].endless.recordLength = endlessLength;
                }
                scoreSaved = true;
            } else if(gamemode == 'normal') {
                newGameIsNeeded = true;
            }
        }
        if(gamemode == 'quiz' && quizQuestion >= 10) {
            newGameIsNeeded = true;
            scoreSaved = true;
            displayQuizResults();
            if(shortStorage.stats[currentMovie].quiz.played != 0) {
                shortStorage.stats[currentMovie].quiz.averageScore = ((shortStorage.stats[currentMovie].quiz.played-1)*shortStorage.stats[currentMovie].quiz.averageScore + quizCorrect)/shortStorage.stats[currentMovie].quiz.played;
            }
            if(quizCorrect > shortStorage.stats[currentMovie].quiz.recordAccuracy) {
                shortStorage.stats[currentMovie].quiz.recordAccuracy = quizCorrect;
            }
        }
        let ms = 500;
        if(gamemode == 'quiz') {
            ms = 1000;
        } else if(gamemode == 'endless') {
            ms = 250;
        }

        submitButton.dataset.enabled = 'false';
        setTimeout(() => {
            submitButton.dataset.enabled = 'true';
            body.style.backgroundColor = 'var(--darkerBackgroundColor)';
            if(goingBack) {
                if(gamemode == 'normal') {
                    gamemode = nextGame.gamemode;
                    newQuote(nextGame.movie);
                }
            } else {
                if(gamemode == 'quiz') {
                    if(quizQuestion < 10) {
                        quizQuestion++;
                        randomIndex = Math.floor(Math.random()*movies[movie].lines.length);
                        randomLine = movies[movie].lines[randomIndex];
                        textAbove.innerHTML = `Question ${quizQuestion}/10`;
                        setQuote();
                    }
                } else if(gamemode == 'endless') {
                    if(gotCorrect) {
                        randomIndex++;
                        randomLine = movies[movie].lines[randomIndex];
                        textAbove.innerHTML = `Score: ${endlessLength}`;
                        setQuote();
                    }
                }
            }
        },ms);
        localStorage.stats = JSON.stringify(shortStorage.stats);
    } else if(submitButton.dataset.enabled === "true") {
        newQuote(currentMovie);
    }
}

answerTextbox.addEventListener('keydown', (event) => {
    if(event.key == "Enter") {
        submit(currentMovie);
    }
});

const areSentencesSame = (sentence1, sentence2) => {
    // Remove commas, convert to lowercase, and split sentences into words
    const words1 = sentence1.replace(/,|"/g, '').replace(/’/g, "'").toLowerCase().trim().split(/\s+/);
    const words2 = sentence2.replace(/,|"/g, '').replace(/’/g, "'").toLowerCase().trim().split(/\s+/);

    // Compare the arrays
    if (words1.length !== words2.length) {
        return false;
    }

    for (let i = 0; i < words1.length; i++) {
        if (words1[i] !== words2[i]) {
            return false;
        }
    }

    return true;
}

const profile = (close = false) => {
    let div = document.getElementById('trophyDiv');
    if(close) {
        div.classList.add('shrink');
        div.classList.remove('grow');
    } else {
        div.classList.toggle('shrink');
        div.classList.toggle('grow');
    }
    if(div.classList.contains('grow')) {
        div.style.display = 'flex';
    } else {
        setTimeout(() => {
            div.style.display = 'none';
        },400);
    }
    updateStats();
}

const changePFP = (x, y) => {
    if(document.querySelectorAll('.pfpHolder').length == 0) {
        const grid = document.createElement('div');
        grid.classList.add('pfpHolder');
        body.appendChild(grid);
        grid.style.left = `${x+200}px`;
        grid.style.top = `${y}px`;
        grid.style.opacity = 0;
        setTimeout(() => {
            grid.fadeIn(300);
        });

        for(let i = 0; i < characters.length; i++) {
            const gridPicture = document.createElement('div');
            gridPicture.classList.add('gridPicture');

            const img = document.createElement('img');
            img.src = `Characters/${characters[i]}.png`;
            gridPicture.appendChild(img);
            grid.appendChild(gridPicture);

            img.addEventListener('click', () => {
                shortStorage.info.character = characters[i];
                profilePicture.src = `Characters/${characters[i]}.png`;
                localStorage.info = JSON.stringify(shortStorage.info);
                grid.fadeOut(300);
            });
        }
    } else {
        document.querySelector('.pfpHolder').fadeOut(300);
    }
}

let newQuote = (movie=currentMovie) => {
    if(currentMovie != undefined) {
        if(!newGameIsNeeded && goingBack == undefined) {
            promptForSave(gamemode, movie);
            return;
        }
        goingBack = undefined;
        newGameIsNeeded = false;
        quizQuestion = 0;
        const scoreWasSaved = scoreSaved;
        scoreSaved = false;
        if(gamemode == 'normal') {
            newNormal(movie);
        } else if(gamemode == 'quiz') {
            if(!scoreWasSaved) {
                if(shortStorage.stats[currentMovie].quiz.played != 0) {
                    shortStorage.stats[currentMovie].quiz.averageScore = ((shortStorage.stats[currentMovie].quiz.played-1)*shortStorage.stats[currentMovie].quiz.averageScore + quizCorrect)/shortStorage.stats[currentMovie].quiz.played;
                }
                if(quizCorrect > shortStorage.stats[currentMovie].quiz.recordAccuracy) {
                    shortStorage.stats[currentMovie].quiz.recordAccuracy = quizCorrect;
                }
            }
            newQuiz(movie);
        } else if(gamemode == 'endless') {
            if(!scoreWasSaved) {
                if(shortStorage.stats[currentMovie].endless.played != 0) {
                    shortStorage.stats[currentMovie].endless.averageLength = ((shortStorage.stats[currentMovie].endless.played-1)*shortStorage.stats[currentMovie].endless.averageLength + endlessLength)/shortStorage.stats[currentMovie].endless.played;
                }
                if(endlessLength > shortStorage.stats[currentMovie].endless.recordLength) {
                    shortStorage.stats[currentMovie].endless.recordLength = endlessLength;
                }
            }
            newEndless(movie);
        }
        localStorage.stats = JSON.stringify(shortStorage.stats);
    }
}

let setQuote = () => {
    quote.innerHTML = `"${randomLine}"`;
    let plural = '';
    let words = movies[currentMovie].lines[randomIndex+1].trim().split(/\s+/);
    if(words.length > 1) {
        plural = 's';
    }
    answerTextbox.placeholder = `Next line here (${words.length} word${plural})`;
    answerTextbox.value = '';
    shortStorage.stats.total.played++;
    shortStorage.stats[currentMovie].total.played++;
    if(gamemode == 'normal') {
        shortStorage.stats[currentMovie].normal.played++;
    }
    localStorage.stats = JSON.stringify(shortStorage.stats);
    answerTextbox.focus();
}

let newNormal = (movie = currentMovie) => {
    gamemode = 'normal';
    randomIndex = Math.floor(Math.random()*movies[movie].lines.length);
    randomLine = movies[movie].lines[randomIndex];
    currentMovie = movie;
    setQuote();
}

let newQuiz = (movie = currentMovie) => {
    gamemode = 'quiz';
    quizQuestion = 1;
    quizCorrect = 0;
    randomIndex = Math.floor(Math.random()*movies[movie].lines.length);
    randomLine = movies[movie].lines[randomIndex];
    currentMovie = movie;
    textAbove.innerHTML = 'Question 1/10';
    setQuote();
    shortStorage.stats[currentMovie].quiz.played++;
    localStorage.stats = JSON.stringify(shortStorage.stats);
}

let newEndless = (movie = currentMovie) => {
    gamemode = 'endless';
    endlessLength = 0;
    randomIndex = Math.floor(Math.random()*movies[movie].lines.length);
    randomLine = movies[movie].lines[randomIndex];
    currentMovie = movie;
    textAbove.innerHTML = 'Score: 0';
    setQuote();
    shortStorage.stats[currentMovie].endless.played++;
    localStorage.stats = JSON.stringify(shortStorage.stats);
}

let resetStats = () => {
    shortStorage.stats = {
        total: {
            played: 0,
            won: 0,
        }
    };
    let keys = Object.keys(movies);
    for(let i = 0; i < keys.length; i++) {
        shortStorage.stats[keys[i]] = {
            total: {
                played: 0,
                won: 0
            },
            normal: {
                played: 0,
                won: 0
            },
            quiz: {
                played: 0,
                averageScore: 0,
                recordAccuracy: 0
            },
            endless: {
                played: 0,
                recordLength: 0,
                averageLength: 0
            }
        }
    }
    localStorage.stats = JSON.stringify(shortStorage.stats);
    updateStats();
}

let updateStats = () => {
    let movie = movieStatsDropdown.value;
    let gamemode = gamemodeDropdown.value;
    let keys = Object.keys(shortStorage.stats);
    if(movie == 'All') {
        if(gamemode == 'All') {
            statsDisplays.played.innerHTML = `Games Played: ${shortStorage.stats.total.played}`;
            statsDisplays.won.innerHTML = `Games Won: ${shortStorage.stats.total.won}`;
            statsDisplays.accuracy.innerHTML = `Accuracy: ${(shortStorage.stats.total.won / shortStorage.stats.total.played * 100).toFixed(2)}%`;
        } else if(gamemode == 'Normal') {
            let playedSum = 0;
            let wonSum = 0;
            for(let i = 0; i < keys.length; i++) {
                if(keys[i] != 'total') {
                    playedSum += shortStorage.stats[keys[i]].normal.played;
                    wonSum += shortStorage.stats[keys[i]].normal.won;
                }
            }
            statsDisplays.played.innerHTML = `Games Played: ${playedSum}`;
            statsDisplays.won.innerHTML = `Games Won: ${wonSum}`;
            statsDisplays.accuracy.innerHTML = `Accuracy: ${(wonSum / playedSum * 100).toFixed(2)}%`;
        } else if(gamemode == 'Quiz') {
            let playedSum = 0;
            let averageScoreSum = 0;
            let recordAccuracy = -1;
            let recordAccuracyMovie;
            for(let i = 0; i < keys.length; i++) {
                if(keys[i] != 'total') {
                    playedSum += shortStorage.stats[keys[i]].quiz.played;
                    averageScoreSum += shortStorage.stats[keys[i]].quiz.averageScore * shortStorage.stats[keys[i]].quiz.played;
                    if(shortStorage.stats[keys[i]].quiz.recordAccuracy > recordAccuracy) {
                        recordAccuracy = shortStorage.stats[keys[i]].quiz.recordAccuracy;
                        recordAccuracyMovie = keys[i];
                    } else if(shortStorage.stats[keys[i]].quiz.recordAccuracy == recordAccuracy) {
                        recordAccuracyMovie += `, ${keys[i]}`;
                    }
                }
            }
            statsDisplays.played.innerHTML = `Games Played: ${playedSum}`;
            statsDisplays.won.innerHTML = `Average Score: ${(averageScoreSum/playedSum).toFixed(2)} / 10`;
            statsDisplays.accuracy.innerHTML = `Record Accuracy: ${recordAccuracy} / 10 (${recordAccuracyMovie})`;
        } else if(gamemode == 'Endless') {
            let playedSum = 0;
            let averageLengthSum = 0;
            let recordLength = -1;
            let recordLengthMovie;
            for(let i = 0; i < keys.length; i++) {
                if(keys[i] != 'total') {
                    playedSum += shortStorage.stats[keys[i]].endless.played;
                    averageLengthSum += shortStorage.stats[keys[i]].endless.averageLength * shortStorage.stats[keys[i]].endless.played;
                    if(shortStorage.stats[keys[i]].endless.recordLength > recordLength) {
                        recordLength = shortStorage.stats[keys[i]].endless.recordLength;
                        recordLengthMovie = keys[i];
                    } else if(shortStorage.stats[keys[i]].endless.recordLength == recordLength) {
                        recordLengthMovie += `, ${keys[i]}`;
                    }
                }
            }
            statsDisplays.played.innerHTML = `Games Played: ${playedSum}`;
            statsDisplays.won.innerHTML = `Average Length: ${(averageLengthSum/playedSum).toFixed(2)}`;
            statsDisplays.accuracy.innerHTML = `Record Length: ${recordLength} (${recordLengthMovie})`;
        }
    } else {
        if(gamemode == 'All') {
            statsDisplays.played.innerHTML = `Games Played: ${shortStorage.stats[movie].total.played}`;
            statsDisplays.won.innerHTML = `Games Won: ${shortStorage.stats[movie].total.won}`;
            statsDisplays.accuracy.innerHTML = `Accuracy: ${(shortStorage.stats[movie].total.won / shortStorage.stats[movie].total.played * 100).toFixed(2)}%`;
        } else if(gamemode == 'Normal') {
            statsDisplays.played.innerHTML = `Games Played: ${shortStorage.stats[movie].normal.played}`;
            statsDisplays.won.innerHTML = `Games Won: ${shortStorage.stats[movie].normal.won}`;
            statsDisplays.accuracy.innerHTML = `Accuracy: ${(shortStorage.stats[movie].normal.won / shortStorage.stats[movie].normal.played * 100).toFixed(2)}%`;
        } else if(gamemode == 'Quiz') {
            statsDisplays.played.innerHTML = `Games Played: ${shortStorage.stats[movie].quiz.played}`;
            statsDisplays.won.innerHTML = `Average Score: ${(shortStorage.stats[movie].quiz.averageScore).toFixed(2)} / 10`;
            statsDisplays.accuracy.innerHTML = `Record Accuracy: ${shortStorage.stats[movie].quiz.recordAccuracy} / 10`;
        } else if(gamemode == 'Endless') {
            statsDisplays.played.innerHTML = `Games Played: ${shortStorage.stats[movie].endless.played}`;
            statsDisplays.won.innerHTML = `Average Length: ${(shortStorage.stats[movie].endless.averageLength).toFixed(2)}`;
            statsDisplays.accuracy.innerHTML = `Record Length: ${shortStorage.stats[movie].endless.recordLength}`;
        }
    }
}

let displayQuizResults = () => {
    let resultsHolder = document.getElementById('resultsHolder');
    resultsHolder.classList.toggle('grow');
    resultsHolder.classList.toggle('shrink');
    if(resultsHolder.classList.contains('grow')) {
        confettiExplosion(window.innerWidth/2, window.innerHeight/2, 100, 2500);
        resultsHolder.style.display = 'flex';
        let title = document.querySelector('#resultsHolder > #resultsTitle');
        let newRecord = document.querySelector('#resultsHolder > #newRecord');
        let texts = document.querySelectorAll('#resultsHolder > .resultsText');
        title.innerHTML = 'Quiz Complete!';
        texts[0].innerHTML = `Score: ${quizCorrect} / 10`;
        texts[1].innerHTML = `Accuracy: ${quizCorrect*10}%`;
        texts[2].innerHTML = `Record: ${shortStorage.stats[currentMovie].quiz.recordAccuracy} / 10`;

        if(quizCorrect == shortStorage.stats[currentMovie].quiz.recordAccuracy) {
            newRecord.innerHTML = 'You tied your record!';
            setTimeout(() => {
                confettiExplosion(window.innerWidth/4, window.innerHeight/2, 100, 2500);
                setTimeout(() => {
                    confettiExplosion(window.innerWidth/4*3, window.innerHeight/2, 100, 2500);
                },250);
            },250);
        } else if(quizCorrect > shortStorage.stats[currentMovie].quiz.recordAccuracy) {
            newRecord.innerHTML = 'New Record!';
            texts[2].innerHTML = `Record: ${quizCorrect} / 10`;
            setTimeout(() => {
                confettiExplosion(window.innerWidth/4, window.innerHeight/2, 100, 2500);
                setTimeout(() => {
                    confettiExplosion(window.innerWidth/4*3, window.innerHeight/2, 100, 2500);
                    setTimeout(() => {
                        confettiExplosion(window.innerWidth/2, window.innerHeight/4*3, 300, 2500);
                    },1000);
                },250);
            },250);
        } else {
            newRecord.innerHTML = '';
        }
    } else {
        setTimeout(() => {
            if(goingBack) {
                gamemode = nextGame.gamemode;
                goingBack = false;
                newQuote(nextGame.movie);
            }
            resultsHolder.style.display = 'none';
        },400);
    }
}

let displayEndlessResults = () => {
    let resultsHolder = document.getElementById('resultsHolder');
    resultsHolder.classList.toggle('grow');
    resultsHolder.classList.toggle('shrink');
    if(resultsHolder.classList.contains('grow')) {
        confettiExplosion(window.innerWidth/2, window.innerHeight/2, 100, 2500);
        resultsHolder.style.display = 'flex';
        let title = document.querySelector('#resultsHolder > #resultsTitle');
        let newRecord = document.querySelector('#resultsHolder > #newRecord');
        let texts = document.querySelectorAll('#resultsHolder > .resultsText');
        title.innerHTML = 'Endless Mode Complete!';
        texts[0].innerHTML = `Score: ${endlessLength}`;
        texts[2].innerHTML = `Record: ${shortStorage.stats[currentMovie].endless.recordLength}`;

        if(endlessLength == shortStorage.stats[currentMovie].endless.recordLength) {
            newRecord.innerHTML = 'You tied your record!';
            setTimeout(() => {
                confettiExplosion(window.innerWidth/4, window.innerHeight/2, 100, 2500);
                setTimeout(() => {
                    confettiExplosion(window.innerWidth/4*3, window.innerHeight/2, 100, 2500);
                },250);
            },250);
        } else if(endlessLength > shortStorage.stats[currentMovie].endless.recordLength) {
            newRecord.innerHTML = 'New Record!';
            texts[2].innerHTML = `Record: ${endlessLength}`;
            setTimeout(() => {
                confettiExplosion(window.innerWidth/4, window.innerHeight/2, 100, 2500);
                setTimeout(() => {
                    confettiExplosion(window.innerWidth/4*3, window.innerHeight/2, 100, 2500);
                    setTimeout(() => {
                        confettiExplosion(window.innerWidth/2, window.innerHeight/4*3, 300, 2500);
                    },1000);
                },250);
            },250);
        } else {
            newRecord.innerHTML = '';
        }
    } else {
        setTimeout(() => {
            resultsHolder.style.display = 'none';
        },400);
    }
}

let promptForSave = (mode, movie = currentMovie) => {
    if(movie != undefined) {
        if(!scoreSaved) {
            finishDiv.style.display = 'flex';
            finishDiv.style.opacity = 0;
            setTimeout(() => {
                finishDiv.fadeIn(300);
            });
            document.querySelector('#finishDiv > .yesOrNo > div:nth-child(1)').addEventListener('click', () => {
                finishDiv.fadeOut(300, false);
                gamemode = mode;
                goingBack = false;
                newQuote(movie);
            });
            document.querySelector('#finishDiv > .yesOrNo > div:nth-child(2)').addEventListener('click', () => {
                finishDiv.fadeOut(300, false);
                goingBack = true;
                nextGame = {
                    gamemode: mode,
                    movie: movie
                }
            });
        } else {
            gamemode = mode;
            newQuote(currentMovie);
        }
    }
}