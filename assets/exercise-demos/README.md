# PingFit 免费动作演示

首版收录 7 个经过来源与姿态匹配核对的动作演示。

本目录的真人演示视频来自 [wger 公开动作 API](https://wger.de/api/v2/video/)，原作者为 **Goulart**。每条素材分别核对原视频记录中的作者与许可，不以应用代码的开源许可代替媒体授权。

MP4 与从视频抽取的 JPG 封面按 [Creative Commons Attribution–ShareAlike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/) 提供。再分发、改编这些素材时须保留作者、来源、许可链接与修改说明，并遵守该许可。它们的许可不改变 PingFit 程序代码和独立编写动作说明各自的许可。

`catalog.json` 为本次采用的素材清单，逐条包含来源记录、原视频地址、原作者、许可、修改方式和文件 SHA-256。没有在清单中的文件不作为已审核动作演示发布。

素材处理：保留完整动作视频，转为长边 640 px、约 500 kbit/s 的 H.264 MP4，转换为 30 fps、去除音轨，并从处理后的视频提取 JPG 封面。未有意改变播放速度、裁剪动作内容或拼接镜头。编码时帧率换算可能使尾帧时长有小幅舍入差异。

处理工具见 `scripts/prepare-exercise-demos.m`，使用 macOS 本地 AVFoundation，不需要第三方视频依赖。未经处理的原始视频保留于开发机器临时目录，不随 App 打包。

这些是循环播放的真人动作演示，不是 3D 动画。各型号器械的轨迹、座椅设置仍需按现场说明确认。
