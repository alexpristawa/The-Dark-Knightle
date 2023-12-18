let format = (transcript) => {
    transcript = transcript.replace(/↵|\n|\r\n/g, ' ');
    transcript = transcript.replace(/"|“|”/g, '');
    transcript = getRidOfBrackets(transcript);
    transcript = transcript.split(/[.!?;…]/);
    transcript = getRidOfNames(transcript);
    transcript = getRidOfWhiteSpace(transcript);
    transcript = getRidOfEmptyStrings(transcript);
    return transcript;
}

let getRidOfBrackets = (transcript) => {
    for(let i = 0; i < transcript.length; i++) {
        if(transcript[i] == '[') {
            for(let j = i+1; j < transcript.length; j++) {
                if(transcript[j] == ']') {
                    transcript = transcript.slice(0, i) + transcript.slice(j+1);
                    j = transcript.length;
                    i--;
                }
            }
        }
    }
    return transcript;
}

let getRidOfWhiteSpace = (transcript) => {
    for(let i = 0; i < transcript.length; i++) {
        while([' ', '-'].indexOf(transcript[i][0]) != -1) {
            transcript[i] = transcript[i].slice(1);
        }
    }
    return transcript;
}

let getRidOfEmptyStrings = (transcript) => {
    for(let i = 0; i < transcript.length; i++) {
        if(transcript[i] == '') {
            transcript.splice(i,1);
            i--;
        }
    }
    return transcript;
}

let getRidOfNames = (transcript) => {
    for(let i = 0; i < transcript.length; i++) {
        for(let j = 0; j < transcript[i].length; j++) {
            if(transcript[i][j] == ':' && transcript[i][j+1] == ' ') {
                transcript[i] = transcript[i].slice(j+1);
            }
        }
    }
    return transcript;
}