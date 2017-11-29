const Vue = require('vue/dist/vue');
const {Twelite, ChangeOutputCommand} = require('twelite-sdk');
const {version} = require('./package.json');

const {
    node,
    chrome,
    electron
} = process.versions;

let twelite = null;

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

            this.color.red = r;
            this.color.green = g;
            this.color.blue = b;

            const brightCommand = new ChangeOutputCommand();
            brightCommand.analog = this.pwm;
            twelite.write(brightCommand);
        },
        turnOff: function () {
            if (!twelite) return;

            this.color.red = 0;
            this.color.green = 0;
            this.color.blue = 0;

            const darkCommand = new ChangeOutputCommand();
            darkCommand.analog = this.pwm;
            twelite.write(darkCommand)
        },
        fadeOut: function () {
            const redDecreaseRatio = this.color.red / 10;
            const greenDecreaseRatio = this.color.green / 10;
            const blueDecreaseRatio = this.color.blue / 10;

            const decrease = () => {
                this.color.red -= redDecreaseRatio;
                this.color.green -= greenDecreaseRatio;
                this.color.blue -= blueDecreaseRatio;

                const fadeOutCommand = new ChangeOutputCommand();
                fadeOutCommand.analog = this.pwm;
                twelite.write(fadeOutCommand);

                const {red, green, blue} = this.color;
                if (red <= 0 && green <= 0 && blue <= 0) {
                    this.turnOff();
                } else {
                    setTimeout(() => decrease(), 100);
                }
            };

            decrease();
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
