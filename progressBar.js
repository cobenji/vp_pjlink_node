const cliProgress = require('cli-progress');

const progressBar = new cliProgress.MultiBar({
    format: 'Progression {bar} | {percentage}% | {value}/{total} VPs | Durée: {duration}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
});


module.exports = progressBar