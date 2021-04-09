//================================Initialize data================================
var DATA = {
    sound: [],
    light: []
};

var DATA_VALUES = {
    global: {
        sound: [],
        light: []
    },
    visible: {
        sound: [],
        light: []
    },
    mutations: {
        sound: [],
        light: []
    }
}

var soundLimit = [55, 95];
var lightLimit = [0, 5000];

//================================Load acumulated data================================
window.onload = function() {
    if ('generatedSoundData' in window.localStorage) {
        DATA_VALUES.global.sound = JSON.parse(window.localStorage.getItem('generatedSoundData'));
        DATA_VALUES.mutations.sound = JSON.parse(window.localStorage.getItem('generatedSoundMutations'))
    }
    if ('generatedLightData' in window.localStorage) {
        DATA_VALUES.global.light = JSON.parse(window.localStorage.getItem('generatedLightData'));
        DATA_VALUES.mutations.light = JSON.parse(window.localStorage.getItem('generatedLightMutations'))
    }

    for (key in DATA_VALUES.mutations) {
        DATA_VALUES.mutations[key].forEach(mutation => updateMutationsList(key, mutation));
    }
}

//================================Remove acumulated data================================
document.getElementById('clearGlobalSoundData').addEventListener('click', () => clearGlobalData('Sound'))
document.getElementById('clearGlobalLightData').addEventListener('click', () => clearGlobalData('Light'))

function clearGlobalData(graph) {
    let item = 'generated' + graph + 'Data';
    if (item in window.localStorage) {
        window.localStorage.removeItem(item);
        window.localStorage.removeItem(`generated${graph}Mutations`);

        graph = graph.toLowerCase()
        DATA_VALUES.global[graph] = DATA_VALUES.visible[graph];
        DATA_VALUES.mutations[graph] = [];

        window[`${graph}Graph`].redraw();

        clearMutationsTable(graph);
    }
}

function clearMutationsTable(graph) {
    let table = document.querySelector(`#${graph}GraphMutationsList tbody`);
    table.innerHTML = '';

    let row = document.createElement('tr');
    let dateTh = document.createElement('th');
    let valueTh = document.createElement('th');

    dateTh.innerHTML = 'Date:';
    valueTh.innerHTML = 'Value:';
    row.appendChild(dateTh);
    row.appendChild(valueTh);

    table.appendChild(row);

}

//================================Get new sound data================================
function getNewSoundData() {
    //sound 55 to 95 dBA
    let time = new Date;
    let timeStamp = `${time.getUTCDate()}.${time.getUTCMonth()+1}. ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;

    let rand = (Math.random() * (soundLimit[1] - soundLimit[0]) + soundLimit[0]).toFixed(2);

    let mutate = Math.random() * 100;
    if (mutate > 85) { //15% chance to mutate value
        rand = parseFloat(rand);
        (rand - 75 > 0) ? rand += 50: rand -= 50;
        rand = parseFloat(rand.toFixed(2));
        //Save the mutated value for later inspection
        DATA_VALUES.mutations.sound.push([timeStamp, parseFloat(rand)]);

        let mutation = DATA_VALUES.mutations.sound[DATA_VALUES.mutations.sound.length - 1];
        updateMutationsList('sound', mutation);
    } else {
        //Save data if there was no mutation
        DATA_VALUES.global.sound.push(parseFloat(rand));
        DATA_VALUES.visible.sound.push(parseFloat(rand));

        let dotDifference = DATA_VALUES.visible.sound.length - graphSettings[0].dotNumber;
        if (dotDifference > 0) {
            DATA_VALUES.visible.sound = DATA_VALUES.visible.sound.slice(dotDifference);
        }

        calculateCharacteristicValues(DATA_VALUES.global.sound, DATA_VALUES.visible.sound, 'sound');

    }

    DATA.sound.push([timeStamp, parseFloat(rand)]);
    if (DATA.sound.length > 25) {
        DATA.sound.shift();
        DATA_VALUES.visible.sound.shift();
    }


    window.localStorage.setItem('generatedSoundData', JSON.stringify(DATA_VALUES.global.sound));
    window.localStorage.setItem('generatedSoundMutations', JSON.stringify(DATA_VALUES.mutations.sound));
}

//================================Get new light data================================
function getNewLightData() {
    //sound 55 to 95 dBA
    let time = new Date;
    let timeStamp = `${time.getUTCDate()}.${time.getUTCMonth()+1}. ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;

    //lignt 0 to 5000 lux
    let rand = (Math.random() * (lightLimit[1] - lightLimit[0]) + lightLimit[0]).toFixed(2);

    //Simulate value outside of sensor range
    let mutate = Math.random() * 100;
    if (mutate > 85) { //85% chance to mutate value
        rand = parseFloat(rand);
        (rand - 2500 > 0) ? rand += 3000: rand -= 3000;
        rand = parseFloat(rand.toFixed(2));
        //Save the mutated value for later inspection
        DATA_VALUES.mutations.light.push([timeStamp, parseFloat(rand)]);

        let mutation = DATA_VALUES.mutations.light[DATA_VALUES.mutations.light.length - 1];
        updateMutationsList('light', mutation);
    } else {
        //Save data if there was no mutation
        DATA_VALUES.global.light.push(parseFloat(rand));
        DATA_VALUES.visible.light.push(parseFloat(rand));

        let dotDifference = DATA_VALUES.visible.light.length - graphSettings[1].dotNumber;
        if (dotDifference > 0) {
            DATA_VALUES.visible.light = DATA_VALUES.visible.light.slice(dotDifference);
        }

        calculateCharacteristicValues(DATA_VALUES.global.light, DATA_VALUES.visible.light, 'light');
    }

    DATA.light.push([timeStamp, parseFloat(rand)]);
    if (DATA.light.length > 25) {
        DATA.light.shift();
    }

    window.localStorage.setItem('generatedLightData', JSON.stringify(DATA_VALUES.global.light));
    window.localStorage.setItem('generatedLightMutations', JSON.stringify(DATA_VALUES.mutations.light));
}