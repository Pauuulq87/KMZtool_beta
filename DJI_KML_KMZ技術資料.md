DJI KML/KMZ 繪製飛行路徑技術資料
=================================

資料來源：DJI Cloud API / WPML（Waypoint Mission Planning Language）文件與 Dock/Pilot Wayline 管理說明。

1. 檔案與格式
- Wayline 任務使用 WPML（XML）描述，通常封裝為 KMZ（壓縮包內含 KML）。
- 一個 KMZ 可包含多條 wayline（`wpml:waylineId`）與模板（`wpml:templateId`），ID 建議自 0 起遞增，避免重複。
- Pilot 端可直接預覽雲端 Wayline；編輯需先下載為本地檔，修改後需用新名稱再上傳，避免覆蓋原檔。

2. 任務層設定（`wpml:missionConfig`）
- 飛行進場：`wpml:flyToWaylineMode` 可設 `safely` 或 `pointToPoint`，決定到達第一航點的模式。
- 完成動作：`wpml:finishAction` 可設 `goHome`、`noAction`、`autoLand`、`gotoFirstWaypoint`。
- 遙控訊號遺失：`wpml:exitOnRCLost`（`goContinue` / `executeLostAction`）搭配 `wpml:executeRCLostAction`（`goBack`、`landing`、`hover`）。
- 安全高度：`wpml:takeOffSecurityHeight`（1.2–1500 RC / 8–1500 Dock）。若執行「斷點續飛」，KMZ 內此值會被 MQTT 任務 API 的 `rth_altitude` 覆蓋，確保返航高度安全。
- 速度：`wpml:globalTransitionalSpeed`（0–15 m/s）定義飛往首航點或續飛的過渡速度。
- 機型與載荷：以 `wpml:droneInfo`、`wpml:payloadInfo` 填入機型 Enum 與掛載索引。

3. Wayline 全域設定（每條線的 Folder）
- `wpml:waylineId`：每條路線的唯一 ID。
- `wpml:autoFlightSpeed`：全域航速（可被航點局部覆蓋）。
- `wpml:executeHeightMode`：高度參考模式，`WGS84`（椭球高）、`relativeToStartPoint`（相對起飛）、`realTimeFollowSurface`（地表跟隨，僅特定機型）。
- 可選 `wpml:startActionGroup`：路線開始或續飛前執行的動作組。

4. 航點定義（`Placemark`）
- 座標：`<Point><coordinates>經度,緯度</coordinates></Point>`，範圍經度 [-180,180]、緯度 [-90,90]。
- 索引：`wpml:index` 需從 0 單調遞增。
- 高度：若未使用全域高度，需填 `wpml:executeHeight` 或結合 `wpml:useGlobalHeight`/`wpml:ellipsoidHeight`/`wpml:height`（依高度模式決定）。
- 速度：`wpml:waypointSpeed`，若 `wpml:useGlobalSpeed`=0 時必填。
- 航向：`wpml:waypointHeadingParam`（可用全域或局部）。
- 轉彎：`wpml:waypointTurnParam`；若使用連續曲率模式且要直線段，設 `wpml:useStraightLine`=1。
- 風險標記：`wpml:isRisky` 可標註高風險航點（0/1）。
- 影像/測繪：可填 `wpml:quickOrthoMappingEnable`、`wpml:quickOrthoMappingPitch` 等特殊參數（依機型支援）。

5. 動作組（`wpml:actionGroup`）
- 定義在航點中（常見放在目標航點 Placemark 內）。
- `wpml:actionGroupMode` 決定執行方式（如 `sequence` 順序執行）。
- 觸發條件：`wpml:actionTriggerType`（例如 `reachPoint`）。
- 動作類型：
  - `gimbalRotate`：可設 yaw/pitch/roll 角度與時間。
  - `takePhoto`：可設定檔名後綴與 payload 索引。
- `wpml:actionGroupStartIndex` / `wpml:actionGroupEndIndex` 可界定作用航點範圍。

6. 座標與高度模式（`wpml:coordinateMode` / `wpml:heightMode`）
- 坐標系：目前支援 `WGS84`。
- 高度基準：`EGM96`、`relativeToStartPoint`、`aboveGroundLevel`、`realTimeFollowSurface`。不同基準會影響高度填寫欄位（ellipsoid vs 相對地面/起飛點）。
- 定位來源：`wpml:positioningType` 可指定 `GPS`、`RTKBaseStation`、`QianXun`、`Custom`。

7. 影像重疊與測繪參數
- `wpml:orthoCameraOverlapH/W`、`wpml:inclinedCameraOverlapH/W`：前向/側向重疊率（0–100）。
- LiDAR 專用：`wpml:orthoLidarOverlapH/W`、`wpml:inclinedLidarOverlapH/W`。
- 測繪模板時可用 `wpml:surfaceFollowModeEnable` 搭配 `wpml:surfaceRelativeHeight` 做地形跟隨。

8. Dock/Pilot Wayline 管理重點
- 雲端 Wayline 列表可在 Pilot2 Wayline Library 取得、預覽；編輯需先下載，修改後重新上傳（新名稱）。
- Dock 下發任務（Issue/Execute/Cancel/Get mission）需依 MQTT API 流程，並可支援批次取消、斷點續飛、模擬飛行。
- 斷點續飛：Dock 會在 `flighttask_progress` 上報 breakpoint，續飛時用 `issue wayline task` 附帶 breakpoint 欄位。
- 若雲端不可直連外網，需先更新 Dock 配置（含可存取的 NTP URL），否則路線任務無法正常執行。

9. 實務建議
- 建立 KMZ 時，確保 `templateId`、`waylineId`、`index` 連續且唯一，以免 Dock/Pilot 解析錯誤。
- 測繪任務務必填寫高度基準與重疊率，並確認機型支援的模式（如 realTimeFollowSurface 需特定機型）。
- 若需續飛或 RTH，預先設定合理的 `takeOffSecurityHeight` / `globalRTHHeight`，並注意 Dock 任務會以 `rth_altitude` 覆蓋 KMZ 內安全高度。
- 在動作組內使用 `payloadPositionIndex` 指定掛載，以免多掛載機型執行錯誤相機。
