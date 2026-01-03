## VSCode-Extension-Steganographic-Loader

[BleepingComputer](https://www.bleepingcomputer.com/news/security/malicious-vscode-marketplace-extensions-hid-trojan-in-fake-png-file/ "BleepingComputer")报道的案例，在此基础上进行了优化。

沿用了隐写术隐藏，借鉴了用PNG文件藏匿恶Payload来绕过 VS Code Marketplace的基础静态扫描以及传统的基于特征码的磁盘扫描。

**v1.0**:本地复现。所有攻击逻辑、Payload 触发及文件篡改均在本地环境完成，No Outbound Traffic。

V1.0：

   * 通过PNG图片隐写术藏匿攻击代码。
   * 在VS Code环境中通过特定命令稳定触发。
   * 跨执行上下文，准确找到目标工作区。
   * 对本地文件系统中的Terraform配置文件进行静默修改。

均在本地完成不涉及网络通信。

**计划版本2.0**引入C2和数据外泄以及新功能。

ToDoList
- 远程隐写下发&供应链伪装
- 基于环境密钥的多态混淆
- C2通信
- 针对DevOps链路的State文件劫持

## 攻击链

1. 武器化

利用 stitch_payload.js 将 payload.js 中的攻击逻辑进行混淆处理，并将其注入到 banner.png 的不常用元数据或像素通道中。

2. 植入与激活
目标安装扩展后，插件处于静默状态。表面上仅注册了一个合法的占位命令，不表现出任何恶意行为。

3. 触发
在VS Code 命令面板激活攻击链。

4. 上下文感知

extension.js 被触发后，利用 VS Code 内部 API获取当前项目的真实物理路径，并建立内部通信上下文。

5. 内存执行
extension.js 调用内置的 detonatePayload 函数，直接从磁盘读取 PNG 文件，在内存中完成解密、反混淆并动态编译执行 Payload，整个过程不产生临时磁盘文件。

6. 目标操作
Payload 以当前工作区为根目录，递归扫描 .tf 文件，通过正则匹配定位 aws_security_group 等资源，静默注入恶意的 ingress 规则。

## 环境复现

测试环境见IaC-Test-Env。

准备Payload，将payload.js嵌入到banner.png中：

    node stitch_payload.js

在终端中运行以下命令，启动一个新的 VS Code 实例并加载本插件，同时打开测试工作区：

    code --extensionDevelopmentPath="." "./IaC-Test-Env"
	
在打开的 VS Code窗口中按下Ctrl+Shift+P，执行Run Demo Extension。

#### 验证结果
弹出记事本，IaC-Test-Env/main.tf的aws_security_group资源中已被静默注入了一条新的ingress规则。
