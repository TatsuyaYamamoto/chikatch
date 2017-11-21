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
        selectedComName: null
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

            const brightCommand = new ChangeOutputCommand();
            brightCommand.analog = [r, g, -1, b];
            twelite.write(brightCommand);
        },
        turnOff: function () {
            if (!twelite) return;

            const darkCommand = new ChangeOutputCommand();
            darkCommand.analog = [100, 100, -1, 100];
            twelite.write(darkCommand)
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
