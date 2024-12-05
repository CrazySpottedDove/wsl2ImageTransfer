const { execSync } = require('child_process');
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const os = require('os');
function activate(context) {
    const config = vscode.workspace.getConfiguration('wsl2ImageTransfer');
    let screenshotDir = config.get('screenshotDir');
    const insertContent = config.get('insertContent');
    const mvFlag = config.get('mvFlag');

    // 获取当前打开文件的目录
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
    const platform = os.platform();
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

    const disposable = vscode.commands.registerCommand('wsl2ImageTransfer.transferImage', function () {
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
            vscode.window.showErrorMessage('没有找到最新的截图文件.');
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
                    fs.renameSync(sourcePath, destinationPath);
                } else {
                    // 非 Windows 环境中使用 mv 命令
                    execSync(`mv "${sourcePath}" "${destinationPath}"`);
                }
            } else {
                if (os.platform() === 'win32') {
                    // Windows 环境中使用 fs.copyFileSync 进行复制
                    fs.copyFileSync(sourcePath, destinationPath);
                } else {
                    // 非 Windows 环境中使用 cp 命令
                    execSync(`cp "${sourcePath}" "${destinationPath}"`);
                }
            }

            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const contentToInsert = insertContent.replace('${filePath}', './' + relativeTargetDir + latestFile);
                const snippet = new vscode.SnippetString(contentToInsert);
                editor.insertSnippet(snippet);
            }

        } catch (err) {
            vscode.window.showErrorMessage(`复制或剪切图像失败: ${err.message}`);
        }
    });

    context.subscriptions.push(disposable);
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
};