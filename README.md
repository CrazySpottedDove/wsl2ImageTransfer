# wsl2ImageTransfer README

利用指定截屏保存路径的方法，实现在 wsl2 编辑 .tex 文件时便利地插入图片。

## Features

使用 Ctrl + Alt + P 的快捷键插入图片。首次使用该插件，必须在插件设置中指定你的截屏图片保存路径。

## Requirements

只面向 wsl2 用户。

## Extension Settings

* `wslImageTransfer.screenshotDir`: 你的 windows 主机的截图保存目录，默认为`C:/Users/<YourUsername>/Pictures/Screenshots`
* `wsl2ImageTransfer.targetDir`: 将要黏贴的图片在当前目录中的保存路径，默认为 `figures/`
* `wsl2ImageTransfer.insertContent`: 将会在你的编辑器中插入的内容，默认为`\\begin{figure}[H]\n\\centering\n\\includegraphics[width=0.9\\textwidth]{${filePath}}\n\\caption{}\n\\end{figure}`
* `wsl2ImageTransfer.mvFlag`: 是否将图片剪贴（而非复制）到目标目录，默认为`true`。

## Known Issues

暂无。

## Release Notes

### 1.0.0

原始版本。

