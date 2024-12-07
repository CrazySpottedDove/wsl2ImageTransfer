const { execSync } = require('child_process');
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const os = require('os');
const platform = os.platform();
let config;
let insertContent;
let mvFlag;
let screenshotDir;

/**
 * 从注册表中获取 Windows 截图保存路径
 */
function getWindowsScreenshotDir() {
    try {
        vscode.window.showInformationMessage('发现您还没有配置截图保存路径，正在尝试从注册表中获取\nε=( o｀ω′)ノ');
        let output = '';
        switch (platform) {
            case 'win32':
                output = execSync('reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders" /v "{B7BEDE81-DF94-4682-A7D8-57A52620B86F}"', { encoding: 'utf-8' });
                break;
            case 'linux':
                output = execSync('wsl.exe cmd.exe /c reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders" /v "{B7BEDE81-DF94-4682-A7D8-57A52620B86F}"', { encoding: 'utf-8' });
                break;
            default:
                break;
        }
        const match = output.match(/\{B7BEDE81-DF94-4682-A7D8-57A52620B86F}\s+REG_EXPAND_SZ\s+(.*)/);
        let screenshotDir = '';
        if (match && match[1]) {
            screenshotDir = match[1].trim();
            vscode.window.showInformationMessage(`找到您的 Windows 截图保存路径: ${screenshotDir}，已更新到配置文件\no(*￣▽￣*)ブ`);
            vscode.workspace.getConfiguration().update('wsl2ImageTransfer.screenshotDir', screenshotDir, vscode.ConfigurationTarget.Global);
            return screenshotDir;
        }
        else {
            vscode.window.showErrorMessage('未能找到您的 Windows 截图保存路径\n/(ㄒoㄒ)/~~');
        }
    } catch (err) {
        console.error('从注册表中获取截图保存路径失败\n/(ㄒoㄒ)/~~:', err);
        vscode.window.showErrorMessage('从注册表中获取截图保存路径失败');
    }
}

/**
 * 加载配置
*/
function loadConfig() {
    config = vscode.workspace.getConfiguration('wsl2ImageTransfer');
    insertContent = config.get('insertContent');
    mvFlag = config.get('mvFlag');
    screenshotDir = config.get('screenshotDir');
    if(!screenshotDir) {
        screenshotDir = getWindowsScreenshotDir();
    }
    switch (platform) {
        case 'win32':
            // 处理 screenshotDir，确保它是一个 Windows 可以访问的路径
            screenshotDir = screenshotDir.replace(/\/mnt\/([a-z])\//, (match, p1) => `${p1.toUpperCase()}:\\`).replace(/\//g, '\\');
            break;
        case 'linux':
            // 处理 screenshotDir，确保它是一个 WSL2 可以访问的路径
            screenshotDir = screenshotDir.replace(/^([A-Za-z]):/, (match, p1) => {
                return `/mnt/${p1.toLowerCase()}`;
            }).replace(/\\/g, '/');
            break;
        default:
            break;
    }
}

loadConfig();


function activate(context) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('没有活动的编辑器.');
        return;
    }
    const document = editor.document;
    const currentFileDir = path.dirname(document.uri.fsPath);
    let targetDir = path.join(currentFileDir, config.get('targetDir'));
    let relativeTargetDir = config.get('targetDir');
    // 确保 targetDir 以斜杠结尾
    if (!targetDir.endsWith('/')) {
        targetDir += '/';
    }
    if (!relativeTargetDir.endsWith('/')) {
        relativeTargetDir += '/';
    }

    const disposable = vscode.commands.registerCommand('wsl2ImageTransfer.transferImage', async function () {
        // 获取 screenshotDir 中创建时间最迟的图片
        const files = fs.readdirSync(screenshotDir);
        let latestFile = null;
        let latestTime = 0;

        files.forEach(file => {
            const filePath = path.join(screenshotDir, file);
            const stats = fs.statSync(filePath);
            if (stats.isFile() && stats.mtimeMs > latestTime) {
                latestTime = stats.mtimeMs;
                latestFile = file;
            }
        });

        if (!latestFile) {
            vscode.window.showErrorMessage('没有找到最新的截图文件\n(ˉ▽ˉ；)....');
            return;
        }

        const sourcePath = path.join(screenshotDir, latestFile);
        const destinationPath = path.join(targetDir, latestFile);

        try {
            // 确保目标目录存在
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            if (mvFlag) {
                if (os.platform() === 'win32') {
                    // Windows 环境中使用 fs.renameSync 进行移动
                    execSync(`move "${sourcePath}" "${destinationPath}"`);
                } else {
                    // 非 Windows 环境中使用 mv 命令
                    execSync(`mv "${sourcePath}" "${destinationPath}"`);
                }
            } else {
                if (os.platform() === 'win32') {
                    // Windows 环境中使用 fs.copyFileSync 进行复制
                    execSync(`copy "${sourcePath}" "${destinationPath}"`);
                } else {
                    // 非 Windows 环境中使用 cp 命令
                    execSync(`cp "${sourcePath}" "${destinationPath}"`);
                }
            }

            if (editor) {
                const contentToInsert = insertContent.replace('${filePath}', './' + relativeTargetDir + latestFile);
                const snippet = new vscode.SnippetString(contentToInsert);
                editor.insertSnippet(snippet);
            }

        } catch (err) {
            vscode.window.showErrorMessage(`复制或剪切图像失败\n/(ㄒoㄒ)/~~: ${err.message}`);
        }
    });

    context.subscriptions.push(disposable);
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
};