# 动作与热量数据来源

基础内容核验日期：2026-10-25；动作库扩充核验日期：2026-11-02（Asia/Shanghai）。本文件记录 `domain.js` 的参考来源与产品计量约定。

## 动作指导

初始 27 个动作、所需器械、难度与动作要点参照 [American Council on Exercise 官方动作库](https://www.acefitness.org/resources/everyone/exercise-library/)，中文内容为简短转述。ACE 页面中的原始照片与视频未复制进 App；在动作详情可打开对应原文。原有装饰卡片不能作为动作轨迹教学图。新增动作与开放演示素材的来源分别列在下方。

难度按 ACE beginner / intermediate / advanced 映射为入门 / 进阶 / 高阶。部位为便于查找的主分类，复合动作也会涉及其他肌群。替代动作只是同部位的查找入口，不代表器械、负荷或运动模式等价。器械的具体设置需结合现场型号。

模板是可编辑的动作起始清单，围绕用户每周 2–3 次的使用偏好组织。模板时长是界面预估，初始 3 组 × 10 次是记录表格的可修改初值，平板支撑使用秒数；它们不是来自 ACE 的个体训练处方。是否采用及实际负荷由用户结合训练经验调整。

| App 动作 | 一手动作页 |
| --- | --- |
| 坐姿蹬腿 | [Seated Leg Press](https://www.acefitness.org/resources/everyone/exercise-library/154/seated-leg-press/) |
| 哑铃杯式深蹲 | [Goblet Squat](https://www.acefitness.org/resources/everyone/exercise-library/362/goblet-squat/) |
| 徒手深蹲 | [Bodyweight Squat](https://www.acefitness.org/resources/everyone/exercise-library/135/bodyweight-squat/) |
| 俯卧腿弯举 | [Lying Hamstrings Curl](https://www.acefitness.org/resources/everyone/exercise-library/153/lying-hamstrings-curl/) |
| 器械提踵 | [Calf Raise](https://www.acefitness.org/resources/everyone/exercise-library/294/calf-raise/) |
| 臀桥 | [Glute Bridge Exercise](https://www.acefitness.org/resources/everyone/exercise-library/49/glute-bridge/) |
| 前跨弓步蹲 | [Forward Lunge](https://www.acefitness.org/resources/everyone/exercise-library/94/forward-lunge/) |
| 器械推肩 | [Seated Machine Close-Grip Shoulder Press](https://www.acefitness.org/resources/everyone/exercise-library/187/seated-machine-close-grip-shoulder-press/) |
| 器械侧平举 | [Lateral Shoulder Raise](https://www.acefitness.org/resources/everyone/exercise-library/295/lateral-shoulder-raise/) |
| 哑铃前平举 | [Front Raise](https://www.acefitness.org/resources/everyone/exercise-library/54/front-raise/) |
| 哑铃斜向抬举 | [Diagonal Raise](https://www.acefitness.org/resources/everyone/exercise-library/371/diagonal-raise/) |
| 上斜反向飞鸟 | [Incline Reverse Fly](https://www.acefitness.org/resources/everyone/exercise-library/34/incline-reverse-fly/) |
| 高位下拉 | [Seated Lat Pulldown](https://www.acefitness.org/resources/everyone/exercise-library/158/seated-lat-pulldown/) |
| 坐姿高位划船 | [Seated High Back Rows](https://www.acefitness.org/resources/everyone/exercise-library/169/seated-high-back-rows/) |
| 单臂哑铃划船 | [Single-arm Row](https://www.acefitness.org/resources/everyone/exercise-library/126/single-arm-row/) |
| 杠铃俯身划船 | [Bent-over Row](https://www.acefitness.org/resources/everyone/exercise-library/12/bent-over-row/) |
| 坐姿器械推胸 | [Seated Chest Press](https://www.acefitness.org/resources/everyone/exercise-library/188/seated-chest-press/) |
| 平板哑铃卧推 | [Chest Press](https://www.acefitness.org/resources/everyone/exercise-library/19/chest-press/) |
| 上斜哑铃卧推 | [Incline Chest Press](https://www.acefitness.org/resources/everyone/exercise-library/25/incline-chest-press/) |
| 哑铃锤式弯举 | [Hammer Curl](https://www.acefitness.org/resources/everyone/exercise-library/10/hammer-curl/) |
| 器械二头弯举 | [Seated Biceps Curl (machine)](https://www.acefitness.org/resources/everyone/exercise-library/184/seated-biceps-curl/) |
| 坐姿哑铃弯举 | [Seated Biceps Curl (dumbbells)](https://www.acefitness.org/resources/everyone/exercise-library/44/seated-biceps-curl/) |
| 绳索三头下压 | [Triceps Pressdown](https://www.acefitness.org/resources/everyone/exercise-library/3/triceps-pressdown/) |
| 平板支撑 | [Front Plank](https://www.acefitness.org/resources/everyone/exercise-library/32/front-plank/) |
| 鸟狗式 | [Bird-dog](https://www.acefitness.org/resources/everyone/exercise-library/14/bird-dog/) |
| 卷腹 | [Crunch](https://www.acefitness.org/resources/everyone/exercise-library/52/crunch/) |
| 坐姿器械卷腹 | [Seated Crunch](https://www.acefitness.org/resources/everyone/exercise-library/291/seated-crunch/) |

## 免费动作库扩充（2026-11-02）

新增 4 个独立动作 ID，保留原有条目与训练记录。哑铃侧平举与器械侧平举、低位绳索划船与胸垫式高位划船分别建档，不能因中文名称相近而共用器械历史重量。新增条目的难度是查找用的起始标签；哑铃罗马尼亚硬拉按 NASM 的 Intermediate 归为进阶，杠铃卧推归为进阶，哑铃侧平举和低位窄握划船归为入门。标签不替代个人动作能力评估。

下列 wger 来源按公开 API 中英语条目（`language: 2`）的逐条许可核验，未把视频许可误用于动作文字。中文步骤为简短改编，补充了 PingFit 的重量记录口径；这 3 个条目的中文改编同样采用 [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/)。署名和许可字段随各动作保留在 `domain.js`，可在动作详情展示。

| 动作 ID / 名称 | 文字来源与作者 | 许可及改动 |
| --- | --- | --- |
| `barbell-bench-press` 杠铃平板卧推 | [wger exercise 73 / English translation 192](https://wger.de/api/v2/exerciseinfo/73/)，sistab2 | CC BY-SA 3.0；中文简述，补充保护与杆片合计记录，未沿用“内胸/外胸”说法。 |
| `dumbbell-lateral-raise` 哑铃侧平举 | [wger exercise 348 / English translation 148](https://wger.de/api/v2/exerciseinfo/348/)，BFad07、wger.de | CC BY-SA 3.0；中文简述，限定双哑铃同时版本，双只合计重量。 |
| `seated-cable-row` 坐姿窄握绳索划船 | [wger exercise 512 / English translation 108](https://wger.de/api/v2/exerciseinfo/512/)，wger.de；用 [ACE Seated Row](https://www.acefitness.org/resources/everyone/exercise-library/48/seated-row/) 交叉核对 | CC BY-SA 3.0；中文简述，明确低位绳索与窄握把手，控制躯干并拉向腹部，按机器标示记重。 |
| `dumbbell-romanian-deadlift` 哑铃罗马尼亚硬拉 | [NASM Dumbbell Romanian Deadlift](https://www.nasm.org/resource-center/exercise-library/dumbbell-romanian-deadlift) | 独立中文简短转述，未复制 NASM 照片/视频；补充双只哑铃合计记录。wger exercise 507 的英语描述仅有外部链接，且器械元数据写为杠铃，但 Goulart video 2 实际使用双哑铃，因此按实拍器械单独建档并采用精确的 NASM 哑铃动作文字参考。 |

演示素材使用 Goulart 在 wger 发布并单独标注为 CC BY-SA 4.0 的真人视频。视频、抽帧海报及转码改动的逐条记录以 `assets/exercise-demos/catalog.json` 为准；视频来源许可与上述文字许可相互独立，不覆盖其余 App 代码或 ACE 参考内容。素材转换为便于手机播放的版本，不改变动作速度或伪造运动轨迹。

## MET 与热量

参考 [2024 Adult Compendium of Physical Activities](https://pacompendium.com/adult-compendium/)。这是成人活动的标准参考，不是对个人实际能量消耗的测量。公式采用 [ACE 对 MET 热量换算的说明](https://www.acefitness.org/continuing-education/certified/january-2020/7443/anti-sitting-strategies-for-your-clients/)：

`估算 kcal = MET × 3.5 × 体重 kg ÷ 200 × 分钟`

此值为含静息消耗的 gross 热量，不能标成 Apple Watch 的“活动热量”或真实测量值。力量训练以整段力量部分计时估算，包含未暂停的组间休息；缺乏实际强度测量，结果只适合参考。未确认体重前，界面不展示 MET 总估算；领域层若缺失有效体重以 70 kg 暂定并返回 `weightAssumed: true`。已保存训练优先使用该次 `weightKg`，防止后来修改体重改变历史口径。

| 类型 | 默认 MET / 活动代码 | 默认参考强度 | 官方来源 |
| --- | --- | --- | --- |
| 力量训练 | 3.5 / 02054 | 多动作、8–15 次、不同阻力 | [Conditioning Exercise](https://pacompendium.com/conditioning-exercise/) |
| 快走 / 跑步机 | 4.8 / 17200、17358 | 平地或 0% 坡度、5.6–6.3 km/h | [Walking](https://pacompendium.com/walking/) |
| 慢跑 | 7.5 / 12020 | 一般慢跑、自选配速 | [Running](https://pacompendium.com/running/) |
| 室内单车 | 6.8 / 01200 | 固定自行车、一般活动 | [Bicycling](https://pacompendium.com/bicycling/) |
| 椭圆机 | 5.0 / 02048 | 中等用力 | [Conditioning Exercise](https://pacompendium.com/conditioning-exercise/) |
| 划船机 | 5.0 / 02071 | 低于 100 W、中等用力 | [Conditioning Exercise](https://pacompendium.com/conditioning-exercise/) |
| 登阶机 | 9.3 / 02065 | 阶梯式登阶机、一般活动 | [Conditioning Exercise](https://pacompendium.com/conditioning-exercise/) |

`estimateCardio` 的可选 `intensity` 只在有对应来源条目时生效：walk 的 light/moderate/vigorous 对应 3.0/4.8/5.5（17170/17200/17220）；cycle 对应 4.0/6.8/8.0（01214/01200/01228）；elliptical 的 moderate/vigorous 对应 5.0/9.0（02048/02049）；row 对应 5.0/7.5（02071/02072）。这些标签是界面简写，真实速度、瓦数仍以参考描述为准；不能凭“更累”就认为达到了相应瓦数。未知类型返回 0，不虚构活动消耗。

## 产品计量约定

- 组数：仅 `done: true` 且次数或秒数大于 0 的组计为完成；草稿组不计训练量。
- 力量训练量：已完成组的“所填外加 kg × 次数”之和，单位为 kg·次。自重不折算进重量，秒数动作不计算 kg·次；这个数不能直接衡量不同器械的机械做功。
- 双哑铃同时动作填写双只合计重量；单臂动作填写单只重量、左右合计次数。杠铃填写杆和片的合计。器械填写配重标示，不同机器不能直接比重量。
- `elapsedSeconds` 是未暂停的本次计时，包含本次有氧。力量估算分钟数为 `max(0, 总计时分钟 − 有氧分钟合计)`；没有有效完成组时，力量热量为 0。有氧时长超过计时时，总时长至少取有氧时长，不产生负力量时间。
- 每个有氧条目只采用一个热量值。存在有效设备/手填数值（包括 0）时使用它，保留来源；空值或 `source: estimate` 时使用 MET 估算，不把估算值再加一次。
- OCR 结果必须由用户核对后保存。屏幕的热量可能是活动或总热量，来源和口径保留为设备记录，App 不宣称将其转换成统一的生理测量值。
- 周统计以设备本地周一 00:00 至下周一 00:00 的半开区间和训练开始日期归属，仅计 `completed` 记录，并按记录 ID 去重。这里使用当地日历运算，避免 UTC 日期切分和夏令时的 24 小时假设。

## 校验

运行 `TZ=Asia/Shanghai node check-domain.mjs` 与 `TZ=America/New_York node check-domain.mjs`，均通过 9 组行为检查。覆盖同一有氧重复计热量、空值与 0、无效组、秒数动作、历史体重、周边界、重复记录、UTC 跨日与夏令时周。

## 全动作在线视频（2026-11-02）

新增24个原作者发布的在线教学，使用YouTube提供的公开嵌入播放器，不下载、转码、重新托管或重新授权媒体。其版权由各发布者保留；现有Goulart影片的CC BY-SA许可不适用于这些在线视频。使用YouTube隐私增强域名，点击后才加载；保留播放器品牌、控制与原站链接，按官方要求发送HTTP Referrer。参考 [YouTube嵌入说明](https://support.google.com/youtube/answer/171780?hl=zh-Hans) 与 [播放器参数](https://developers.google.com/youtube/player_parameters)。

| App动作 | 影片原作者 | 一手来源 / 具体视频 | 版本提示 |
| --- | --- | --- | --- |
| 坐姿蹬腿 | Kenosha YMCA | [来源](https://www.kenoshaymca.org/y-videos/) · [视频](https://www.youtube.com/watch?v=QwBvFgAVOTo) | 以 LifeFitness 坐姿水平蹬腿机为例，按现场机型调节座椅。 |
| 哑铃杯式深蹲 | Rehab My Patient | [来源](https://www.youtube.com/watch?v=oDyk2_rMR-Q) · [视频](https://www.youtube.com/watch?v=oDyk2_rMR-Q) | 按本条器械与动作步骤练习。 |
| 徒手深蹲 | MI Health Matters | [来源](https://msu-prod-2.dotcms.cloud/videos/bodyweight-squat) · [视频](https://www.youtube.com/watch?v=3VrVQ6m2J30) | 按本条器械与动作步骤练习。 |
| 器械提踵 | Kenosha YMCA | [来源](https://www.kenoshaymca.org/y-videos/) · [视频](https://www.youtube.com/watch?v=oVceaQM7zsk) | 示范为坐姿腿向前伸、前脚掌推踏板的提踵机。 |
| 臀桥 | National Academy of Sports Medicine (NASM) | [来源](https://www.nasm.org/resource-center/exercise-library/floor-bridge) · [视频](https://www.youtube.com/watch?v=Z3cY3d3BBo4) | 按本条器械与动作步骤练习。 |
| 前跨弓步蹲 | MI Health Matters | [来源](https://msu-prod-2.dotcms.cloud/videos/bodyweight-lunge) · [视频](https://www.youtube.com/watch?v=BK-ccAPaNeY) | 按本条器械与动作步骤练习。 |
| 平板支撑 | National Academy of Sports Medicine (NASM) | [来源](https://www.nasm.org/resource-center/exercise-library/plank) · [视频](https://www.youtube.com/watch?v=mwlp75MS6Rg) | 按本条器械与动作步骤练习。 |
| 鸟狗式 | National Academy of Sports Medicine (NASM) | [来源](https://www.nasm.org/resource-center/exercise-library/bird-dog) · [视频](https://www.youtube.com/watch?v=ZdAHe9_HeEw) | 按本条器械与动作步骤练习。 |
| 卷腹 | NHS Fife | [来源](https://www.nhsfife.org/services/all-services/patient-advice/stage-three-exercises-for-your-tummy-muscles/) · [视频](https://www.youtube.com/watch?v=Q9tgMl1__o8) | 按本条器械与动作步骤练习。 |
| 坐姿器械卷腹 | Kenosha YMCA | [来源](https://www.kenoshaymca.org/y-videos/) · [视频](https://www.youtube.com/watch?v=nlqEDo8odJM) | 示范为 LifeFitness 坐姿卷腹机；视频中的腿部支撑与部分机器不同，请按现场说明固定双脚和小腿。 |
| 高位下拉 | Life Fitness / Hammer Strength | [来源](https://www.youtube.com/watch?v=nZip-pdLlQM) · [视频](https://www.youtube.com/watch?v=nZip-pdLlQM) | 按本条器械与动作步骤练习。 |
| 坐姿高位划船 | Life Fitness / Hammer Strength | [来源](https://www.youtube.com/watch?v=Za4iRd2whOA) · [视频](https://www.youtube.com/watch?v=Za4iRd2whOA&t=224s) | 从上方宽握示范开始；调节座椅的说明可拖回视频前段查看。 |
| 单臂哑铃划船 | National Academy of Sports Medicine (NASM) | [来源](https://www.youtube.com/watch?v=DmUX88nWClo) · [视频](https://www.youtube.com/watch?v=DmUX88nWClo) | 按本条器械与动作步骤练习。 |
| 杠铃俯身划船 | National Academy of Sports Medicine (NASM) | [来源](https://www.youtube.com/watch?v=bm0_q9bR_HA) · [视频](https://www.youtube.com/watch?v=bm0_q9bR_HA) | 按本条器械与动作步骤练习。 |
| 坐姿器械推胸 | Life Fitness / Hammer Strength | [来源](https://www.youtube.com/watch?v=sEfN2Gebvag) · [视频](https://www.youtube.com/watch?v=sEfN2Gebvag) | 按本条器械与动作步骤练习。 |
| 器械推肩 | Andrew Kwong (DeltaBolic) | [来源](https://www.youtube.com/watch?v=Nxwict54-Q0) · [视频](https://www.youtube.com/watch?v=Nxwict54-Q0) | 播放前约 3 秒的中立近握示范；原片后段对比其他握法。请按本条的近身握法练习。 |
| 器械侧平举 | Kenosha YMCA | [来源](https://www.kenoshaymca.org/y-videos/) · [视频](https://www.youtube.com/watch?v=0XXFSGnXJbY) | 以 LifeFitness 上臂垫式侧平举机为例，按现场机型调节座椅。 |
| 哑铃前平举 | OPEX Fitness | [来源](https://www.youtube.com/watch?v=E-E0EqERFBg) · [视频](https://www.youtube.com/watch?v=E-E0EqERFBg) | 按本条器械与动作步骤练习。 |
| 上斜反向飞鸟 | Christian Lawal - Mind & Body Coach | [来源](https://www.youtube.com/watch?v=G4KcUxqcXO8) · [视频](https://www.youtube.com/watch?v=G4KcUxqcXO8) | 示范使用约 45° 上斜凳，胸部持续贴靠背。 |
| 哑铃侧平举 | MI Health Matters | [来源](https://msu-prod-2.dotcms.cloud/videos/dumbbell-side-lateral-raise) · [视频](https://www.youtube.com/watch?v=nnq4XzoUzWc) | 按本条器械与动作步骤练习。 |
| 器械二头弯举 | Kenosha YMCA | [来源](https://www.kenoshaymca.org/y-videos/) · [视频](https://www.youtube.com/watch?v=l9Eg4xvSjTU) | 以 LifeFitness 斜垫式二头弯举机为例，按现场机型调节座椅与转轴。 |
| 坐姿哑铃弯举 | MI Health Matters | [来源](https://msu-prod-2.dotcms.cloud/videos/seated-dumbbell-curls) · [视频](https://www.youtube.com/watch?v=oCeecrBNhfo) | 按本条器械与动作步骤练习。 |
| 绳索三头下压 | Muscle & Strength | [来源](https://www.muscleandstrength.com/exercises/rope-tricep-extension.html) · [视频](https://www.youtube.com/watch?v=LzwgB15UdO8) | 按本条器械与动作步骤练习。 |
| 哑铃斜向抬举 | Cloud Gym - Workouts | [来源](https://www.youtube.com/watch?v=Pcn6syNbmRc) · [视频](https://www.youtube.com/watch?v=Pcn6syNbmRc) | 此视频为单臂哑铃跨体斜举；按可控制的幅度抬至约肩高。 |

已核对发布者、一手来源与官方oEmbed返回的具体视频嵌入；对机型、握法等易混条目另做可见画面核对。未声称逐秒完整观看全部教学，也不承诺第三方平台永久可用。DVIDS与受限Vimeo候选因本次外站播放未通过而未进入正式清单。
