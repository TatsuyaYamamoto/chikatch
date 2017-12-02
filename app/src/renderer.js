const Vue = require('vue/dist/vue');
const {Twelite, ChangeOutputCommand} = require('twelite-sdk');
const {version} = require('../../package.json');

const {
    node,
    chrome,
    electron
} = process.versions;

let twelite = null;

const COLOR_MIN_VALUE = 0;
const COLOR_MAX_VALUE = 100;

function getRandomColor(min, max) {
    return Math.floor(Math.random() * (max + 1 - min)) + min;
}

const vm = new Vue({
    el: '#app',
    data: {
        env: {
            os: process.platform,
            version: {
                chikatch: version,
                node,
                chrome,
                electron,
            }
        },
        ports: [],
        selectedComName: null,
        color: {
            red: 0,
            green: 0,
            blue: 0,
        },
        loopTimeoutId: null,
    },
    computed: {
        pwm: function () {
            const {red, green, blue} = this.color;

            const r = (0 <= red && red <= 100) ? (100 - red) : -1;
            const g = (0 <= green && green <= 100) ? (100 - green) : -1;
            const b = (0 <= blue && blue <= 100) ? (100 - blue) : -1;
            return [r, g, -1, b];
        }
    },
    methods: {
        loadPorts: function () {
            Twelite.serialPorts()
                .then((ports) => {
                    console.log(`Load serial ports.  ${ports.length > 0 ?
                        `Find ${ports.length} twelite devices.` :
                        'Not found any twelite device.'}`);

                    this.ports = ports;
                });
        },
        connect: function (comName) {
            if (this.selectedComName) {
                this.disconnect();
            }

            this.selectedComName = comName;

            twelite = new Twelite(comName);
            twelite.on('open', this.onTweliteOpen);
            twelite.on('error', this.onTweliteError);
            twelite.on('close', this.onTweliteClose);
            twelite.open();
        },
        disconnect: function () {
            this.turnOff();
            twelite.close();
            twelite = null;
            this.selectedComName = null;
        },
        turnOn: function (r, g, b) {
            if (!twelite) return;

            this.turnOffRandomLoop();

            this.color.red = r;
            this.color.green = g;
            this.color.blue = b;

            this.writeCommand();
        },
        turnOff: function () {
            if (!twelite) return;

            this.turnOffRandomLoop();

            this.color.red = 0;
            this.color.green = 0;
            this.color.blue = 0;

            this.writeCommand();
        },
        fadeOut: function () {
            this.turnOffRandomLoop();

            const redDecreaseRatio = this.color.red / 10;
            const greenDecreaseRatio = this.color.green / 10;
            const blueDecreaseRatio = this.color.blue / 10;

            const decrease = () => {
                this.color.red -= redDecreaseRatio;
                this.color.green -= greenDecreaseRatio;
                this.color.blue -= blueDecreaseRatio;

                this.writeCommand();

                const {red, green, blue} = this.color;
                if (red <= 0 && green <= 0 && blue <= 0) {
                    this.turnOff();
                } else {
                    setTimeout(() => decrease(), 100);
                }
            };

            decrease();
        },
        turnOnRandomLoop: function (interval = 1) {

            const light = () => {
                this.color.red = getRandomColor(COLOR_MIN_VALUE, COLOR_MAX_VALUE);
                this.color.green = getRandomColor(COLOR_MIN_VALUE, COLOR_MAX_VALUE);
                this.color.blue = getRandomColor(COLOR_MIN_VALUE, COLOR_MAX_VALUE);

                this.writeCommand();

                this.loopTimeoutId = setTimeout(() => light(), ((60 / 168) * 4) * 1000 * interval);
            };

            light();
        },
        turnOffRandomLoop: function () {
            if (!this.loopTimeoutId) {
                return;
            }

            clearTimeout(this.loopTimeoutId);
            this.loopTimeoutId = null;
        },
        writeCommand: function () {
            const command = new ChangeOutputCommand();
            command.analog = this.pwm;

            twelite && twelite.write(command);
        },
        onTweliteOpen: function (err) {
            if (err) {
                console.error(err);
                alert('Could not find Twelite device. Please check and restart app.');
                return;
            }
            console.log(`Connect serial port. name: ${this.selectedComName}`);
        },
        onTweliteError: function (err) {
            console.log('Error: ', err.message);
        },
        onTweliteClose: function () {
            console.log(`Disconnect serial port.`);
        }
    },
    created: function () {
        this.loadPorts();
    },
});
