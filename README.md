# Magic Christmas Tree 🎄✨

一个基于 WebGL (Three.js) 和计算机视觉 (MediaPipe) 的交互式 3D 圣诞树体验。


## ✨ 特性 (Features)

* **沉浸式 3D 视觉**: 使用 Three.js 构建的粒子系统，包含金球、银块、红蓝宝石和辉光效果 (Bloom)。
* **AI 手势识别**: 集成 Google MediaPipe，无需任何穿戴设备，通过摄像头即可控制。
* **物理交互**:
    * ✊ **握拳 (Fist)**: 将星云粒子聚合成一棵旋转的圣诞树。
    * 🖐 **张手 (Open Palm)**: 粒子炸开成宇宙星云状态。
    * 👋 **挥动 (Wave)**: 在星云状态下，像拨动地球仪一样旋转视角（带有物理惯性）。
    * **数字选图**: 做出 1–9 的数字手势，保持半秒后直接放大本页对应照片；换数字切换照片，握拳返回圣诞树。
    * **翻页**: 👍 保持约 0.7 秒下一页，👎 上一页，每页 8 张。
* **回忆画廊**: 支持上传本地照片，照片会自动挂载在树上或漂浮在星云中。

## 🚀 快速开始 (How to Run)

### 方法 1: fork这个项目,顺手点颗✨增加开源动力（推荐）

开启 Pages: 进入仓库 Settings -> 左侧 Pages -> 在 Branch 处选择 main (或 master) -> 点击 Save。
访问: 等待几分钟，访问 https://你的用户名.github.io/仓库名/。

<img width="2402" height="1350" alt="image" src="https://github.com/user-attachments/assets/ccac4efd-803f-4c47-8e67-9b4e0ed3a2ed" />
<img width="2864" height="1536" alt="image" src="https://github.com/user-attachments/assets/ed5de940-02b5-45c7-99b7-5af57e63c617" />

方法 2: 直接本地双击html文件打开

## 数字手势照片展示

照片按文件选择顺序对应手势，每页 8 张。展示时隐藏说明、文件名列表及照片上的页码和编号，只展示照片。

1：食指；2：食指、中指；3：食指、中指、无名指；4：除拇指外的四指；5：五指张开；6：拇指和小指；7：拇指、食指、中指伸出或聚拢；8：拇指和食指呈 L；9：食指弯钩，其余手指收起。保持同一个数字约 500ms 后放大对应照片，无须对准照片或另做捏合确认。照片打开后保持展示，手离开摄像头也不会关闭。握拳保持半秒返回圣诞树。五指张开仅负责散开并退出照片展示；数字 1–4 对应本页第 1–4 张，数字 6、7、8、9 对应本页第 5、6、7、8 张。

👍 下一页，👎 上一页，保持约 650ms。持续保持只翻一页；放下手至少 250ms 后再举起可继续翻页，也可先做数字手势再翻页。首页和末页不循环，末页不存在的编号会提示而不打开其他照片。手势切换和识别中断会重新开始确认计时。挥手旋转继续使用 EMA 平滑的手掌坐标。

使用 Node.js 运行模拟手势回归测试：`node --test tests/number-gesture.test.cjs`。实际摄像头体验仍需在本地浏览器验证。

为避免过曝，辉光强度为 0.22，辉光阈值为 1.1，场景曝光为 0.85，并降低了树顶星星和选中边框的自发光。照片材质关闭场景色调映射，保留原始图片色彩。

## 🛠️ 技术栈 (Tech Stack)

- Three.js (r160): 核心 3D 渲染引擎。

- Three.js Post-processing: 用于实现辉光 (Bloom) 和色调映射 (Tone Mapping)。

- MediaPipe Hand Landmarker: 实时手部骨骼检测。

- HTML5/CSS3: 响应式布局与 UI 界面。

## ⚙️ 配置 (Configuration)
在代码顶部的 CONFIG 对象中可以调整视觉参数：
```bash
JavaScript

const CONFIG = {
    goldCount: 500,     // 金球数量
    bloomStrength: 0.7, // 辉光强度
    treeHeight: 75,     // 树的高度
    // ...
}; 
```
## 📝 注意事项
- 摄像头权限: 首次打开时浏览器会请求摄像头权限，请点击“允许”。

- 性能: 建议在带有独立显卡的 PC 或高性能手机上运行。代码已针对性能进行了优化（如手势检测节流），但在老旧设备上可能会有卡顿。
尝试解决办法：开启浏览器图形加速后重启浏览器，再打开
<img width="1583" height="741" alt="image" src="https://github.com/user-attachments/assets/e2baf57f-2cdd-428c-bb8c-9a62b84dee5b" />

- 环境光: 请确保您所处的环境光线充足，以便摄像头能准确识别手势。

<div align="center"><table><tbody><tr><td align="center"><b>个人QQ</b><br><img src="https://wmimg.com/i/1119/2025/02/67a96bb8d3ef6.jpg" width="250" alt="作者QQ"><br><b>QQ：154578485</b></td><td align="center"><b>QQ交流群</b><br><img src="https://github.com/user-attachments/assets/5f24482c-19fd-4aa5-8861-3a92a5fc5c79" width="250" alt="QQ群二维码"><br><small>群内会更新个人练手的python项目</small></td><td align="center"><b>微信赞赏</b><br><img src="https://wmimg.com/i/1119/2024/09/66dd37a5ab6e8.jpg" width="500" alt="微信赞赏码"><br><small>要到饭咧？啊咧？啊咧？不给也没事~ 请随意打赏</small></td><td align="center"><b>支付宝赞赏</b><br><img src="https://wmimg.com/i/1119/2024/09/66dd3d6febd05.jpg" width="300" alt="支付宝赞赏码"><br><small>如果觉得有帮助,来包辣条犒劳一下吧~</small></td></tr></tbody></table></div>

Merry Christmas! 🎁
