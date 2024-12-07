# wsl2ImageTransfer README

利用指定截屏保存路径的方法，实现在 wsl2 编辑 .tex 文件时便利地插入图片。

当然，windows 系统中，该插件依旧可以工作。
## Build

```bash
npm install -g vsce
vsce package
```

## Features

使用 windows 自带的截图工具截图，然后使用 Ctrl + Alt + P 的快捷键插入图片。首次使用该插件时，插件会尝试搜索你的 windows 注册表，以找到截屏图片的保存路径。如果搜索失败，可以必须自行指定。

## Requirements

只面向 windows/wsl2 用户。

## Extension Settings

* `wslImageTransfer.screenshotDir`: 你的 windows 主机的截图保存目录(它默认为`C:/Users/<YourUsername>/Pictures/Screenshots`)
* `wsl2ImageTransfer.targetDir`: 将要黏贴的图片在当前目录中的保存路径，默认为 `figures/`
* `wsl2ImageTransfer.insertContent`: 将会在你的编辑器中插入的内容，默认为`\\begin{figure}[H]\n\\centering\n\\includegraphics[width=0.9\\textwidth]{${filePath}}\n\\caption{}\n\\end{figure}`
* `wsl2ImageTransfer.mvFlag`: 是否将图片剪贴（而非复制）到目标目录，默认为`true`。

## Known Issues

暂无。

## Release Notes

### 1.0.0

原始版本。

### 1.0.1

添加了对 windows 系统中类似功能的支持。改用了更小的 icon。

### 1.0.2-4

修改了 icon

### 1.0.5

添加了自动搜索截屏保存路径的功能，不需要用户自行配置。

添加了开源证书。