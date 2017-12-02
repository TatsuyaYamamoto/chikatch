const {app, Menu} = require('electron');

const {APP_NAME} = require('../constants.js');

const templateMenu = [
    {
        label: APP_NAME,
        submenu: [
            {
                label: APP_NAME,
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
