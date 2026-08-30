# 牛来看盘行情状态映射

本文件是牛来看盘当前正式的行情状态映射权威文档，用于定义 Instrument Type、当日涨跌幅阈值、Market State 与 Cow Action 的对应关系。

源码实现必须与本文件一致。修改行情分类、阈值或 Market State → Action 时，必须同步更新本文件。

## Index Profile

| Instrument | Daily Change | Market State | Cow Action | Product Meaning |
|---|---:|---|---|---|
| index | `>= +2.00%` | `strong_up` | `jumping` | 大涨 / 强势上涨 |
| index | `>= +0.50% and < +2.00%` | `up` | `celebration_dance` | 普通上涨 / 开心 |
| index | `> -0.50% and < +0.50%` | `flat` | `idle` | 平稳 |
| index | `<= -0.50% and > -3.00%` | `down` | `failed` | 下跌 |
| index | `<= -3.00%` | `strong_down` | `crying` | 暴跌 / 恐慌 |

## Stock Profile

| Instrument | Daily Change | Market State | Cow Action | Product Meaning |
|---|---:|---|---|---|
| stock | `>= +7.00%` | `strong_up` | `jumping` | 大涨 / 强势上涨 |
| stock | `>= +2.00% and < +7.00%` | `up` | `celebration_dance` | 普通上涨 / 开心 |
| stock | `> -2.00% and < +2.00%` | `flat` | `idle` | 正常波动 |
| stock | `<= -2.00% and > -7.00%` | `down` | `failed` | 下跌 |
| stock | `<= -7.00%` | `strong_down` | `crying` | 大跌 / 极端弱势 |

个股阈值是当前产品的情绪分层规则，不代表证券市场统一定义。

## Boundary Examples

### INDEX

```text
+1.99% → up → celebration_dance
+2.00% → strong_up → jumping

+0.49% → flat → idle
+0.50% → up → celebration_dance

-0.49% → flat → idle
-0.50% → down → failed

-2.99% → down → failed
-3.00% → strong_down → crying
```

### STOCK

```text
+1.99% → flat → idle
+2.00% → up → celebration_dance

+6.99% → up → celebration_dance
+7.00% → strong_up → jumping

-1.99% → flat → idle
-2.00% → down → failed

-6.99% → down → failed
-7.00% → strong_down → crying
```

## Instrument Classification

当前分类规则来自 `marketState.js`：以下明确支持的标的属于 `index`：

- `sh000001`
- `sz399001`
- `sh000688`
- `sh000300`
- `sh000016`
- `sh000905`
- `int_nasdaq`
- `int_dji`
- `int_sp500`

此外，当前代码支持的 A 股指数 pattern 为 `^(sh000\d{3}|sz399\d{3})$`（规范化为小写后匹配），命中后分类为 `index`。

普通个股示例包括：

- `sh600xxx`
- `sz000xxx`
- `sz300xxx`
- `sh688xxx`

`sh000688 → index`；`sh688001 → stock`。

未知标的分类为 `stock`（`unknown → stock`）。如果传入的 `instrumentType` 不在正式 profile 中，当前实现同样回退使用 `stock` profile。

## Action Semantics

- `strong_up` → `jumping`：持续强势上涨动作。
- `up` → `celebration_dance`：持续普通上涨动作。
- `flat` → `idle`。
- `down` → `failed`。
- `strong_down` → `crying`。

`celebration_dance` 已不再作为 `strong_up` edge 彩蛋。`swaying` 当前不绑定 Market State。本文件不为其他 action 擅自新增业务语义。

## Responsibilities

- `marketState.js`：Instrument Type + Threshold → Market State。
- `cowStateMachine.js`：Market State → Cow Action。
- renderer：负责播放与 action arbitration，不维护第二套涨跌幅阈值。

renderer 不负责判断百分比；百分比分类的唯一实现入口是 `marketState.js`。
