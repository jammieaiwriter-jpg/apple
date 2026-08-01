# KooBits 取捨與段考優先架構

評估日期：2026-08-01

## 結論

KooBits 只提供「技能顆粒度、練習體驗與動機機制」參考，不提供本系統的課綱權威、考試範圍或精熟標準。

本系統主軸：

```text
108 官方課綱
  -> 出版社版次章節
  -> 本次段考範圍
  -> 歷屆卷題型證據
  -> 題型矩陣
  -> 離線 AI 變式題＋驗算
  -> 孩子作答證據調整矩陣權重
```

## 官網可驗證的機制

KooBits 臺灣數學頁面公開說明：每日 10 題、題庫依主題與難度組織、弱項評估、自動批改、家長報告、圖像化動畫與自訂作業。國際版也宣稱每日題目依能力與弱點個人化。

來源：

- [KooBits 臺灣數學官網](https://www.koobits.com/math/tw)
- [KooBits Math 個人化每日練習](https://www.koobits.com/math)
- [KooBits Mission 難度分層說明](https://support.koobits.com/hc/en-gb/articles/360040267372-Mission-self-practice)
- [KooBits 教師報告說明](https://support.koobits.com/hc/en-gb/articles/4406000579609-Reports-for-teachers)
- [KooBits 家長報告與錯題回補](https://support.koobits.com/hc/en-gb/articles/56453989026585-Parent-Report)

## 吸收

| 機制 | 本系統的用法 | 採用邊界 |
|---|---|---|
| 短時段每日練習 | 一次可完成的小型段考混合回合 | 題目只來自當前考試範圍 |
| 難度分層 | 矩陣格內保留 `basic/application/challenge` | 難度不能代替題型與表徵多樣性 |
| 弱點個人化 | 依答錯、用提示、看解答與重複錯因調整矩陣權重 | 仍須保留全範圍最低覆蓋 |
| 圖像／生活情境說明 | 同一觀念以文字、表格、數線、圖形或生活情境轉換 | 不複製 KooBits 影片、題目或素材 |
| 家長報告 | 報告單元、矩陣格、錯因、回補進度 | 不只報分數或作答量 |
| 自訂作業 | 家長可鎖定本次段考範圍與日期 | 不直接選 KooBits 章節作為權威 |

## 放棄或降級

| KooBits 機制 | 決策 | 理由 |
|---|---|---|
| KooBits 章節順序／SkillID 作主索引 | 降為別名 | 學校版本、學期與段考範圍才是應試約束 |
| 全課程隨機每日挑戰 | 考前模式關閉 | 可能抽到本次不考的技能 |
| 8/10 即過關 | 放棄 | 無法分辨提示、看答案與首次乾淨答對 |
| 題數或過關章節等於精熟 | 放棄 | 精熟必須由穩定轉移與低支援證據判定 |
| 即時 AI 生成／即時遠端判分 | 放棄 | 無法在孩子作答前完成答案與圖表驗證 |
| PvP、過度金幣化 | 可選的輕量外觀 | 不能改變選題或精熟判斷 |

## 矩陣格最小契約

每個可生題矩陣格至少包含：

```json
{
  "officialContentCodes": ["N-1-1"],
  "publisherUnitIds": ["..."],
  "examScopeProfileIds": ["..."],
  "skillIds": ["G1-01-01"],
  "concept": "...",
  "questionType": "...",
  "representation": "text|table|number_line|diagram|life_context",
  "askDirection": "...",
  "trap": "...",
  "level": "basic|application|challenge",
  "evidenceQuestionIds": ["..."],
  "generationStatus": "blocked|ready|verified"
}
```

`generationStatus=verified` 前不得進入孩子練習頁。

## 自適應調整順序

1. 先限定本次段考範圍，排除 `scope_outlier`。
2. 每個在範圍內的官方觀念與高頻題型都保留最低覆蓋。
3. 答錯／提示／看解答：提高同觀念、同錯因格的權重，安排兩層變式。
4. 乾淨答對：不立即移除，先改表徵、改問法或升難度驗證轉移。
5. 多次乾淨答對後才降低權重，但直到考前仍保留間隔復習。
6. 作答速度只用於區分「熟練」與「需要更多時間」，不單獨決定掌握。
