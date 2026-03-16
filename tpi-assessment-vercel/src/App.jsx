import { useState, useEffect, useCallback, useRef } from "react";

/* ═══════════════════════ TPI SCREEN DATA ═══════════════════════ */
const TPI_SCREENS = [
  { id:1, name:"ペルビックティルト", en:"Pelvic Tilt", cat:"下半身", desc:"骨盤の前傾・後傾の可動性を評価", proc:"直立姿勢で骨盤を前傾・後傾させる。腰椎のS字カーブを維持したまま骨盤のみを動かせるか確認。", fault:"S-Posture,C-Posture", icon:"🦴",
    sc:[{v:3,l:"Pass",d:"前傾・後傾ともに正しく実施可能"},{v:2,l:"Mod",d:"一方向のみ可能、または代償動作あり"},{v:1,l:"Fail",d:"骨盤の独立した動きが困難"}]},
  { id:2, name:"ペルビックローテーション", en:"Pelvic Rotation", cat:"下半身", desc:"骨盤の回旋可動域を評価", proc:"ゴルフアドレス姿勢で上半身を固定し、骨盤のみを左右に回旋。", fault:"Sway,Slide,Early Extension", icon:"🔄",
    sc:[{v:3,l:"Pass",d:"左右とも十分な回旋が可能"},{v:2,l:"Mod",d:"左右差あり、または制限あり"},{v:1,l:"Fail",d:"回旋が著しく制限"}]},
  { id:3, name:"トルソーローテーション", en:"Torso Rotation", cat:"体幹", desc:"胸椎の回旋可動域を評価", proc:"座位でクラブを胸の前に保持し、下半身を固定したまま上半身を左右に回旋。", fault:"Flat Shoulder Plane,Loss of Posture", icon:"↩️",
    sc:[{v:3,l:"Pass",d:"左右45°以上の回旋が可能"},{v:2,l:"Mod",d:"30-45°の回旋"},{v:1,l:"Fail",d:"30°未満の回旋"}]},
  { id:4, name:"OHディープスクワット", en:"OH Deep Squat", cat:"全身", desc:"全身の可動性・安定性・協調性を総合評価", proc:"クラブを頭上に保持し、フルスクワットを実施。踵が浮かず、クラブが前方に倒れないか確認。", fault:"Loss of Posture,Early Extension", icon:"🏋️",
    sc:[{v:3,l:"Pass",d:"正しいフォームでフルスクワット可能"},{v:2,l:"Mod",d:"代償動作あり（踵浮き・前傾等）"},{v:1,l:"Fail",d:"実施困難"}]},
  { id:5, name:"トータッチ", en:"Toe Touch", cat:"下半身", desc:"ハムストリングス・腰部の柔軟性を評価", proc:"膝を伸ばした状態で前屈し、指先が床に届くか確認。", fault:"C-Posture,Early Extension,Reverse Spine Angle", icon:"🤸",
    sc:[{v:3,l:"Pass",d:"指先が床に到達"},{v:2,l:"Mod",d:"指先が足首〜床の間"},{v:1,l:"Fail",d:"指先が足首に届かない"}]},
  { id:6, name:"90/90 外旋", en:"90/90 Ext Rot", cat:"上半身", desc:"肩関節の外旋可動域を評価", proc:"肩・肘を90°に保持し、前腕を後方に倒す。左右差も確認。", fault:"Flying Elbow,Chicken Wing", icon:"💪",
    sc:[{v:3,l:"Pass",d:"前腕が水平以上に外旋可能"},{v:2,l:"Mod",d:"外旋制限あり（45-90°）"},{v:1,l:"Fail",d:"外旋45°未満"}]},
  { id:7, name:"90/90 内旋", en:"90/90 Int Rot", cat:"上半身", desc:"肩関節の内旋可動域を評価", proc:"肩・肘を90°に保持し、前腕を前方に倒す。左右差も確認。", fault:"Chicken Wing,Over the Top", icon:"💪",
    sc:[{v:3,l:"Pass",d:"前腕が水平以上に内旋可能"},{v:2,l:"Mod",d:"内旋制限あり"},{v:1,l:"Fail",d:"内旋が著しく制限"}]},
  { id:8, name:"シングルレッグバランス", en:"SL Balance", cat:"下半身", desc:"片脚立位でのバランス能力を評価", proc:"片脚立ちで目を閉じ、安定して立てるか確認。左右とも実施。", fault:"Sway,Slide,Hanging Back", icon:"🦩",
    sc:[{v:3,l:"Pass",d:"閉眼で10秒以上安定"},{v:2,l:"Mod",d:"開眼で安定、閉眼で不安定"},{v:1,l:"Fail",d:"開眼でも不安定"}]},
  { id:9, name:"ラットレングス", en:"Lat Length", cat:"上半身", desc:"広背筋の柔軟性を評価", proc:"壁に背をつけ、腕を頭上に挙上。腰が壁から離れずに完全挙上できるか確認。", fault:"Flat Shoulder Plane,Loss of Posture", icon:"🙆",
    sc:[{v:3,l:"Pass",d:"腰を壁につけたまま完全挙上可能"},{v:2,l:"Mod",d:"腰の代償あり、または挙上制限"},{v:1,l:"Fail",d:"著しい制限あり"}]},
  { id:10, name:"LQローテーション", en:"LQ Rotation", cat:"下半身", desc:"股関節の内旋・外旋可動域を評価", proc:"座位で股関節の内旋・外旋を実施。左右差を確認。", fault:"Sway,Slide,Early Extension", icon:"🦵",
    sc:[{v:3,l:"Pass",d:"内旋・外旋ともに十分"},{v:2,l:"Mod",d:"左右差あり、または一方に制限"},{v:1,l:"Fail",d:"著しい制限あり"}]},
  { id:11, name:"シーテッドトランクRot", en:"Seated Trunk Rot", cat:"体幹", desc:"座位での体幹回旋能力を評価", proc:"両脚を揃えて座り、クラブを胸前に保持して左右に回旋。", fault:"Reverse Spine Angle,Sway", icon:"🔁",
    sc:[{v:3,l:"Pass",d:"左右とも十分な回旋が可能"},{v:2,l:"Mod",d:"回旋制限または左右差あり"},{v:1,l:"Fail",d:"著しい制限あり"}]},
  { id:12, name:"ブリッジ＋レッグExt", en:"Bridge+Leg Ext", cat:"体幹", desc:"殿筋の活性化とコア安定性を評価", proc:"ブリッジ姿勢から片脚を伸展。骨盤が落ちずに水平を維持できるか確認。", fault:"Early Extension,Loss of Posture,Hanging Back", icon:"🌉",
    sc:[{v:3,l:"Pass",d:"骨盤水平を維持して脚伸展可能"},{v:2,l:"Mod",d:"わずかな骨盤の落ちあり"},{v:1,l:"Fail",d:"骨盤が著しく落ちる"}]},
  { id:13, name:"リーチ・ロール＆リフト", en:"Reach Roll Lift", cat:"上半身", desc:"肩甲骨の安定性と可動性を評価", proc:"うつ伏せで片腕を前方に伸ばし、親指を上に向けてリフト。", fault:"Flying Elbow,Loss of Posture", icon:"🤚",
    sc:[{v:3,l:"Pass",d:"代償なく腕のリフトが可能"},{v:2,l:"Mod",d:"軽度の代償動作あり"},{v:1,l:"Fail",d:"リフトが困難"}]},
  { id:14, name:"サービカルRot", en:"Cervical Rot", cat:"上半身", desc:"頚椎の回旋可動域を評価", proc:"座位で頭部を左右に回旋。70°以上の回旋が可能か確認。", fault:"Loss of Posture,Flat Shoulder Plane", icon:"🔍",
    sc:[{v:3,l:"Pass",d:"左右70°以上の回旋可能"},{v:2,l:"Mod",d:"回旋制限あり（50-70°）"},{v:1,l:"Fail",d:"50°未満の回旋"}]},
  { id:15, name:"リストヒンジ", en:"Wrist Hinge", cat:"上半身", desc:"手関節の背屈・掌屈の可動域を評価", proc:"手関節の背屈（コック）と掌屈（アンコック）の角度を確認。", fault:"Casting,Early Release,Scoop", icon:"✋",
    sc:[{v:3,l:"Pass",d:"背屈・掌屈ともに十分な可動域"},{v:2,l:"Mod",d:"一方に制限あり"},{v:1,l:"Fail",d:"著しい制限あり"}]},
  { id:16, name:"フォアアームRot", en:"Forearm Rot", cat:"上半身", desc:"前腕の回内・回外の可動域を評価", proc:"肘を体側に固定し、前腕の回内と回外を実施。", fault:"Chicken Wing,Over the Top,Slice", icon:"🖐️",
    sc:[{v:3,l:"Pass",d:"回内・回外ともに十分"},{v:2,l:"Mod",d:"左右差または一方に制限あり"},{v:1,l:"Fail",d:"著しい制限あり"}]}
];
const CATS=["全身","下半身","体幹","上半身"];

/* ═══════════════ CORRECTIVE EXERCISE DB ═══════════════ */
const CDB=[
  {sids:[1],ph:1,name:"キャット＆カウ",desc:"四つ這いで背骨を丸める↔反らすを交互に繰り返し、骨盤の前傾・後傾の分離動作を学習",sets:"2×10回",rest:"－",eq:"マット",focus:"腰椎-骨盤リズム",sev:{1:"必須",2:"推奨"}},
  {sids:[1],ph:1,name:"ヒップフレクサーストレッチ（ハーフニーリング）",desc:"片膝立ちで後方脚の股関節前面を伸張。骨盤を後傾させたまま実施",sets:"2×30秒/側",rest:"－",eq:"マット",focus:"腸腰筋・大腿直筋",sev:{1:"必須",2:"推奨"}},
  {sids:[1],ph:2,name:"デッドバグ",desc:"仰向けで腰部をマットに押し付けたまま対角の手足を交互に伸ばす",sets:"2×8回/側",rest:"30秒",eq:"マット",focus:"コアスタビリティ",sev:{1:"必須",2:"推奨"}},
  {sids:[1],ph:3,name:"ペルビックティルト・アドレスドリル",desc:"アドレス姿勢で骨盤を前傾→ニュートラル→後傾と動かし適切なセットアップを体得",sets:"2×8回",rest:"－",eq:"クラブ",focus:"アドレス姿勢統合",sev:{1:"必須",2:"推奨"}},
  {sids:[2],ph:1,name:"90/90ヒップストレッチ",desc:"前脚・後脚ともに膝90°で股関節の内旋・外旋可動域を改善",sets:"2×30秒/側",rest:"－",eq:"マット",focus:"股関節回旋ROM",sev:{1:"必須",2:"推奨"}},
  {sids:[2],ph:2,name:"ミニバンド・ペルビックローテーション",desc:"膝上にミニバンドを巻き、アドレス姿勢で上半身を固定して骨盤のみ回旋",sets:"2×10回/側",rest:"30秒",eq:"ミニバンド",focus:"骨盤回旋制御",sev:{1:"必須",2:"推奨"}},
  {sids:[2],ph:3,name:"スプリットスタンス・ペルビックローテーション",desc:"前後のスプリットスタンスで骨盤回旋を体重移動パターンと連動",sets:"2×8回/側",rest:"30秒",eq:"クラブ",focus:"体重移動+骨盤回旋",sev:{1:"必須",2:"任意"}},
  {sids:[3],ph:1,name:"ソラシックローテーション（サイドライイング）",desc:"横向きで膝を揃え、上側の腕を開いて胸椎回旋。腰椎ではなく胸椎から動かす",sets:"2×10回/側",rest:"－",eq:"マット",focus:"胸椎回旋ROM",sev:{1:"必須",2:"推奨"}},
  {sids:[3],ph:1,name:"ソラシックExt（フォームローラー）",desc:"フォームローラーの上で胸椎を伸展。回旋の前提となる伸展可動域を確保",sets:"2×10回",rest:"－",eq:"フォームローラー",focus:"胸椎伸展ROM",sev:{1:"必須",2:"推奨"}},
  {sids:[3],ph:2,name:"ハーフニーリング・ローテーション（バンド）",desc:"片膝立ちでバンドを保持し回旋抵抗トレーニング",sets:"2×10回/側",rest:"30秒",eq:"チューブ",focus:"回旋安定性",sev:{1:"必須",2:"推奨"}},
  {sids:[3],ph:4,name:"MB・ローテーショナルスロー",desc:"半跪きまたは立位でメディシンボールを壁に回旋スロー。胸椎回旋パワーを開発",sets:"3×6回/側",rest:"60秒",eq:"メディシンボール",focus:"回旋パワー",sev:{1:"必須",2:"任意"}},
  {sids:[4],ph:1,name:"アンクルモビリティドリル（壁）",desc:"壁に向かって膝を前方に押し、足関節の背屈可動域を改善",sets:"2×12回/側",rest:"－",eq:"壁",focus:"足関節背屈",sev:{1:"必須",2:"推奨"}},
  {sids:[4],ph:1,name:"ワールドグレイテストストレッチ",desc:"ランジ+回旋+ハムストレッチを組み合わせた全身動的ストレッチ",sets:"2×5回/側",rest:"－",eq:"マット",focus:"全身可動性",sev:{1:"必須",2:"推奨"}},
  {sids:[4],ph:2,name:"ゴブレットスクワット",desc:"ケトルベルを胸前で保持しフルスクワット。カウンターバランスでフォーム改善+筋力強化",sets:"3×10回",rest:"60秒",eq:"ケトルベル",focus:"スクワットパターン",sev:{1:"必須",2:"推奨"}},
  {sids:[4],ph:3,name:"OHスクワット（PVCパイプ）",desc:"PVCパイプを頭上保持でスクワット。スクリーン再テストを兼ねた統合エクササイズ",sets:"2×8回",rest:"45秒",eq:"PVC/クラブ",focus:"全身統合",sev:{1:"必須",2:"任意"}},
  {sids:[5],ph:1,name:"トータッチ・プログレッション",desc:"①段差つま先タッチ②両脚タッチ③ハムフロス。段階的に可動域改善",sets:"2×8回",rest:"－",eq:"段差/ブロック",focus:"後面チェーン柔軟性",sev:{1:"必須",2:"推奨"}},
  {sids:[5],ph:1,name:"ハムストリングスストレッチ（ストラップ）",desc:"ストラップを使い仰向けで片脚を挙上。能動的にROMを拡大",sets:"2×30秒/側",rest:"－",eq:"ストラップ",focus:"ハムストリングス",sev:{1:"必須",2:"推奨"}},
  {sids:[5],ph:2,name:"ルーマニアンデッドリフト",desc:"ヒンジパターンでハムストリングス・殿筋をエキセントリックに強化",sets:"3×10回",rest:"60秒",eq:"ダンベル/KB",focus:"ヒンジパターン筋力",sev:{1:"必須",2:"推奨"}},
  {sids:[6],ph:1,name:"スリーパーストレッチ",desc:"側臥位で肩の内旋方向にストレッチ。後方関節包の拘縮改善",sets:"2×30秒/側",rest:"－",eq:"マット",focus:"肩後方タイトネス",sev:{1:"必須",2:"推奨"}},
  {sids:[6],ph:2,name:"サイドライイング外旋エクササイズ",desc:"側臥位で肘を体側に固定し、軽量ダンベルで肩外旋筋群を強化",sets:"2×12回/側",rest:"30秒",eq:"ダンベル(1-2kg)",focus:"ローテーターカフ",sev:{1:"必須",2:"推奨"}},
  {sids:[6],ph:3,name:"バンド外旋 in ゴルフポスチャー",desc:"アドレス姿勢でバンドを使いバックスイング時の肩外旋パターンを反復",sets:"2×10回/側",rest:"30秒",eq:"チューブ",focus:"スイング連動",sev:{1:"必須",2:"任意"}},
  {sids:[7],ph:1,name:"クロスボディストレッチ",desc:"肩後面のストレッチ。内旋制限の改善",sets:"2×30秒/側",rest:"－",eq:"－",focus:"肩後面柔軟性",sev:{1:"必須",2:"推奨"}},
  {sids:[7],ph:2,name:"バンド内旋エクササイズ",desc:"チューブを使い肩内旋筋群（肩甲下筋・大胸筋）を強化",sets:"2×12回/側",rest:"30秒",eq:"チューブ",focus:"肩内旋筋力",sev:{1:"必須",2:"推奨"}},
  {sids:[8],ph:2,name:"SLバランスドリル（マルチプレーン）",desc:"片脚立ちで反対脚を前・横・後ろに伸ばし多方向バランス制御",sets:"2×8回/側/方向",rest:"30秒",eq:"－",focus:"動的バランス",sev:{1:"必須",2:"推奨"}},
  {sids:[8],ph:2,name:"シングルレッグRDL",desc:"片脚ヒンジで股関節安定性とバランスを同時強化",sets:"2×8回/側",rest:"45秒",eq:"ダンベル",focus:"片脚安定性",sev:{1:"必須",2:"推奨"}},
  {sids:[8],ph:3,name:"SLローテーション（バンド）",desc:"片脚立ちでバンドを回旋。スイング中のバランス維持を模擬",sets:"2×8回/側",rest:"45秒",eq:"チューブ",focus:"片脚+回旋統合",sev:{1:"必須",2:"任意"}},
  {sids:[9],ph:1,name:"ラットストレッチ（壁）",desc:"壁に手をつき体側を伸張させて広背筋の柔軟性を改善",sets:"2×30秒/側",rest:"－",eq:"壁",focus:"広背筋柔軟性",sev:{1:"必須",2:"推奨"}},
  {sids:[9],ph:1,name:"チャイルドポーズ（ラット重視）",desc:"正座から手を前方に伸ばし体側に偏らせ広背筋を片側ずつ伸張",sets:"2×30秒/側",rest:"－",eq:"マット",focus:"広背筋・胸背筋膜",sev:{1:"必須",2:"推奨"}},
  {sids:[9],ph:2,name:"プローン Y-T-W レイズ",desc:"うつ伏せでY・T・Wの形に腕を挙上。僧帽筋下部・菱形筋を活性化",sets:"2×8回/各",rest:"30秒",eq:"マット",focus:"肩甲骨安定性",sev:{1:"必須",2:"推奨"}},
  {sids:[10],ph:1,name:"ハーフニーリング・ヒップ内旋ストレッチ",desc:"片膝立ちで前脚の股関節を内旋方向にストレッチ",sets:"2×30秒/側",rest:"－",eq:"マット",focus:"股関節内旋ROM",sev:{1:"必須",2:"推奨"}},
  {sids:[10],ph:1,name:"ピジョンストレッチ",desc:"前脚の股関節を外旋位にして深く沈み外旋可動域を改善",sets:"2×30秒/側",rest:"－",eq:"マット",focus:"股関節外旋ROM",sev:{1:"必須",2:"推奨"}},
  {sids:[10],ph:2,name:"ラテラルバンドウォーク",desc:"膝上のミニバンドに抵抗しながら横歩き。殿筋群活性化+股関節安定性",sets:"2×10歩/方向",rest:"30秒",eq:"ミニバンド",focus:"殿筋活性化",sev:{1:"必須",2:"推奨"}},
  {sids:[11],ph:1,name:"オープンブック・ストレッチ",desc:"側臥位で上側の腕を大きく開き胸椎回旋を促進",sets:"2×8回/側",rest:"－",eq:"マット",focus:"胸椎回旋",sev:{1:"必須",2:"推奨"}},
  {sids:[11],ph:2,name:"パロフプレス",desc:"チューブの回旋負荷に抵抗しながら体幹をニュートラルに保持",sets:"2×10回/側",rest:"30秒",eq:"チューブ",focus:"抗回旋コア",sev:{1:"必須",2:"推奨"}},
  {sids:[11],ph:3,name:"ケーブル・リフト＆チョップ",desc:"斜め方向のパターンで体幹の回旋と抗回旋を統合",sets:"2×10回/側",rest:"45秒",eq:"ケーブル/チューブ",focus:"対角パターン統合",sev:{1:"必須",2:"任意"}},
  {sids:[12],ph:2,name:"グルートブリッジ（片脚プログレッション）",desc:"両脚→片脚ブリッジへ進行。殿筋活性化+骨盤水平保持力強化",sets:"3×10回/側",rest:"45秒",eq:"マット",focus:"殿筋活性・コア",sev:{1:"必須",2:"推奨"}},
  {sids:[12],ph:2,name:"バードドッグ",desc:"四つ這いで対角の手脚を伸ばし体幹ニュートラル保持力を強化",sets:"2×8回/側",rest:"30秒",eq:"マット",focus:"コアスタビリティ",sev:{1:"必須",2:"推奨"}},
  {sids:[12],ph:3,name:"SLヒップスラスト",desc:"ベンチに背を預け片脚でヒップスラスト。スイングのフォワードプレスに必要な殿筋パワー",sets:"3×8回/側",rest:"60秒",eq:"ベンチ",focus:"殿筋パワー",sev:{1:"必須",2:"任意"}},
  {sids:[13],ph:1,name:"ペックストレッチ（ドアフレーム）",desc:"ドアフレームで胸筋ストレッチ。肩甲骨前方突出を改善",sets:"2×30秒/側",rest:"－",eq:"ドアフレーム",focus:"胸筋柔軟性",sev:{1:"必須",2:"推奨"}},
  {sids:[13],ph:2,name:"バンドプルアパート",desc:"バンドを胸の前で左右に引く。菱形筋・中部僧帽筋の強化",sets:"2×15回",rest:"30秒",eq:"チューブ",focus:"肩甲骨内転筋",sev:{1:"必須",2:"推奨"}},
  {sids:[14],ph:1,name:"サービカルRot・セルフモビ",desc:"座位で指を顎にあてゆっくり回旋。可動域端で5秒保持",sets:"2×8回/側",rest:"－",eq:"－",focus:"頚椎回旋ROM",sev:{1:"必須",2:"推奨"}},
  {sids:[14],ph:1,name:"レベータースキャップストレッチ",desc:"頭部を側屈+回旋させて上部僧帽筋・肩甲挙筋をストレッチ",sets:"2×30秒/側",rest:"－",eq:"－",focus:"頚部軟部組織",sev:{1:"必須",2:"推奨"}},
  {sids:[14],ph:2,name:"チンタック＋ローテーション",desc:"二重顎を作る要領で頚椎リトラクト→左右回旋。深層頚部屈筋群活性化",sets:"2×10回/側",rest:"－",eq:"－",focus:"頚部安定性",sev:{1:"必須",2:"推奨"}},
  {sids:[15],ph:1,name:"リストFlex/Extストレッチ",desc:"手関節を掌屈・背屈方向にストレッチ。前腕の拘縮を改善",sets:"2×20秒/方向/側",rest:"－",eq:"－",focus:"手関節ROM",sev:{1:"必須",2:"推奨"}},
  {sids:[15],ph:2,name:"リストカール＆リバースカール",desc:"ダンベルで手関節屈筋・伸筋群を強化。コック保持力向上",sets:"2×15回/方向",rest:"30秒",eq:"ダンベル(1-3kg)",focus:"手関節筋力",sev:{1:"必須",2:"推奨"}},
  {sids:[15],ph:3,name:"クラブヒンジドリル",desc:"クラブを持ちコック→アンコックを反復。正しいリストヒンジパターンを習得",sets:"2×15回",rest:"－",eq:"クラブ",focus:"コックパターン",sev:{1:"必須",2:"任意"}},
  {sids:[16],ph:1,name:"フォアアーム回旋ストレッチ",desc:"肘を固定し前腕を回内→回外方向にストレッチ",sets:"2×20秒/方向/側",rest:"－",eq:"－",focus:"前腕回旋ROM",sev:{1:"必須",2:"推奨"}},
  {sids:[16],ph:2,name:"ダンベル・プロネーション/スピネーション",desc:"ダンベルの一端を握り回内・回外。前腕回旋筋群の強化",sets:"2×12回/方向/側",rest:"30秒",eq:"ダンベル",focus:"前腕回旋筋力",sev:{1:"必須",2:"推奨"}},
  {sids:[16],ph:3,name:"クラブフェースコントロールドリル",desc:"短いスイングでフェース開閉を意識。前腕回旋連動のフェースコントロール",sets:"2×10回",rest:"－",eq:"クラブ",focus:"フェースコントロール",sev:{1:"必須",2:"任意"}},
  {sids:[1,2,4,5,10],ph:4,name:"ケトルベルスイング",desc:"股関節ヒンジの爆発力を開発。下半身主導のパワー生成パターン",sets:"3×12回",rest:"60秒",eq:"ケトルベル",focus:"ヒップパワー",sev:{1:"推奨",2:"任意"}},
  {sids:[3,11],ph:4,name:"MB・サイドスロー",desc:"壁に向かって回旋スロー。体幹の回旋パワーをスイング速度に変換",sets:"3×6回/側",rest:"60秒",eq:"メディシンボール",focus:"回旋パワー",sev:{1:"推奨",2:"任意"}},
  {sids:[8,12],ph:4,name:"ラテラルバウンド",desc:"片脚から片脚へ横ジャンプ。体重移動とバランスを強化",sets:"3×6回/側",rest:"60秒",eq:"－",focus:"ラテラルパワー",sev:{1:"推奨",2:"任意"}},
];

const PHI=[
  {n:1,name:"Mobility",ja:"モビリティ",sub:"可動域改善",col:"#5b8fd9",icon:"🔓",desc:"制限のある関節・筋の可動域を回復"},
  {n:2,name:"Stability",ja:"スタビリティ",sub:"安定性獲得",col:"#d4a017",icon:"🛡️",desc:"可動域を安定して制御できるよう筋群を強化"},
  {n:3,name:"Motor Control",ja:"モーターコントロール",sub:"動作パターン統合",col:"#2d8f55",icon:"⚙️",desc:"可動性と安定性をゴルフ動作パターンに統合"},
  {n:4,name:"Power",ja:"パワー",sub:"ゴルフパフォーマンス",col:"#c4503f",icon:"⚡",desc:"スピードと爆発力を加え飛距離・精度を向上"},
];

const FI={"S-Posture":"アドレス時に腰椎過前弯","C-Posture":"アドレス時に胸椎過後弯","Loss of Posture":"スイング中に前傾角変化","Early Extension":"ダウンスイングで骨盤前方突出","Sway":"BSで骨盤が右に移動","Slide":"DSで骨盤が左に過度に移動","Reverse Spine Angle":"トップで体幹が目標方向に傾く","Flat Shoulder Plane":"肩の回旋面が浅い","Flying Elbow":"トップで後方肘が過外転","Chicken Wing":"FTで前方肘が曲がる","Over the Top":"DSがアウトサイドイン軌道","Casting":"DS初期でコックが解ける","Early Release":"インパクト前にコック完全解放","Scoop":"インパクトで手首背屈","Hanging Back":"FTで体重移動不十分","Slice":"スライス回転"};

/* ═══════ STORAGE ═══════ */
const ld=async(k,fb)=>{try{const r=localStorage.getItem(k);return r?JSON.parse(r):fb;}catch{return fb;}};
const sv=async(k,d)=>{try{localStorage.setItem(k,JSON.stringify(d));}catch(e){console.error(e);}};

/* ═══════ STYLES ═══════ */
const G="#c9a96e";
const sC=v=>v===3?"#2d8f55":v===2?"#d4a017":v===1?"#c4503f":"#444";
const sB=v=>v===3?"rgba(45,143,85,0.12)":v===2?"rgba(212,160,23,0.12)":v===1?"rgba(196,80,63,0.12)":"rgba(255,255,255,0.03)";
const pi=a=>({padding:"5px 14px",borderRadius:20,fontSize:12,fontWeight:600,cursor:"pointer",border:`1px solid ${a?G:"rgba(255,255,255,0.08)"}`,background:a?`${G}18`:"transparent",color:a?G:"#6b6560",fontFamily:"inherit"});
const bt=v=>({padding:"10px 20px",borderRadius:10,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",border:"none",transition:"all 0.2s",...(v==="gold"?{background:G,color:"#111"}:v==="ghost"?{background:"transparent",color:"#9a9590",border:"1px solid rgba(255,255,255,0.1)"}:{background:"rgba(255,255,255,0.06)",color:"#b8b2a8",border:"1px solid rgba(255,255,255,0.08)"})});
const ip={padding:"10px 14px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:"#e8e4dc",fontSize:14,fontFamily:"inherit",outline:"none",width:"100%",boxSizing:"border-box"};

/* ═══════ RX ENGINE ═══════ */
function buildRx(scores){
  const fail=[],mod=[];
  Object.entries(scores).forEach(([id,v])=>{if(v===1)fail.push(+id);else if(v===2)mod.push(+id);});
  const phases=PHI.map(pi=>{
    const exs=[];const seen=new Set();
    CDB.filter(e=>e.ph===pi.n).forEach(e=>{
      const mF=e.sids.some(s=>fail.includes(s)),mM=e.sids.some(s=>mod.includes(s));
      if((mF||mM)&&!seen.has(e.name)){seen.add(e.name);const sv=mF?1:2;const rel=e.sids.filter(s=>fail.includes(s)||mod.includes(s));exs.push({...e,sv,rel,label:e.sev[sv]});}
    });
    exs.sort((a,b)=>a.sv-b.sv);
    return {...pi,exercises:exs};
  });
  const faults={};
  [...fail,...mod].forEach(id=>{const s=TPI_SCREENS.find(x=>x.id===id);if(s)s.fault.split(",").forEach(f=>{if(!faults[f])faults[f]={c:0,s:"mod"};faults[f].c++;if(fail.includes(id))faults[f].s="fail";});});
  return {phases,faults:Object.entries(faults).sort((a,b)=>b[1].c-a[1].c),nF:fail.length,nM:mod.length,nP:16-fail.length-mod.length,total:Object.values(scores).reduce((a,v)=>a+(v||0),0),fail,mod};
}

/* ═══════════════ FULL-SCREEN PRESCRIPTION ═══════════════ */
function RxView({scores,client,onClose}){
  const rx=buildRx(scores);
  const [freq,setFreq]=useState("3");
  const [tab,setTab]=useState("program"); // program | summary | schedule
  const nEx=rx.phases.reduce((a,p)=>a+p.exercises.length,0);
  const pct=Math.round(rx.total/48*100);
  const allPass=rx.nF===0&&rx.nM===0;

  return (
    <div style={{minHeight:"100vh",background:"#0e0d0b",fontFamily:"'DM Sans',sans-serif",color:"#e8e4dc",position:"relative"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,600;9..40,700;9..40,800&display=swap" rel="stylesheet"/>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}} @keyframes fadeIn{from{opacity:0}to{opacity:1}} *{scrollbar-width:thin;scrollbar-color:#333 transparent}`}</style>

      {/* ──── TOP BAR ──── */}
      <div style={{position:"sticky",top:0,zIndex:10,background:"linear-gradient(180deg,#0e0d0b 80%,transparent)",padding:"16px 20px 24px"}}>
        <div style={{maxWidth:720,margin:"0 auto",display:"flex",alignItems:"center",gap:14}}>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"8px 14px",color:"#9a9590",cursor:"pointer",fontSize:13,fontFamily:"inherit",fontWeight:600}}>← 戻る</button>
          <div style={{flex:1}}>
            <div style={{fontSize:11,letterSpacing:"0.14em",fontWeight:700,color:G,textTransform:"uppercase"}}>Corrective Exercise Prescription</div>
            <div style={{fontSize:17,fontWeight:800,marginTop:2}}>{client.name}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:32,fontWeight:800,color:pct>=80?"#2d8f55":pct>=50?"#d4a017":"#c4503f",lineHeight:1}}>{pct}<span style={{fontSize:14,fontWeight:400}}>%</span></div>
            <div style={{fontSize:10,color:"#6b6560"}}>{rx.total}/48</div>
          </div>
        </div>
      </div>

      <div style={{maxWidth:720,margin:"0 auto",padding:"0 20px 40px"}}>
        {/* ──── SCORE GRID ──── */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:6,marginBottom:24,animation:"slideUp 0.5s ease"}}>
          {TPI_SCREENS.map(s=>{const v=scores[s.id];return(
            <div key={s.id} style={{background:sB(v),border:`1.5px solid ${sC(v)}50`,borderRadius:10,padding:"8px 4px",textAlign:"center",transition:"all 0.3s"}}>
              <div style={{fontSize:16,lineHeight:1}}>{s.icon}</div>
              <div style={{fontSize:18,fontWeight:800,color:sC(v),marginTop:2}}>{v}</div>
              <div style={{fontSize:8,color:"#6b6560",marginTop:1,lineHeight:1.1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}</div>
            </div>
          );})}
        </div>

        {/* ──── PASS/MOD/FAIL SUMMARY ──── */}
        <div style={{display:"flex",gap:10,marginBottom:20,animation:"slideUp 0.5s ease 0.1s both"}}>
          {[["Pass",rx.nP,"#2d8f55"],["Moderate",rx.nM,"#d4a017"],["Fail",rx.nF,"#c4503f"]].map(([l,n,c])=>(
            <div key={l} style={{flex:1,background:`${c}12`,border:`1px solid ${c}30`,borderRadius:12,padding:"12px 14px",textAlign:"center"}}>
              <div style={{fontSize:28,fontWeight:800,color:c,lineHeight:1}}>{n}</div>
              <div style={{fontSize:11,color:"#9a9590",marginTop:4}}>{l}</div>
            </div>
          ))}
        </div>

        {allPass ? (
          <div style={{textAlign:"center",padding:"60px 20px",background:"rgba(45,143,85,0.05)",border:"1px solid rgba(45,143,85,0.15)",borderRadius:20,animation:"slideUp 0.5s ease 0.2s both"}}>
            <div style={{fontSize:56,marginBottom:16}}>🏆</div>
            <div style={{fontSize:22,fontWeight:800,color:"#2d8f55",marginBottom:10}}>全項目Pass!</div>
            <div style={{fontSize:14,color:"#9a9590",maxWidth:380,margin:"0 auto",lineHeight:1.7}}>すべてのTPIスクリーンをクリア。Phase 4のパワートレーニングに注力し、パフォーマンス向上を目指しましょう。</div>
          </div>
        ) : (<>

          {/* ──── TAB NAV ──── */}
          <div style={{display:"flex",gap:4,marginBottom:24,background:"rgba(255,255,255,0.02)",borderRadius:14,padding:4,border:"1px solid rgba(255,255,255,0.05)",animation:"slideUp 0.5s ease 0.15s both"}}>
            {[["program","プログラム",`${nEx}種目`],["summary","フォルト分析",`${rx.faults.length}項目`],["schedule","スケジュール",""]].map(([k,l,badge])=>(
              <button key={k} onClick={()=>setTab(k)} style={{flex:1,padding:"11px 8px",borderRadius:11,border:"none",background:tab===k?`${G}20`:"transparent",color:tab===k?G:"#6b6560",fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s"}}>
                {l}{badge&&<span style={{fontSize:10,marginLeft:4,opacity:0.7}}>({badge})</span>}
              </button>
            ))}
          </div>

          {/* ──── TAB: PROGRAM ──── */}
          {tab==="program"&&(
            <div style={{animation:"fadeIn 0.3s ease"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
                <span style={{fontSize:12,color:"#6b6560"}}>頻度:</span>
                {["2","3","4","5"].map(f=><button key={f} onClick={()=>setFreq(f)} style={pi(freq===f)}>{f}回/週</button>)}
              </div>

              {rx.phases.map((phase,pi)=>{
                if(phase.exercises.length===0) return null;
                return (
                  <div key={phase.n} style={{marginBottom:32,animation:`slideUp 0.5s ease ${0.1*pi}s both`}}>
                    {/* Phase Header */}
                    <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16,padding:"16px 20px",background:`${phase.col}0a`,border:`1px solid ${phase.col}20`,borderRadius:16}}>
                      <div style={{width:48,height:48,borderRadius:14,background:`${phase.col}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{phase.icon}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:10,letterSpacing:"0.14em",fontWeight:700,color:phase.col,textTransform:"uppercase",marginBottom:2}}>Phase {phase.n}</div>
                        <div style={{fontSize:18,fontWeight:800,letterSpacing:"-0.01em"}}>{phase.ja}</div>
                        <div style={{fontSize:12,color:"#6b6560",marginTop:2}}>{phase.sub} ── {phase.exercises.length}種目{phase.n<=2?` ── ${phase.n===1?`毎日〜${freq}回/週`:`${freq}回/週`}`:""}</div>
                      </div>
                    </div>

                    {/* Exercise Cards */}
                    {phase.exercises.map((ex,i)=>(
                      <div key={i} style={{marginBottom:10,padding:"18px 20px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:14,transition:"all 0.2s"}}>
                        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                          <div style={{fontSize:12,fontWeight:800,color:ex.sv===1?"#c4503f":"#d4a017",padding:"3px 10px",borderRadius:6,background:ex.sv===1?"rgba(196,80,63,0.15)":"rgba(212,160,23,0.1)",border:`1px solid ${ex.sv===1?"rgba(196,80,63,0.3)":"rgba(212,160,23,0.2)"}`}}>{ex.label}</div>
                          <div style={{fontSize:16,fontWeight:700,flex:1}}>{ex.name}</div>
                        </div>

                        <div style={{fontSize:13,color:"#9a9590",lineHeight:1.7,marginBottom:14}}>{ex.desc}</div>

                        {/* Specs Row */}
                        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:10}}>
                          <div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:8,background:`${G}12`,border:`1px solid ${G}20`}}>
                            <span style={{fontSize:11,color:G,fontWeight:700}}>{ex.sets}</span>
                          </div>
                          {ex.rest!=="－"&&(
                            <div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:8,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)"}}>
                              <span style={{fontSize:10,color:"#6b6560"}}>休息</span>
                              <span style={{fontSize:11,color:"#b8b2a8",fontWeight:600}}>{ex.rest}</span>
                            </div>
                          )}
                          <div style={{padding:"6px 14px",borderRadius:8,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",fontSize:11,color:"#9a9590"}}>{ex.eq}</div>
                          <div style={{padding:"6px 14px",borderRadius:8,background:`${phase.col}0d`,border:`1px solid ${phase.col}20`,fontSize:11,color:phase.col,fontWeight:600}}>{ex.focus}</div>
                        </div>

                        {/* Related Screens */}
                        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                          {ex.rel.map(sid=>{const s=TPI_SCREENS.find(x=>x.id===sid);const v=scores[sid];return(
                            <div key={sid} style={{display:"flex",alignItems:"center",gap:4,padding:"3px 8px",borderRadius:6,background:"rgba(255,255,255,0.03)",fontSize:10}}>
                              <span style={{fontWeight:800,color:sC(v)}}>#{sid}</span>
                              <span style={{color:"#6b6560"}}>{s?.name}</span>
                              <span style={{color:sC(v),fontWeight:700}}>{v===1?"Fail":"Mod"}</span>
                            </div>
                          );})}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {/* ──── TAB: FAULT ANALYSIS ──── */}
          {tab==="summary"&&(
            <div style={{animation:"fadeIn 0.3s ease"}}>
              <div style={{fontSize:13,color:"#6b6560",marginBottom:20,lineHeight:1.7}}>
                Fail/Moderateの評価項目から導き出される、発生リスクの高いスイングフォルトを分析。関連する項目数が多いほどリスクが高く、優先的に対処すべきフォルトです。
              </div>
              {rx.faults.map(([f,info],i)=>(
                <div key={f} style={{padding:"20px",background:info.s==="fail"?"rgba(196,80,63,0.05)":"rgba(212,160,23,0.04)",border:`1px solid ${info.s==="fail"?"rgba(196,80,63,0.15)":"rgba(212,160,23,0.12)"}`,borderRadius:14,marginBottom:10,animation:`slideUp 0.4s ease ${i*0.05}s both`}}>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                    <div style={{fontSize:24,fontWeight:800,color:info.s==="fail"?"#c4503f":"#d4a017",minWidth:32}}>{info.c}</div>
                    <div>
                      <div style={{fontSize:16,fontWeight:700}}>{f}</div>
                      <div style={{fontSize:12,color:"#6b6560",marginTop:2}}>{FI[f]}</div>
                    </div>
                    <div style={{marginLeft:"auto",padding:"4px 12px",borderRadius:8,fontSize:11,fontWeight:700,background:info.s==="fail"?"rgba(196,80,63,0.15)":"rgba(212,160,23,0.1)",color:info.s==="fail"?"#c4503f":"#d4a017"}}>{info.s==="fail"?"HIGH":"MID"}</div>
                  </div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {[...rx.fail,...rx.mod].filter(id=>{const s=TPI_SCREENS.find(x=>x.id===id);return s&&s.fault.includes(f);}).map(id=>{const s=TPI_SCREENS.find(x=>x.id===id);return(
                      <span key={id} style={{fontSize:11,padding:"3px 10px",borderRadius:6,background:"rgba(255,255,255,0.04)",color:"#9a9590"}}>
                        <span style={{color:sC(scores[id]),fontWeight:700}}>#{id}</span> {s?.name}
                      </span>
                    );})}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ──── TAB: SCHEDULE ──── */}
          {tab==="schedule"&&(
            <div style={{animation:"fadeIn 0.3s ease"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24}}>
                <span style={{fontSize:12,color:"#6b6560"}}>頻度:</span>
                {["2","3","4","5"].map(f=><button key={f} onClick={()=>setFreq(f)} style={pi(freq===f)}>{f}回/週</button>)}
              </div>

              {+freq<=3 ? (
                <div style={{animation:"slideUp 0.4s ease"}}>
                  <div style={{fontSize:15,fontWeight:700,color:G,marginBottom:16}}>毎セッション構成（30-40分）</div>
                  {[
                    {phase:"Phase 1: Mobility",time:"10分",desc:"ウォームアップとしてモビリティドリルを毎回実施",col:"#5b8fd9",icon:"🔓"},
                    {phase:"Phase 2: Stability",time:"15分",desc:"メインセッション。安定性エクササイズに集中",col:"#d4a017",icon:"🛡️"},
                    {phase:"Phase 3-4: 統合+パワー",time:"10-15分",desc:"Fail項目がModerate以上に改善してから段階的に追加",col:"#2d8f55",icon:"⚙️⚡"},
                  ].map((item,i)=>(
                    <div key={i} style={{display:"flex",gap:16,marginBottom:12,padding:"16px 20px",background:`${item.col}08`,border:`1px solid ${item.col}18`,borderRadius:14,animation:`slideUp 0.4s ease ${i*0.1}s both`}}>
                      <div style={{fontSize:24,flexShrink:0}}>{item.icon}</div>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <span style={{fontSize:14,fontWeight:700}}>{item.phase}</span>
                          <span style={{fontSize:11,padding:"2px 8px",borderRadius:6,background:`${item.col}18`,color:item.col,fontWeight:600}}>{item.time}</span>
                        </div>
                        <div style={{fontSize:12,color:"#9a9590",marginTop:4}}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                  <div style={{padding:"14px 18px",background:"rgba(91,143,217,0.05)",border:"1px solid rgba(91,143,217,0.12)",borderRadius:12,marginTop:16,fontSize:12,color:"#9a9590",lineHeight:1.7}}>
                    💡 Phase 1のモビリティドリルはトレーニング日以外でも毎日のセルフケアとして実施を推奨
                  </div>
                </div>
              ) : (
                <div style={{animation:"slideUp 0.4s ease"}}>
                  <div style={{fontSize:15,fontWeight:700,color:G,marginBottom:16}}>A/Bスプリット（交互実施）</div>
                  {[
                    {day:"Day A",title:"下半身重点",items:["Phase 1: 下半身系モビリティ（10分）","Phase 2: 下半身系スタビリティ（15分）","Phase 4: ヒップパワー系（10分）"],col:"#5b8fd9"},
                    {day:"Day B",title:"上半身・体幹重点",items:["Phase 1: 上半身系モビリティ（10分）","Phase 2: 上半身・コア系スタビリティ（15分）","Phase 4: 回旋パワー系（10分）"],col:"#d4a017"},
                  ].map((d,i)=>(
                    <div key={i} style={{marginBottom:14,padding:"20px",background:`${d.col}08`,border:`1px solid ${d.col}18`,borderRadius:16,animation:`slideUp 0.4s ease ${i*0.12}s both`}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                        <span style={{fontSize:13,fontWeight:800,color:d.col,padding:"4px 12px",borderRadius:8,background:`${d.col}18`}}>{d.day}</span>
                        <span style={{fontSize:15,fontWeight:700}}>{d.title}</span>
                      </div>
                      {d.items.map((item,j)=>(
                        <div key={j} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:j<d.items.length-1?"1px solid rgba(255,255,255,0.04)":"none"}}>
                          <div style={{width:22,height:22,borderRadius:6,background:"rgba(255,255,255,0.05)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#6b6560"}}>{j+1}</div>
                          <span style={{fontSize:13,color:"#b8b2a8"}}>{item}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                  <div style={{padding:"14px 18px",background:"rgba(91,143,217,0.05)",border:"1px solid rgba(91,143,217,0.12)",borderRadius:12,marginTop:10,fontSize:12,color:"#9a9590",lineHeight:1.7}}>
                    💡 Day AとDay Bを交互に実施。Phase 1は毎セッションのウォームアップとして必須
                  </div>
                </div>
              )}

              <div style={{marginTop:24,padding:"18px 20px",background:"rgba(91,143,217,0.04)",border:"1px solid rgba(91,143,217,0.12)",borderRadius:14,fontSize:13,color:"#9a9590",lineHeight:1.8}}>
                <div style={{fontWeight:700,color:"#5b8fd9",marginBottom:6}}>📋 再評価について</div>
                4-6週間後に再度TPIスクリーニングを実施し、改善度を確認してプログラムを更新してください。Fail → Mod → Pass への進行を追跡することで、トレーニング効果を客観的に評価できます。
              </div>
            </div>
          )}
        </>)}

        <div style={{textAlign:"center",padding:"30px 0 10px",fontSize:10,color:"#333",borderTop:"1px solid rgba(255,255,255,0.03)",marginTop:40}}>
          Disport World × TPI Corrective Exercise Prescription ── © {new Date().getFullYear()} 株式会社Disport
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ ASSESSMENT SCREEN ═══════════════ */
function AssessScreen({client,onSave,onCancel}){
  const [scores,setScores]=useState(()=>{const o={};TPI_SCREENS.forEach(s=>o[s.id]=null);return o;});
  const [notes,setNotes]=useState({});const [sides,setSides]=useState({});const [exp,setExp]=useState(null);const [fCat,setFCat]=useState("ALL");const [showRx,setShowRx]=useState(false);const [saved,setSaved]=useState(null);
  const toggle=(id,v)=>setScores(p=>({...p,[id]:p[id]===v?null:v}));
  const done=Object.values(scores).filter(v=>v!==null).length; const allDone=done===16;
  const filtered=fCat==="ALL"?TPI_SCREENS:TPI_SCREENS.filter(s=>s.cat===fCat);
  const handleSave=()=>{const a={id:Date.now().toString(),clientId:client.id,date:new Date().toISOString(),scores:{...scores},notes:{...notes},sides:{...sides}};onSave(a);setSaved(a);if(allDone)setShowRx(true);};
  if(showRx&&saved) return (<RxView scores={saved.scores} client={client} onClose={()=>{setShowRx(false);onCancel();}}/>);

  return(<div>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,flexWrap:"wrap"}}>
      <button onClick={onCancel} style={bt("ghost")}>← 戻る</button>
      <div style={{flex:1,minWidth:150}}><div style={{fontSize:16,fontWeight:700}}>{client.name}</div><div style={{fontSize:12,color:"#6b6560"}}>{new Date().toLocaleDateString("ja-JP")}の評価</div></div>
      <div style={{fontSize:13,fontWeight:600}}><span style={{color:allDone?"#2d8f55":G}}>{done}/16</span>{allDone&&<span style={{marginLeft:8,fontSize:11,color:"#2d8f55"}}>✓</span>}</div>
      <button onClick={handleSave} disabled={done===0} style={{...bt("gold"),opacity:done===0?0.4:1}}>{allDone?"保存 → コレクティブ処方":"保存"}</button>
    </div>
    {allDone&&!saved&&(<div style={{padding:"12px 16px",background:"rgba(45,143,85,0.08)",border:"1px solid rgba(45,143,85,0.2)",borderRadius:12,marginBottom:16,fontSize:13,color:"#2d8f55",fontWeight:600}}>✓ 全16項目完了。「保存 → コレクティブ処方」で4フェーズのプログラムが自動生成されます。</div>)}
    <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>{["ALL",...CATS].map(c=><button key={c} onClick={()=>setFCat(c)} style={pi(fCat===c)}>{c==="ALL"?"全て":c}</button>)}</div>
    {filtered.map(screen=>{const isExp=exp===screen.id;const val=scores[screen.id];return(
      <div key={screen.id} style={{background:val!==null?sB(val):"rgba(255,255,255,0.02)",border:`1px solid ${val!==null?sC(val)+"40":"rgba(255,255,255,0.06)"}`,borderRadius:14,padding:16,marginBottom:10,transition:"all 0.25s"}}>
        <div onClick={()=>setExp(isExp?null:screen.id)} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:20}}>{screen.icon}</span>
          <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600}}>{screen.id}. {screen.name}</div><div style={{fontSize:11,color:"#6b6560"}}>{screen.en} ─ {screen.cat}</div></div>
          <div style={{width:32,height:32,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,background:val!==null?sB(val):"rgba(255,255,255,0.04)",color:val!==null?sC(val):"#444"}}>{val??"–"}</div>
          <span style={{color:"#6b6560",fontSize:16,transform:isExp?"rotate(180deg)":"",transition:"0.2s"}}>▾</span>
        </div>
        {isExp&&(<div style={{marginTop:14,paddingTop:14,borderTop:"1px solid rgba(255,255,255,0.05)"}}>
          <p style={{fontSize:12,color:"#9a9590",margin:"0 0 8px",lineHeight:1.6}}>{screen.desc}</p>
          <div style={{fontSize:11,color:"#6b6560",background:"rgba(0,0,0,0.2)",padding:"8px 12px",borderRadius:8,marginBottom:14,lineHeight:1.6}}><strong style={{color:"#b8b2a8"}}>手順：</strong>{screen.proc}</div>
          <div style={{display:"flex",gap:6,marginBottom:10}}>{["左右同時","左","右"].map(side=><button key={side} onClick={()=>setSides(p=>({...p,[screen.id]:side}))} style={pi((sides[screen.id]||"左右同時")===side)}>{side}</button>)}</div>
          <div style={{display:"flex",gap:8,marginBottom:12}}>{screen.sc.map(sc=>{const sel=val===sc.v;const col=sC(sc.v);return (<button key={sc.v} onClick={()=>toggle(screen.id,sc.v)} style={{flex:1,padding:"10px 8px",borderRadius:10,border:`2px solid ${col}`,background:sel?col:"transparent",color:sel?"#fff":col,cursor:"pointer",fontWeight:600,fontSize:12,fontFamily:"inherit",transition:"all 0.2s"}}><div style={{fontSize:16,marginBottom:2}}>{sc.v===3?"✓":sc.v===2?"△":"✗"}</div><div>{sc.l}</div><div style={{fontSize:10,fontWeight:400,opacity:0.8,marginTop:2}}>{sc.d}</div></button>);})}</div>
          <div style={{fontSize:11,color:"#6b6560",marginBottom:8}}><span style={{color:G}}>関連フォルト：</span>{screen.fault.split(",").join(" / ")}</div>
          <textarea value={notes[screen.id]||""} onChange={e=>setNotes(p=>({...p,[screen.id]:e.target.value}))} placeholder="メモ・所見..." style={{...ip,minHeight:50,resize:"vertical"}}/>
        </div>)}
      </div>);})}
  </div>);
}

/* ═══════════════ CLIENTS / HISTORY ═══════════════ */
function Clients({cls,onSel,onAdd,onDel,sel}){
  const[n,sN]=useState("");const[a,sA]=useState("");const[g,sG]=useState("");const[h,sH]=useState("");
  const add=()=>{if(!n.trim())return;onAdd({id:Date.now().toString(),name:n.trim(),age:a||"–",goal:g||"–",handicap:h||"–",createdAt:new Date().toISOString()});sN("");sA("");sG("");sH("");};
  return(<div>
    <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14,padding:20,marginBottom:20}}>
      <div style={{fontSize:14,fontWeight:700,color:G,marginBottom:14}}>新規クライアント登録</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 80px 1fr 80px",gap:10,marginBottom:12}}><input value={n} onChange={e=>sN(e.target.value)} placeholder="氏名 *" style={ip}/><input value={a} onChange={e=>sA(e.target.value)} placeholder="年齢" style={ip}/><input value={g} onChange={e=>sG(e.target.value)} placeholder="目標" style={ip}/><input value={h} onChange={e=>sH(e.target.value)} placeholder="HC" style={ip}/></div>
      <button onClick={add} style={bt("gold")}>登録</button>
    </div>
    {cls.length===0?<div style={{textAlign:"center",padding:40,color:"#6b6560",fontSize:14}}>クライアントが未登録です</div>:
    <div style={{display:"flex",flexDirection:"column",gap:8}}>{cls.map(c=>(
      <div key={c.id} onClick={()=>onSel(c.id)} style={{background:sel===c.id?`${G}0a`:"rgba(255,255,255,0.02)",border:`1px solid ${sel===c.id?`${G}33`:"rgba(255,255,255,0.06)"}`,borderRadius:14,padding:16,cursor:"pointer",display:"flex",alignItems:"center",gap:14,transition:"all 0.2s"}}>
        <div style={{width:42,height:42,borderRadius:12,background:`${G}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:G,flexShrink:0}}>{c.name[0]}</div>
        <div style={{flex:1}}><div style={{fontSize:15,fontWeight:600}}>{c.name}</div><div style={{fontSize:12,color:"#6b6560",marginTop:2}}>{c.age!=="–"?`${c.age}歳`:""}{c.handicap!=="–"?` ・ HC ${c.handicap}`:""}{c.goal!=="–"?` ・ ${c.goal}`:""}</div></div>
        <div style={{fontSize:11,color:"#6b6560"}}>{c.assessmentCount||0}回</div>
        <button onClick={e=>{e.stopPropagation();onDel(c.id);}} style={{background:"none",border:"none",color:"#c4503f",cursor:"pointer",fontSize:16,padding:4}}>✕</button>
      </div>))}</div>}
  </div>);
}

function History({client,asm}){
  const[selIds,setSelIds]=useState([]);const[rxId,setRxId]=useState(null);
  const sorted=[...asm].sort((a,b)=>new Date(b.date)-new Date(a.date));
  const tog=id=>setSelIds(p=>p.includes(id)?p.filter(x=>x!==id):p.length<3?[...p,id]:p);
  const st=a=>{const s=Object.entries(a.scores).filter(([,v])=>v!==null);const t=s.reduce((x,[,v])=>x+v,0);const m=s.length*3;return{t,m,pct:m>0?Math.round(t/m*100):0,c:s.length};};
  const comp=sorted.filter(a=>selIds.includes(a.id));
  if(rxId){const a=sorted.find(x=>x.id===rxId);if(a) return (<RxView scores={a.scores} client={client} onClose={()=>setRxId(null)}/>);}
  return(<div>
    <div style={{fontSize:18,fontWeight:700,marginBottom:4}}>{client.name}</div>
    <div style={{fontSize:12,color:"#6b6560",marginBottom:20}}>{asm.length}回の評価データ</div>
    {sorted.length>1&&<div style={{fontSize:12,color:"#6b6560",marginBottom:12}}>比較: 最大3つ選択</div>}
    {sorted.map(a=>{const s=st(a);const isSel=selIds.includes(a.id);return(
      <div key={a.id} style={{background:isSel?`${G}0a`:"rgba(255,255,255,0.02)",border:`1px solid ${isSel?`${G}33`:"rgba(255,255,255,0.06)"}`,borderRadius:14,padding:16,marginBottom:8,display:"flex",alignItems:"center",gap:14,cursor:"pointer",transition:"all 0.2s"}} onClick={()=>tog(a.id)}>
        <div style={{width:10,height:10,borderRadius:"50%",background:isSel?G:"rgba(255,255,255,0.1)",flexShrink:0}}/>
        <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600}}>{new Date(a.date).toLocaleDateString("ja-JP",{year:"numeric",month:"long",day:"numeric"})}</div><div style={{fontSize:11,color:"#6b6560"}}>{s.c}/16項目</div></div>
        <div style={{fontSize:28,fontWeight:800,color:s.pct>=80?"#2d8f55":s.pct>=50?"#d4a017":"#c4503f"}}>{s.pct}<span style={{fontSize:12,fontWeight:400}}>%</span></div>
        <button onClick={e=>{e.stopPropagation();setRxId(a.id);}} style={{...bt("ghost"),padding:"6px 12px",fontSize:11}}>💊 処方</button>
      </div>);})}
    {comp.length>=2&&(<div style={{marginTop:24}}><div style={{fontSize:14,fontWeight:700,color:G,marginBottom:16}}>スコア比較</div><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr><th style={{textAlign:"left",padding:"8px 10px",borderBottom:"1px solid rgba(255,255,255,0.08)",color:"#6b6560"}}>テスト</th>{comp.map(a=><th key={a.id} style={{textAlign:"center",padding:"8px 10px",borderBottom:"1px solid rgba(255,255,255,0.08)",color:G,whiteSpace:"nowrap"}}>{new Date(a.date).toLocaleDateString("ja-JP",{month:"short",day:"numeric"})}</th>)}{comp.length===2&&<th style={{textAlign:"center",padding:"8px 10px",borderBottom:"1px solid rgba(255,255,255,0.08)",color:"#9a9590"}}>変化</th>}</tr></thead><tbody>{TPI_SCREENS.map(scr=>{const vals=comp.map(a=>a.scores[scr.id]);const diff=comp.length===2&&vals[0]!=null&&vals[1]!=null?vals[0]-vals[1]:null;return (<tr key={scr.id}><td style={{padding:"6px 10px",borderBottom:"1px solid rgba(255,255,255,0.03)",color:"#b8b2a8",fontSize:11}}>{scr.name}</td>{vals.map((v,i)=><td key={i} style={{textAlign:"center",padding:"6px 10px",borderBottom:"1px solid rgba(255,255,255,0.03)",fontWeight:700,color:v!=null?sC(v):"#333"}}>{v??"–"}</td>)}{comp.length===2&&<td style={{textAlign:"center",padding:"6px 10px",borderBottom:"1px solid rgba(255,255,255,0.03)",fontWeight:700,color:diff>0?"#2d8f55":diff<0?"#c4503f":"#6b6560"}}>{diff!=null?(diff>0?`+${diff}`:diff===0?"→":diff):"–"}</td>}</tr>);})}</tbody></table></div></div>)}
    {sorted.length===0&&<div style={{textAlign:"center",padding:40,color:"#6b6560"}}>まだ評価データがありません</div>}
  </div>);
}

/* ═══════════════ MAIN ═══════════════ */
export default function App(){
  const[pg,setPg]=useState("clients");const[cls,setCls]=useState([]);const[asm,setAsm]=useState({});const[sel,setSel]=useState(null);const[loading,setLoading]=useState(true);
  useEffect(()=>{(async()=>{const c=await ld("tpi-clients",[]);const m={};for(const cl of c){m[cl.id]=await ld(`tpi-assess:${cl.id}`,[]);cl.assessmentCount=m[cl.id].length;}setCls(c);setAsm(m);setLoading(false);})();},[]);
  const saveCls=async c=>{setCls(c);await sv("tpi-clients",c);};
  const addCl=async cl=>{await saveCls([...cls,{...cl,assessmentCount:0}]);setAsm(p=>({...p,[cl.id]:[]}));};
  const delCl=async id=>{await saveCls(cls.filter(c=>c.id!==id));setAsm(p=>{const n={...p};delete n[id];return n;});try{localStorage.removeItem(`tpi-assess:${id}`);}catch{}if(sel===id)setSel(null);};
  const saveA=async a=>{const u=[...(asm[a.clientId]||[]),a];setAsm(p=>({...p,[a.clientId]:u}));await sv(`tpi-assess:${a.clientId}`,u);await saveCls(cls.map(c=>c.id===a.clientId?{...c,assessmentCount:u.length}:c));};
  const client=cls.find(c=>c.id===sel);
  if(loading)return(<div style={{minHeight:"100vh",background:"#0e0d0b",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif"}}><div style={{textAlign:"center"}}><div style={{fontSize:28,animation:"pulse 1.5s infinite"}}>⛳</div><div style={{color:G,fontSize:14,marginTop:8}}>読み込み中...</div></div><style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style></div>);
  return(
    <div style={{minHeight:"100vh",background:"#0e0d0b",fontFamily:"'DM Sans',sans-serif",color:"#e8e4dc"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,600;9..40,700;9..40,800&display=swap" rel="stylesheet"/>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
      <div style={{background:"linear-gradient(180deg,rgba(201,169,110,0.06) 0%,transparent 100%)",borderBottom:"1px solid rgba(201,169,110,0.12)",padding:"20px 20px 14px"}}>
        <div style={{maxWidth:720,margin:"0 auto"}}>
          <div style={{fontSize:11,letterSpacing:"0.15em",fontWeight:700,color:G,textTransform:"uppercase",marginBottom:4}}>TPI Body-Swing Connection</div>
          <h1 style={{fontSize:24,fontWeight:800,margin:0,letterSpacing:"-0.02em"}}>フィジカルスクリーニング</h1>
          <div style={{fontSize:12,color:"#6b6560",marginTop:4}}>Disport World ── JSPO-AT / TPI Level 2 ── {cls.length}名</div>
          <div style={{display:"flex",gap:6,marginTop:14}}>{[["clients","クライアント"],["assess","評価"],["history","履歴・処方"]].map(([k,l])=><button key={k} onClick={()=>setPg(k)} style={{...pi(pg===k),padding:"7px 16px",fontSize:13}}>{l}</button>)}</div>
        </div>
      </div>
      <div style={{maxWidth:720,margin:"0 auto",padding:"20px 20px 40px"}}>
        {pg==="clients"&&<Clients cls={cls} sel={sel} onSel={id=>{setSel(id);setPg("history");}} onAdd={addCl} onDel={delCl}/>}
        {pg==="assess"&&(sel&&client?<AssessScreen client={client} onSave={saveA} onCancel={()=>setPg("clients")}/>:(<div style={{textAlign:"center",padding:40}}><div style={{color:"#6b6560",fontSize:14,marginBottom:16}}>評価するクライアントを選択</div><div style={{display:"flex",flexDirection:"column",gap:8,maxWidth:400,margin:"0 auto"}}>{cls.map(c=><button key={c.id} onClick={()=>setSel(c.id)} style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:16,cursor:"pointer",textAlign:"left",color:"#e8e4dc",fontFamily:"inherit"}}><div style={{fontSize:14,fontWeight:600}}>{c.name}</div><div style={{fontSize:11,color:"#6b6560",marginTop:2}}>{c.assessmentCount||0}回</div></button>)}</div>{cls.length===0&&<div style={{color:"#6b6560",fontSize:13,marginTop:10}}>先にクライアント登録</div>}</div>))}
        {pg==="history"&&(sel&&client?<History client={client} asm={asm[sel]||[]}/>:(<div style={{textAlign:"center",padding:40}}><div style={{color:"#6b6560",fontSize:14,marginBottom:16}}>クライアントを選択</div><div style={{display:"flex",flexDirection:"column",gap:8,maxWidth:400,margin:"0 auto"}}>{cls.map(c=><button key={c.id} onClick={()=>setSel(c.id)} style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:16,cursor:"pointer",textAlign:"left",color:"#e8e4dc",fontFamily:"inherit"}}><div style={{fontSize:14,fontWeight:600}}>{c.name}</div><div style={{fontSize:11,color:"#6b6560",marginTop:2}}>{c.assessmentCount||0}回</div></button>)}</div></div>))}
        <div style={{textAlign:"center",padding:"30px 0 10px",fontSize:10,color:"#333",borderTop:"1px solid rgba(255,255,255,0.03)",marginTop:30}}>Disport World × TPI Assessment Manager ── © {new Date().getFullYear()} 株式会社Disport</div>
      </div>
    </div>
  );
}
