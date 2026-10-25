# 动作与热量数据来源

核验日期：2026-10-25（Asia/Shanghai）。本文件记录 `domain.js` 的参考来源与产品计量约定。

## 动作指导

动作、所需器械、难度与动作要点参照 [American Council on Exercise 官方动作库](https://www.acefitness.org/resources/everyone/exercise-library/)，中文内容为简短转述。页面中的原始照片与视频未复制进 App；在动作详情可打开对应原文。动作卡片和装饰图片不能作为动作轨迹教学图。

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
