//================================Initialize data================================ 
var DEFAULT_VALUES = {
    frequency: 2000,
    dotNumber: 15,
    placeholder: 5500
}

var graphSettings = [
    soundGraphSettings = { frequency: DEFAULT_VALUES.frequency, dotNumber: DEFAULT_VALUES.dotNumber, placeholder: DEFAULT_VALUES.placeholder, description: 'sound' },
    lightGraphSettings = { frequency: DEFAULT_VALUES.frequency, dotNumber: DEFAULT_VALUES.dotNumber, placeholder: DEFAULT_VALUES.placeholder, description: 'light' }
]

//Bind event handlers to all charts
document.getElementById('soundGraph').onclick = graphEnableFullscreen;
document.getElementById('lightGraph').onclick = graphEnableFullscreen;

//Bind event handlers to all input elements
var sliderElements = document.getElementsByTagName('input');
for (key in sliderElements) {
    sliderElements[key].oninput = sliderChange;
}

//Bind event handlers to all '<' '>' elements
var sliderArrowElements = document.querySelectorAll('.graphSettings span');
for (key in sliderArrowElements) {
    sliderArrowElements[key].onclick = sliderControlClick;
}

//Bind event handlers to reset buttons
var buttons = document.querySelectorAll('button');
for (key in buttons) {
    buttons[key].onclick = settingsReset;
}

var soundGraphExpandedFlag = false;
var lightGraphExpandedFlag = false;


//================================Check local storage for saved chart settings================================
checklocalStorage();

//Overwrite existing settings with saved settings
function checklocalStorage() {
    let graphs = [
        'soundGraphSettings',
        'lightGraphSettings'
    ];
    for (key in graphs) {
        if (graphs[key] in window.localStorage) {
            let storedData = JSON.parse(window.localStorage.getItem(graphs[key]));
            graphSettings[key].frequency = storedData.frequency;
            graphSettings[key].dotNumber = storedData.dotNumber;
            graphSettings[key].placeholder = storedData.placeholder;
        } else {
            graphSettings[key].frequency = DEFAULT_VALUES.frequency;
            graphSettings[key].dotNumber = DEFAULT_VALUES.dotNumber;
            graphSettings[key].placeholder = DEFAULT_VALUES.placeholder;
        }
    }
}

//================================Apply settings to sliders and graphs on reload================================
modifySliderValues()

function modifySliderValues() {
    for (key in graphSettings) {
        let graph = graphSettings[key].description + 'Graph_';
        let elements = ['frequency', 'frequencyOutput', 'dotNumber', 'dotNumberOutput', 'placeholder', 'placeholderOutput'];
        elements.forEach(element => {
            let property = element.replace('Output', '');
            document.getElementById(graph + element).value = graphSettings[key][property];
        });
    }
};


//================================Dynamically change chart settings================================

//Change settings on slider change
function sliderChange() {
    let element = document.getElementById(this.id);
    let elementOutput = this.id + 'Output';
    document.getElementById(elementOutput).value = element.value;
}

//Change settings on '<' '>' click
function sliderControlClick() {
    if (this.previousElementSibling) {
        let slider = this.previousElementSibling;
        slider.value = parseInt(slider.value) + parseInt(slider.step);
        let obj = { id: slider.id, change: sliderChange };
        obj.change();
    } else {
        let slider = this.nextElementSibling;
        slider.value = parseInt(slider.value) - parseInt(slider.step);
        let obj = { id: slider.id, change: sliderChange };
        obj.change();
    }
}

//Reset settings to default
function settingsReset() {
    let graphSettings = this.parentNode.id;
    window.localStorage.removeItem(graphSettings);
    checklocalStorage();
    modifySliderValues();
}


//================================Save modified settings for chart================================
function saveGraphSettings(id) {
    let graph = id + 'Graph';
    let settings = {
        frequency: document.getElementById(graph + '_frequency').value,
        dotNumber: document.getElementById(graph + '_dotNumber').value,
        placeholder: document.getElementById(graph + '_placeholder').value
    }

    //change data acquisition frequency
    clearTimeout(window[graph + 'DataTimeout']);

    //apply changes to graph settings
    if (id == 'sound') {
        for (key in settings) {
            graphSettings[0][key] = settings[key];
        }
        soundGraphGetData(graphSettings[0].frequency)
    } else {
        for (key in settings) {
            graphSettings[1][key] = settings[key];
        }
        lightGraphGetData(graphSettings[1].frequency)
    }


    //save settings in local storage
    window.localStorage.setItem(graph + 'Settings', JSON.stringify(settings));

}

//display notification on settings save
async function toggleSettingsNotification(element) {
    element.classList.toggle('notificationShow');
    setTimeout(() => {
        element.classList.toggle('notificationShow');
    }, 1500);
}


//================================Handle event listeners for chart extend================================
document.getElementById('expandSoundGraph').onclick = () => toggleExtendedClass('soundGraphWrapper');
document.getElementById('expandLightGraph').onclick = () => toggleExtendedClass('lightGraphWrapper');

//Extend chart block to view settings
function toggleExtendedClass(element) {
    document.getElementById(element).classList.toggle('graphEl-Expanded')
    if (element.includes('sound')) {
        soundGraphExpandedFlag = !soundGraphExpandedFlag;
        if (!soundGraphExpandedFlag) {
            //save settings when closing the settings tab
            saveGraphSettings('sound');

            //toggle notification
            let notification = document.getElementById('soundGraphSettingsNotification');
            toggleSettingsNotification(notification);
        }
    }

    if (element.includes('light')) {
        lightGraphExpandedFlag = !lightGraphExpandedFlag;
        if (!lightGraphExpandedFlag) {
            //save settings when closing the settings tab
            saveGraphSettings('light');

            //toggle notification
            let notification = document.getElementById('lightGraphSettingsNotification');
            toggleSettingsNotification(notification);
        }
    }
}

//================================Handle chart fullscreen view================================

//Display chart in fullscreen
function graphEnableFullscreen() {
    //Clone chart without content
    var graphClone = this.cloneNode(false);
    graphClone.id = this.id + 'Clone';

    let element = document.getElementById(this.id);
    let cloneDimensions = { width: element.clientWidth, height: element.clientHeight };

    this.classList.add('graphFullscreen');
    element.onclick = graphDisableFullscreen;

    this.parentNode.insertBefore(graphClone, this);

    let clone = document.getElementById(graphClone.id);

    clone.width = cloneDimensions.width;
    clone.height = cloneDimensions.height;
    clone.style.width = clone.width + 'px';
    clone.style.height = clone.height + 'px';
    element.style.maxHeight = 'none';

    document.getElementById('shader').classList.toggle('shaderToggle');

    window[this.id].reflow();
}

//Close fullscreen view
function graphDisableFullscreen() {
    this.classList.remove('graphFullscreen');

    cloneElementID = this.id + 'Clone';
    let clone = document.getElementById(cloneElementID);
    let element = document.getElementById(this.id);

    element.style.maxHeight = clone.height + 'px';

    window[this.id].setSize(element.width, element.height, false);
    soundGraph.reflow();
    clone.remove();

    document.getElementById('shader').classList.toggle('shaderToggle');

    element.onclick = graphEnableFullscreen;
    window[this.id].reflow();

}

//================================Generate charts================================
var soundData;
var lightData;

var soundGraphElement = document.getElementById('soundGraph');
var lightGraphElement = document.getElementById('lightGraph');

soundGraph = Highcharts.chart(soundGraphElement, {
    title: {
        text: 'Sound sensor data'
    },

    xAxis: {
        type: 'category'
    },

    yAxis: {
        title: {
            text: 'Sound amplitude [dBA]'
        }
    },

    legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle'
    },

    series: [{
        showInLegend: false,
        data: [],
        zoneAxis: 'y',
        zones: [{
            value: 55,
            color: 'red'
        }, {
            value: 95,
            color: 'rgb(124, 181, 236)'
        }, {
            color: 'red'
        }]
    }],

    responsive: {
        rules: [{
            condition: {},
            chartOptions: {
                legend: {
                    layout: 'horizontal',
                    align: 'center',
                    verticalAlign: 'bottom'
                }
            }
        }]
    },
});


var lightGraph = Highcharts.chart(lightGraphElement, {

    title: {
        text: 'Light sensor data'
    },

    xAxis: {
        type: 'category'
    },

    yAxis: {
        title: {
            text: 'Light intensity [lux]'
        }
    },

    legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle'
    },

    plotOptions: {
        series: {
            label: {
                connectorAllowed: false
            },
            pointStart: 2010
        }
    },

    series: [{
        showInLegend: false,
        data: [],
        zoneAxis: 'y',
        zones: [{
            value: 0,
            color: 'red'
        }, {
            value: 5000,
            color: 'rgb(124, 181, 236)'
        }, {
            color: 'red'
        }]
    }, ],

    responsive: {
        rules: [{
            condition: {},
            chartOptions: {
                legend: {
                    layout: 'horizontal',
                    align: 'center',
                    verticalAlign: 'bottom'
                }
            }
        }]
    }

});



//================================Dynamically get chart data================================
var soundGraphDataTimeout;
var lightGraphDataTimeout;

soundGraphGetData(graphSettings[0].frequency);
lightGraphGetData(graphSettings[1].frequency);

async function soundGraphGetData(timeout) {
    soundGraphDataTimeout = setTimeout(() => {
        getNewSoundData();
        soundData = DATA.sound;

        //Crop data to fit number of dots set by settings
        soundData.splice(0, soundData.length - graphSettings[0].dotNumber);
        soundGraph.series[0].setData(soundData);

        soundGraphGetData(graphSettings[0].frequency);
    }, timeout);
};

async function lightGraphGetData(timeout) {
    lightGraphDataTimeout = setTimeout(() => {
        getNewLightData();
        lightData = DATA.light;

        //Crop data to fit number of dots set by settings
        lightData.splice(0, lightData.length - graphSettings[1].dotNumber);
        lightGraph.series[0].setData(lightData);

        lightGraphGetData(graphSettings[1].frequency);
    }, timeout);
};