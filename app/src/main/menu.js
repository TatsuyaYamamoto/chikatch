const {app, Menu} = require('electron');

const {build} = require('../../../package.json');

const templateMenu = [
    {
        label: build.productName,
        submenu: [
            {
                label: build.productName,
            },
            {
                type: 'separator',
            },
            {
                label: 'Quit',
                accelerator: 'Command+Q',
                click: function () {
                    app.quit();
                }
            },
        ]
    },
    {
        label: 'View',
        submenu: [
            {
                label: 'Reload',
                accelerator: 'CmdOrCtrl+R',
                click(item, focusedWindow) {
                    if (focusedWindow) focusedWindow.reload()
                },
            },
            {
                type: 'separator',
            },
            {
                role: 'togglefullscreen',
            }
        ]
    }
];

module.exports = Menu.buildFromTemplate(templateMenu);
