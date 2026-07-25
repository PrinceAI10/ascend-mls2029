import React, { useState, useEffect, useRef } from "react";

/* =========================================================================
   ASCEND  -  MLS 2029 (KNUST) study platform
   Framework complete. Content objects get registered in CONTENT below.
   ========================================================================= */

const CSS = `
:root, .ascend-root{
  --bg:#0A0F1A; --bg-2:#0E1524; --bg-3:#121C2E; --raised:#16213A;
  --line:#1B283F; --line-2:#243450;
  --text:#EAF0FA; --text-2:#9DAFC9; --text-3:#63748F;
  --amber:#F5B93F; --amber-2:#FFD583; --amber-dim:rgba(245,185,63,.13);
  --good:#54D08A; --good-dim:rgba(84,208,138,.12);
  --bad:#F0776A; --bad-dim:rgba(240,119,106,.12);
  --sans:'Inter',system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
  --mono:'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  --r:16px; --r-sm:11px;
}
*{box-sizing:border-box;margin:0;padding:0}
html,body{overflow-x:hidden;max-width:100%;margin:0;padding:0;background:var(--bg)}
.ascend-root{min-height:100vh;min-height:100dvh;width:100%;margin:0;padding:0}
.ascend-root.light{
  --bg:#F4F6FA; --bg-2:#FFFFFF; --bg-3:#EDF1F7; --raised:#FFFFFF;
  --line:#E2E7F0; --line-2:#CED7E4;
  --text:#131922; --text-2:#4B5A70; --text-3:#7C8798;
  --amber:#E7A21F; --amber-2:#B4790A; --amber-dim:rgba(231,162,31,.14);
  --good:#1E9E5E; --good-dim:rgba(30,158,94,.12);
  --bad:#D4482F; --bad-dim:rgba(212,72,47,.10);
}
.ascend-root.light .opt.correct{color:var(--text)}
.ascend-root.light .hero{background:linear-gradient(160deg,#E8EDF5 0%,#D5DDE8 60%)}
.ascend-root.light .hero-h .hl{color:#B4790A}
.ascend-root.light .hero-p{color:#4B5A70}
.ascend-root.light .msg.a{background:var(--bg-3);color:var(--text)}
.ascend-root.light .msg.u{background:var(--amber-dim);color:#B4790A}
.ascend-root.light .topbar{background:rgba(244,246,250,.92)}
.ascend-root.light .lesson-p{color:var(--text)}
.ascend-root.light .lesson-q{color:#B4790A}
.ascend-root.light .qa-a{color:var(--text)}
.ascend-root.light .qa-a:before{color:#1E9E5E}
.ascend-root.light .opt{background:var(--bg-2)}
.ascend-root.light .day-tag{color:#B4790A;background:rgba(231,162,31,.14)}
.ascend-root.light .notif-panel,.ascend-root.light .notif-head,.ascend-root.light .notif-item{background:var(--bg-2)}
.ascend-root.light .plan-in,.ascend-root.light .qbox,.ascend-root.light .chat-in input,.ascend-root.light .auth-input{background:var(--bg-2);color:var(--text)}
.ascend-root.light .auth-card{background:var(--bg-2)}
.ascend-root.light .seg{background:var(--bg-3)}
.ascend-root.light .avatar{background:linear-gradient(150deg,#D5DDE8,#B8C4D4);color:#1B1405}
.ascend-root.light .navi{color:#4B5A70}
.ascend-root.light .navi.on{background:rgba(231,162,31,.14);color:#B4790A}
.ascend-root.light .mobile-sidebar{background:var(--bg-2)}
.shell{display:flex;min-height:100vh;max-width:1180px;margin:0 auto;width:100%}
.side{width:244px;flex-shrink:0;border-right:1px solid var(--line);padding:22px 16px;
  position:sticky;top:0;height:100vh;display:flex;flex-direction:column;gap:6px;overflow-y:auto}
.main{flex:1;min-width:0;display:flex;flex-direction:column;max-width:100%;overflow-x:hidden}
.topbar{position:sticky;top:0;z-index:20;background:rgba(10,15,26,.82);
  backdrop-filter:blur(10px);border-bottom:1px solid var(--line);
  padding:13px 22px;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.content{padding:26px 22px 60px;max-width:100%;overflow-x:hidden}
.view{animation:fadeUp .32s cubic-bezier(.2,.7,.3,1) both;max-width:100%;overflow-x:hidden}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.view{animation:none}}
.mobile-sidebar-overlay{position:fixed;inset:0;z-index:100;background:rgba(0,0,0,.5);display:flex;align-items:flex-start}
.mobile-sidebar{width:280px;max-width:80vw;height:100vh;background:var(--bg-2);
  border-right:1px solid var(--line);display:flex;flex-direction:column;padding:8px 0;overflow-y:auto}
.mobile-sidebar .navi{padding:12px 18px;border-radius:0;width:100%;text-align:left;
  background:transparent;color:var(--text-2);font-size:15px;cursor:pointer;display:flex;align-items:center;gap:12px}
.mobile-sidebar .navi:hover{background:var(--bg-3);color:var(--text)}
.mobile-sidebar .navi.on{background:var(--amber-dim);color:var(--amber-2)}
.mobile-sidebar .navi.on svg{color:var(--amber)}
.onlymobile{display:none}
@media (max-width:860px){
  .side{display:none}
  .content{padding:16px 12px 50px}
  .topbar{padding:10px 12px;gap:8px}
  .onlymobile{display:flex}
  .card{padding:14px}
  .grid{grid-template-columns:1fr;gap:12px}
  .g2,.g3{grid-template-columns:1fr}
  .plan-row{flex-direction:column;gap:10px}
  .plan-row>.field{min-width:100%}
  .headline{font-size:32px}
  .notif-panel{margin:40px 12px 0;width:calc(100vw - 24px)}
}
@media(min-width:620px){.g2{grid-template-columns:1fr 1fr}.g3{grid-template-columns:1fr 1fr 1fr}}
@media (max-width:480px){
  .content{padding:12px 8px 40px}
  .headline{font-size:28px}
  .crs-line{gap:4px;padding:8px 0}
  .qbox{width:46px}
}
.brand{display:flex;align-items:center;gap:9px;flex-shrink:0}
.brand-word{font-weight:800;letter-spacing:.02em;font-size:17px}
.brand-sub{font-family:var(--mono);font-size:9.5px;letter-spacing:.24em;color:var(--text-3);
  text-transform:uppercase;margin-top:1px}
.navi{display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:var(--r-sm);
  color:var(--text-2);font-weight:550;font-size:14.5px;transition:background .15s,color .15s;width:100%;text-align:left}
.navi:hover{background:var(--bg-3);color:var(--text)}
.navi.on{background:var(--amber-dim);color:var(--amber-2)}
.navi.on svg{color:var(--amber)}
.chip{display:inline-flex;align-items:center;gap:6px;padding:6px 11px;border-radius:999px;
  background:var(--bg-3);border:1px solid var(--line);font-size:13px;font-weight:600;white-space:nowrap}
.chip .val{font-family:var(--mono)}
.streakchip{background:var(--amber-dim);border-color:rgba(245,185,63,.28);color:var(--amber-2)}
.avatar{width:33px;height:33px;border-radius:50%;background:linear-gradient(150deg,#22314e,#141d30);
  border:1px solid var(--line-2);display:flex;align-items:center;justify-content:center;
  font-weight:750;font-size:13px;color:var(--amber-2);cursor:pointer;flex-shrink:0}
.card{background:var(--bg-2);border:1px solid var(--line);border-radius:var(--r);padding:20px;word-wrap:break-word;overflow:hidden}
.card.hover{transition:border-color .16s,transform .16s,background .16s;cursor:pointer}
.card.hover:hover{border-color:var(--line-2);background:var(--bg-3);transform:translateY(-2px)}
.card-feature{background:linear-gradient(150deg,#13203a,#0d1526)}
.ascend-root.light .card-feature{background:linear-gradient(150deg,#EAEFF7,#DCE4EF)}
.card-feature.hover:hover{background:linear-gradient(150deg,#172a48,#101a2e)}
.ascend-root.light .card-feature.hover:hover{background:linear-gradient(150deg,#E2E9F4,#D2DCEA)}
.grid{display:grid;gap:14px}
.hero{position:relative;overflow:hidden;border:1px solid var(--line);border-radius:20px;
  background:linear-gradient(160deg,#0E1728 0%,#0B1120 60%);padding:30px 26px}
.hero .ridge{position:absolute;inset:0;pointer-events:none;opacity:.9}
.hero-h{font-size:clamp(24px,4.6vw,36px);max-width:16ch;font-weight:800;letter-spacing:-.03em}
.hero-h .hl{color:var(--amber)}
.hero-p{color:var(--text-2);max-width:52ch;margin-top:12px;font-size:15px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:11px 18px;
  border-radius:11px;font-weight:650;font-size:14.5px;transition:transform .12s,filter .15s,background .15s;white-space:nowrap}
.btn:active{transform:translateY(1px)}
.btn-a{background:var(--amber);color:#1B1405}
.btn-a:hover{filter:brightness(1.06)}
.btn-g{background:var(--bg-3);border:1px solid var(--line-2);color:var(--text)}
.btn-g:hover{background:var(--raised)}
.btn-sm{padding:8px 13px;font-size:13.5px;border-radius:9px}
.btn:disabled{opacity:.5;cursor:not-allowed}
.ring{transform:rotate(-90deg);flex-shrink:0}
.bar{height:7px;border-radius:999px;background:var(--bg-3);overflow:hidden}
.bar>i{display:block;height:100%;border-radius:999px;
  background:linear-gradient(90deg,var(--amber),var(--amber-2));transition:width .5s}
.ct-code{font-family:var(--mono);font-size:11px;letter-spacing:.1em;color:var(--text-3)}
.day-tag{font-family:var(--mono);font-size:10px;text-transform:uppercase;letter-spacing:.14em;
  color:var(--amber-2);background:var(--amber-dim);padding:3px 8px;border-radius:6px;font-weight:600;display:inline-block}
.ascent{position:relative;padding-left:34px}
.ascent:before{content:"";position:absolute;left:11px;top:6px;bottom:14px;width:2px;
  background:linear-gradient(var(--line-2),var(--line))}
.node{position:relative;margin-bottom:12px}
.node .dot{position:absolute;left:-33px;top:16px;width:22px;height:22px;border-radius:50%;
  background:var(--bg);border:2px solid var(--line-2);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.node.done .dot{border-color:var(--amber);background:var(--amber)}
.node.active .dot{border-color:var(--amber);box-shadow:0 0 0 4px var(--amber-dim)}
.opt{width:100%;text-align:left;padding:14px 15px;border:1px solid var(--line);border-radius:12px;
  margin-bottom:10px;display:flex;gap:12px;align-items:flex-start;transition:border-color .14s,background .14s;background:var(--bg-2);cursor:pointer}
.opt:hover{border-color:var(--line-2);background:var(--bg-3)}
.opt.sel{border-color:var(--amber);background:var(--amber-dim)}
.opt.correct{border-color:var(--good);background:var(--good-dim)}
.opt.wrong{border-color:var(--bad);background:var(--bad-dim)}
.opt .key{font-family:var(--mono);font-weight:700;color:var(--text-3);flex-shrink:0}
.opt.sel .key,.opt.correct .key{color:var(--amber-2)}
.opt.wrong .key{color:var(--bad)}
.chat{border:1px solid var(--line);border-radius:14px;background:var(--bg-2);display:flex;flex-direction:column;overflow:hidden}
.chat-body{padding:16px;display:flex;flex-direction:column;gap:12px;max-height:420px;overflow-y:auto;min-height:120px}
.msg{max-width:88%;padding:11px 14px;border-radius:13px;font-size:14px;line-height:1.55;white-space:pre-wrap;word-wrap:break-word}
.msg.u{align-self:flex-end;background:var(--amber-dim);border:1px solid rgba(245,185,63,.24);color:var(--amber-2)}
.msg.a{align-self:flex-start;background:var(--bg-3);border:1px solid var(--line)}
.chat-in{display:flex;gap:9px;padding:12px;border-top:1px solid var(--line)}
.chat-in input{flex:1;background:var(--bg);border:1px solid var(--line-2);border-radius:10px;
  padding:11px 13px;color:var(--text);font-family:inherit;font-size:14px;outline:none;min-width:0}
.chat-in input:focus{border-color:var(--amber)}
textarea.pastebox{width:100%;background:var(--bg);border:1px solid var(--line-2);border-radius:11px;
  padding:12px;color:var(--text);font-family:var(--mono);font-size:13px;outline:none;resize:vertical;min-height:110px}
textarea.pastebox:focus{border-color:var(--amber)}
.dots span{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--text-3);
  margin:0 2px;animation:bl 1.2s infinite}
.dots span:nth-child(2){animation-delay:.2s}.dots span:nth-child(3){animation-delay:.4s}
@keyframes bl{0%,60%,100%{opacity:.25}30%{opacity:1}}
.divider{height:1px;background:var(--line);margin:24px 0}
.back{display:inline-flex;align-items:center;gap:6px;color:var(--text-2);font-size:13.5px;font-weight:600;margin-bottom:14px;cursor:pointer}
.back:hover{color:var(--text)}
.note-hint{font-size:12.5px;color:var(--text-3)}
.lesson-step{margin:0 0 26px}
.lesson-q{font-size:16.5px;font-weight:700;color:var(--amber-2);line-height:1.4;
  margin:0 0 10px;display:flex;gap:10px;align-items:baseline}
.lesson-n{font-family:var(--mono);font-size:12px;color:var(--amber);font-weight:600;flex-shrink:0}
.lesson-p{color:var(--text);font-size:15.5px;line-height:1.78;margin:0 0 13px}
.lesson-p:last-child{margin-bottom:0}
.qa-item{border-top:1px solid var(--line);padding:16px 0}
.qa-item:first-child{border-top:none}
.qa-q{font-weight:650;color:var(--text);font-size:15px;line-height:1.5;margin-bottom:7px;
  display:flex;gap:10px;align-items:baseline}
.qa-a{color:var(--text);font-size:15px;line-height:1.7;margin:0}
.qa-a:before{content:"Answer  ";font-family:var(--mono);font-size:11px;letter-spacing:.12em;
  text-transform:uppercase;color:var(--good);font-weight:600}
.tabs{display:inline-flex;gap:4px;background:var(--bg-3);border:1px solid var(--line);
  border-radius:11px;padding:4px;margin:16px 0 4px;flex-wrap:wrap}
.tab{padding:8px 16px;border-radius:8px;font-weight:600;font-size:13.5px;color:var(--text-2);cursor:pointer;transition:all .15s}
.tab.on{background:var(--amber);color:#1B1405}
.auth-wrap{min-height:100vh;min-height:100dvh;display:flex;flex-direction:column;align-items:center;
  justify-content:center;padding:30px 20px;max-width:460px;margin:0 auto;width:100%}
.auth-logo{display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center;margin-bottom:26px}
.auth-mark{display:flex;align-items:flex-end;gap:7px}
.auth-name{font-size:36px;font-weight:800;letter-spacing:.16em;line-height:1}
.auth-tag{color:var(--text-2);font-size:15px;line-height:1.65;max-width:36ch;margin:0}
.auth-tag strong{color:var(--amber-2)}
.auth-card{width:100%;background:var(--bg-2);border:1px solid var(--line);border-radius:18px;padding:22px}
.seg{display:flex;background:var(--bg-3);border:1px solid var(--line);border-radius:12px;padding:4px;margin-bottom:18px}
.seg button{flex:1;padding:11px;border-radius:9px;font-weight:650;font-size:14px;color:var(--text-2);cursor:pointer;transition:all .15s}
.seg button.on{background:var(--amber);color:#1B1405}
.field{display:block;margin-bottom:13px}
.field>span{display:block;font-size:12.5px;color:var(--text-3);margin-bottom:6px;font-weight:600}
.auth-input{width:100%;background:var(--bg-3);border:1px solid var(--line);border-radius:11px;
  padding:14px;color:var(--text);font-size:15px;font-family:inherit}
.auth-input:focus{outline:none;border-color:var(--amber)}
.auth-err{color:var(--bad);font-size:13px;margin:2px 0 12px}
.auth-btn{width:100%;justify-content:center;padding:14px;font-size:15px}
.onb-q{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:15px 0;border-top:1px solid var(--line)}
.onb-q:first-of-type{border-top:none}
.onb-q span{font-size:14.5px;color:var(--text);line-height:1.4}
.yn{display:flex;gap:6px;flex-shrink:0}
.yn button{padding:9px 16px;border-radius:9px;font-weight:650;font-size:13px;border:1px solid var(--line);background:var(--bg-3);color:var(--text-2);cursor:pointer;transition:all .15s}
.yn button.on{background:var(--amber);color:#1B1405;border-color:var(--amber)}
.notif-wrap{position:fixed;inset:0;z-index:60;display:flex;justify-content:flex-end;align-items:flex-start}
.notif-scrim{position:absolute;inset:0;background:rgba(3,7,14,.5);cursor:pointer}
.notif-panel{position:relative;margin:64px 16px 0;width:min(380px,calc(100vw - 32px));max-height:76vh;
  overflow:auto;background:var(--bg-2);border:1px solid var(--line-2);border-radius:16px;
  box-shadow:0 24px 60px rgba(0,0,0,.4)}
.notif-head{display:flex;justify-content:space-between;align-items:center;padding:16px 18px;
  border-bottom:1px solid var(--line);position:sticky;top:0;background:var(--bg-2)}
.notif-item{padding:15px 18px;border-bottom:1px solid var(--line)}
.notif-item:last-child{border-bottom:none}
.notif-dot{position:absolute;top:7px;right:7px;width:8px;height:8px;border-radius:50%;
  background:var(--bad);border:2px solid var(--bg-2)}
.iconbtn{position:relative;width:38px;height:38px;border-radius:10px;border:1px solid var(--line);
  background:var(--bg-2);color:var(--text-2);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0}
.iconbtn:hover{color:var(--text);border-color:var(--line-2)}
.ascend-root{background:var(--bg);color:var(--text);font-family:var(--sans);
  -webkit-font-smoothing:antialiased;line-height:1.55;font-size:15px}
.ascend-root button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit}
.ascend-root h1,.ascend-root h2,.ascend-root h3{margin:0;letter-spacing:-.02em;font-weight:750;line-height:1.2}
.mono{font-family:var(--mono)}
.eyebrow{font-family:var(--mono);text-transform:uppercase;letter-spacing:.18em;
  font-size:11px;color:var(--text-3);font-weight:600}
.plan-in{width:100%;background:var(--bg-3);border:1px solid var(--line);border-radius:11px;
  padding:13px 14px;color:var(--text);font-size:15px;font-family:var(--mono)}
.plan-in:focus{outline:none;border-color:var(--amber)}
.plan-row{display:flex;gap:12px;flex-wrap:wrap}
.plan-row>.field{flex:1;min-width:130px}
.headline{font-family:var(--mono);font-size:40px;font-weight:700;line-height:1;color:var(--amber)}
.crs-line{display:grid;grid-template-columns:1fr auto auto;gap:10px;align-items:center;
  padding:12px 0;border-top:1px solid var(--line)}
.crs-line:first-child{border-top:none}
.qbox{width:58px;background:var(--bg-3);border:1px solid var(--line);border-radius:8px;
  padding:7px 8px;color:var(--text);font-size:13px;font-family:var(--mono);text-align:center}
`;

/* ------------------------------- icons ---------------------------------- */
const I = ({ d, s = 20, fill = "none", w = 1.9, style }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
    strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" style={style}>{d}</svg>
);

const Ic = {
  home: ({ p = 20, style }) => <I s={p} style={style} d={<><path d="M3 10.5 12 4l9 6.5" /><path d="M5 9.5V20h14V9.5" /></>} />,
  book: ({ p = 20, style }) => <I s={p} style={style} d={<><path d="M4 5.5A2 2 0 0 1 6 4h13v15H6.5A2.5 2.5 0 0 0 4 21.5z" /><path d="M4 5.5v16" /></>} />,
  flame: ({ p = 20, style }) => <I s={p} style={style} d={<path d="M12 3c1 3 4 4.2 4 8a4 4 0 1 1-8 0c0-1.4.6-2.4 1.2-3.2C10 9 11 7 12 3z" />} />,
  trophy: ({ p = 20, style }) => <I s={p} style={style} d={<><path d="M7 4h10v4a5 5 0 0 1-10 0z" /><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 20h6M12 14v4" /></>} />,
  file: ({ p = 20, style }) => <I s={p} style={style} d={<><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 13h6M9 17h6" /></>} />,
  chevR: ({ p = 20, style }) => <I s={p} style={style} d={<path d="m9 6 6 6-6 6" />} />,
  check: ({ p = 20, style }) => <I s={p} style={style} w={2.4} d={<path d="m5 12 5 5L20 6" />} />,
  x: ({ p = 20, style }) => <I s={p} style={style} w={2.4} d={<path d="M6 6 18 18M18 6 6 18" />} />,
  play: ({ p = 20, style }) => <I s={p} style={style} fill="currentColor" w={0} d={<path d="M8 5v14l11-7z" />} />,
  ai: ({ p = 20, style }) => <I s={p} style={style} d={<><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z" /><path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z" /></>} />,
  up: ({ p = 20, style }) => <I s={p} style={style} w={2.3} d={<path d="M12 19V6M6 11l6-6 6 6" />} />,
  send: ({ p = 20, style }) => <I s={p} style={style} d={<path d="M4 12 20 4l-6 16-3-7z" />} />,
  clock: ({ p = 20, style }) => <I s={p} style={style} d={<><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></>} />,
  target: ({ p = 20, style }) => <I s={p} style={style} d={<><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3.4" /></>} />,
  star: ({ p = 20, style, fill = "none" }) => <I s={p} style={style} fill={fill} d={<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" />} />,
  bell: ({ p = 20, style }) => <I s={p} style={style} d={<><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" /><path d="M10.5 20a2 2 0 0 0 3 0" /></>} />,
  sun: ({ p = 20, style }) => <I s={p} style={style} d={<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19" /></>} />,
  moon: ({ p = 20, style }) => <I s={p} style={style} d={<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />} />,
  eye: ({ p = 20, style }) => <I s={p} style={style} d={<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>} />,
  eyeOff: ({ p = 20, style }) => <I s={p} style={style} d={<path d="M9.9 5.1A9.5 9.5 0 0 1 12 5c6.5 0 10 7 10 7a15.6 15.6 0 0 1-3.4 3.9M6.5 6.5A15.6 15.6 0 0 0 2 12s3.5 7 10 7a9.5 9.5 0 0 0 4.2-.9M3 3l18 18" />} />,
  menu: ({ p = 20, style }) => <I s={p} style={style} d={<path d="M3 6h18M3 12h18M3 18h18" />} />,
  upload: ({ p = 20, style }) => <I s={p} style={style} d={<><path d="M12 16V4M8 8l4-4 4 4" /><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></>} />,
};

/* --------------------------- password input ----------------------------- */
function PasswordInput({ value, onChange, placeholder, label, id, autoComplete = "current-password" }) {
  const [show, setShow] = useState(false);
  return (
    <label className="field">
      <span>{label}</span>
      <div style={{ position: "relative" }}>
        <input id={id} name={id} className="auth-input" type={show ? "text" : "password"} value={value}
          autoComplete={autoComplete} onChange={onChange} placeholder={placeholder} style={{ paddingRight: "44px" }} />
        <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}
          style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", padding: "4px",
            display: "flex", alignItems: "center" }}>
          {show ? <Ic.eyeOff p={18} /> : <Ic.eye p={18} />}
        </button>
      </div>
    </label>
  );
}

/* ------------------------------- data ----------------------------------- */
const COURSES = [
  { id: "ana", name: "Human Anatomy", code: "SMS 186", day: "Monday" },
  { id: "phy", name: "General Physiology", code: "SMS 184", day: "Tuesday" },
  { id: "bch", name: "Biochemistry", code: "MLS 158", day: "Wednesday" },
  { id: "bio", name: "Biological Chemistry", code: "BIOL 158", day: "Thursday" },
  { id: "psy", name: "Medical Psychology", code: "SMS 154", day: "Friday" },
  { id: "com", name: "Communication Skills II", code: "ENGL 158", day: "Saturday" },
  { id: "lab", name: "Lab Safety & Instrumentation", code: "MLS 152", day: "Sunday" },
];

const TOPICS = {
  ana: [
    "Anatomical Position, Planes & Directional Terms", "Introduction to Histology",
    "Epithelium - Overview", "Membranous (Covering & Lining) Epithelium", "Glandular Epithelium",
    "Connective Tissue", "Muscle Tissue", "Introduction to the Skeletal System",
    "Osteology - Bone as an Organ", "The Axial Skeleton", "The Appendicular Skeleton",
    "Joints of the Body", "Nervous System I - Neurons, Nerves & CNS/PNS",
    "Nervous System II - The CNS & Brain", "Identification & Classification of Micrographs"
  ],
  phy: [
    "General Physiology", "Homeostasis", "Membrane Transport Overview", "Facilitated Diffusion",
    "Active Transport", "Resting Membrane Potential", "Stimulus Frequency and Skeletal Muscle",
    "Skeletal Muscle Length-Tension Relationship", "Muscular System",
    "Nervous System 1 - Neurons, Neuroglia, CNS/PNS", "Nervous System 2 - CNS In Depth",
    "Sensory Physiology", "Endocrine System", "Metabolism and Thyroid Hormone",
    "Reproductive System (Male and Female)", "Integumentary System"
  ],
  bch: [
    "Introduction to Biochemistry", "Enzymes", "Enzyme Inhibition", "Glycolysis",
    "Fructose and Galactose Metabolism", "TCA Cycle", "Electron Transport Chain",
    "Pentose Phosphate Pathway", "Gluconeogenesis", "Glycogenesis", "Glycogenolysis"
  ],
  bio: [
    "Isomerism", "Hemiacetals, Hemiketals, Acetals, Ketals", "Carbohydrates", "Amino Acids",
    "Proteins", "Enzymes", "Enzyme Inhibition", "Lipids", "Nucleic Acids"
  ],
  psy: [
    "Overview of Psychology", "Theoretical Paradigms", "Biological Foundations of Behaviour",
    "Introduction to Psychology", "Learning Theories", "Psychology of Learning", "Motivation",
    "Developmental Psychology", "Personality", "Stress", "Communication in Healthcare"
  ],
  com: [
    "Communication", "Writing as a Process", "Organisational Communication", "Formal Letters",
    "Memorandum", "Report Writing", "Meeting and Minutes", "Presentation Skills", "CV Writing"
  ],
  lab: [
    "Introduction to Lab Instrumentation", "Lab Safety", "Lab Electricals and Safety",
    "Metrics and Measurements", "Taking Mass Measurements with an Electronic Balance", "Pipetting",
    "Microscopy and its Principles", "pH Meter", "Spectrophotometer", "Centrifuge", "Autoclaving",
    "Biosafety Levels", "IPC (Infection Prevention and Control)", "Lab Equipments and Their Uses",
    "Referencing", "Writing Lab Reports"
  ]
};

/* ===================== CONTENT =====================
   Topic objects live here. In a Vite/Next project these can be split into
   content/ana.js etc. and imported; a single-file preview needs them inline. */

const T_ANA_POSITION = {
  courseId: "ana",
  topicIndex: 0,
  title: "Anatomical Position, Planes & Directional Terms",
  minutes: 18,
  note: [
    { q: "Why does anatomy need a fixed starting position at all?",
      body: `Picture a detective at a crime scene. To say where a piece of evidence lies, they need a fixed reference point - a doorway, a wall - otherwise "two metres to the left" means nothing. Anatomy has exactly the same problem, and it solves it the same way.

Here is the problem in one sentence. If a colleague tells you "the wound is above the wrist," what do they mean? If the patient's arm is hanging by their side, "above" points toward the elbow. If the arm is raised overhead, "above" now points toward the hand. Same words, opposite locations. In a hospital that ambiguity is dangerous.

So anatomy fixes the body in one standard posture and describes everything relative to it. This is the anatomical position, and it is the foundation the entire subject rests on. A clinician in Kumasi and a clinician in London describing the same structure will agree completely, because both are describing a body in the same imagined pose.

Crucial insight: the anatomical position is not how a patient is actually lying in front of you. It is the reference frame you mentally place them in before you describe anything. The patient may be flat on a trolley; you still describe their anatomy as though they were standing, palms forward.` },

    { q: "What exactly is the anatomical position, and which detail do students always get wrong?",
      body: `My Socratic question: if you had to define a single posture that removes all ambiguity, what would you have to specify?

(Hint: think about every joint that could rotate and change a relationship.)

The answer is four conditions. The body stands erect, with the head facing forward and eyes looking straight ahead. The feet are flat on the floor, slightly apart, toes pointing forward. The upper limbs hang down at the sides. And - the one that matters most - the palms face forward, so the thumbs point away from the body.

The most common mistake, by a wide margin, is picturing the arms with palms facing the thighs. That is how a person naturally stands, so it feels right, and it is wrong.

Why does one small detail matter so much? Because the forearm can rotate. With palms forward the two forearm bones lie parallel and the thumb sits on the outer side; rotate the palm backwards and the radius crosses over the ulna, and the thumb swings toward the midline. Every statement about which forearm bone is "inner" or "outer," and every description of the hand, depends on which of those two states you assume. The anatomical position locks in one, permanently.

Crucial insight: whenever you read or write an anatomical description, first place the body mentally in this standing, palms-forward pose. Anatomical descriptions are only true in that frame.` },

    { q: "Why exactly three planes, and what is a plane actually for?",
      body: `My Socratic question: the body is a three-dimensional object. To describe a slice through it, a scan, or the direction of a movement, we need to reduce that solid into flat sections. How many genuinely distinct ways can you slice a standing body?

(Hint: think of the three axes of a box - length, width, depth.)

The answer is three, and only three, each at right angles to the other two. These are the cardinal anatomical planes. They are the x, y and z axes of the human body:

The sagittal plane divides the body into right and left. The frontal (coronal) plane divides it into front and back. The transverse (horizontal) plane divides it into upper and lower.

Any plane that is not parallel to one of these three is an oblique plane - a diagonal cut, used in certain scans and surgical approaches.

Crucial insight: planes are not just for anatomists with scalpels. Every CT and MRI image you will ever look at is a stack of slices taken in one of these planes, and the radiologist's report names the plane. Learning the planes is learning to read medical imaging.` },

    { q: "The sagittal plane: and what makes one sagittal plane special?",
      body: `The sagittal plane runs vertically from front to back, dividing the body into a right portion and a left portion.

My Socratic question: is there a special name for the sagittal plane that splits the body into two equal halves?

The answer is yes. A sagittal plane running exactly down the midline is the midsagittal plane, also called the median plane. It produces two mirror halves. Any sagittal plane that is off-centre, producing unequal right and left portions, is a parasagittal plane. The prefix "para-" simply means "beside."

Picture it this way. A blade descending exactly through the middle of your nose, your navel and your spine makes a midsagittal cut. A blade descending through your right eye and right ear makes a parasagittal cut - still sagittal, because it still separates right from left, but no longer down the middle.

Crucial insight: the distinction is clinical, not academic. Midline structures such as the spinal cord, the pituitary gland and the nasal septum are best seen in a midsagittal section, which is exactly why midsagittal MRI is the standard view for the brainstem and spine.` },

    { q: "The frontal plane: why on earth is it called coronal?",
      body: `The frontal plane runs vertically from side to side, dividing the body into an anterior (front) portion and a posterior (back) portion.

My Socratic question: why does this plane carry a second name, "coronal"?

(Hint: the Latin word corona means crown.)

The answer sits on your head. Imagine a crown resting there. The plane that passes down through the line of that crown, from one ear to the other, separates the face from the back of the skull - it splits the body into front and back. That is the coronal plane, and the skull suture running along that same line is called the coronal suture for exactly the same reason.

Picture a guillotine blade descending from directly above you, entering along the crown line and separating you into a front half and a back half.

Crucial insight: sagittal and coronal planes are both vertical, which is precisely why students confuse them. Separate them by what they divide, never by how they look: sagittal divides right from left, coronal divides front from back.` },

    { q: "The transverse plane, and what happens when a cut obeys no plane at all?",
      body: `The transverse plane - also called the horizontal or axial plane - runs parallel to the ground and divides the body into a superior (upper) portion and an inferior (lower) portion.

My Socratic question: what do we call a cut taken at an angle, parallel to none of the three cardinal planes?

The answer is an oblique plane. It is any diagonal section, and it appears in real practice whenever a structure lies at an angle to the body's axes and the imaging or the surgical approach must follow that structure rather than the body's own geometry.

Picture the transverse plane as the cut that turns a body into the round slices you see on a CT scan - which is why radiologists call it the axial view.

Crucial insight: a plane and a directional term are different tools, and they pair up. The transverse plane produces superior and inferior parts; the sagittal plane relates to medial and lateral; the coronal plane produces anterior and posterior. Learn each plane together with the pair of terms it generates, and neither will slip.` },

    { q: "Directional terms: the one rule that governs every single one of them.",
      body: `My Socratic question: what is wrong with the statement "the heart is superior"?

(Hint: superior to what?)

The answer is that the sentence is incomplete, and this is the single most important rule in the whole topic. Directional terms are always comparative. They describe the position of one structure relative to another, never on its own. The formula never changes:

Structure A is [directional term] to Structure B.

"The heart is superior" is meaningless. "The heart is superior to the diaphragm" is precise and true. Examiners award marks for the second and not the first, and every pair of terms below obeys this rule.

Now the first two pairs.

Superior means toward the head; inferior means toward the feet. Their alternatives are cranial (toward the skull) and caudal (toward the tail), used mainly in embryology and comparative anatomy. The nose is superior to the mouth. The stomach is inferior to the heart.

Anterior means toward the front of the body; posterior means toward the back. Their alternatives are ventral (belly side) and dorsal (back side). The sternum is anterior to the heart. The vertebral column is posterior to the oesophagus.

Crucial insight on the ventral and dorsal pair: in a four-legged animal the belly faces the ground and the back faces the sky, so ventral means downward and dorsal means upward. In an upright human, ventral becomes anterior and dorsal becomes posterior. The terms are interchangeable in humans precisely because we stand up - which is why the distinction matters the moment you study any animal that does not.` },

    { q: "Midline, limbs and depth: the three remaining pairs.",
      body: `Medial and lateral take their reference from the midline - the imaginary vertical line running from the top of the head, down through the navel, to the floor. Medial means toward that midline; lateral means away from it. The nose is medial to the eyes. The ears are lateral to the nose.

Proximal and distal are different from every other pair, and my Socratic question is: what can they describe that the others cannot?

(Hint: which parts of the body attach to the trunk at one end and dangle free at the other?)

The answer is the limbs. Proximal and distal are used for the upper and lower limbs, describing position along the length of the limb relative to where it joins the trunk. Proximal means nearer that attachment - the shoulder or the hip. Distal means further from it. The elbow is proximal to the wrist; the fingers are distal to the elbow. The pair also extends naturally to branching structures, so a distal branch of an artery is one further from its origin.

Superficial and deep describe depth from the body surface. Superficial means nearer the surface; deep means further from it, toward the core. The skin is superficial to the muscles; the ribs are deep to the skin of the chest.

Crucial insight: these pairs use three different reference points - the midline, the limb's attachment, and the body surface. Most errors in exams come from applying a pair to the wrong reference. Proximal and distal on the trunk, for instance, is simply wrong; the trunk has no free end.` },

    { q: "Hands and feet: where the palms-forward rule finally pays off.",
      body: `The hand rotates, and that rotation is why the anatomical position insisted on palms facing forward.

In the anatomical position, the thumb lies on the lateral side of the hand and the little finger on the medial side. It follows directly that the radius, the forearm bone on the thumb side, is the lateral bone, and the ulna, on the little-finger side, is the medial bone. Rotate the palm to face backwards and these relationships appear to reverse - which is exactly the ambiguity the standard position abolishes.

Because of that rotation, the hand and foot also carry their own surface terms, which stay true whatever the limb is doing:

For the hand, the palm side is the palmar (or volar) surface and the back of the hand is the dorsal surface. For the foot, the sole is the plantar surface and the upper surface is the dorsum, or dorsal surface. In the foot, the big toe is medial and the little toe is lateral.

My Socratic question: on which surface does a fingernail sit?

The answer is the dorsal surface. Nails lie on the dorsal (back) surface of the distal phalanx of each digit - never the palmar surface, which is why you can press an object with your fingertip pad and feel it, while your nail faces the other way. Say this precisely: the thumbnail lies on the dorsal surface of the distal phalanx of the thumb, superficial to the bone, and lateral to the little fingernail in the anatomical position.

Crucial insight: notice that "superior" is the wrong word for a nail. Superior means toward the head, and with the arms hanging at the sides the nail faces forward and backward, not upward. Choosing the correct pair for the correct axis is the whole skill.` },

    { q: "Consolidation and your final test.",
      body: `Everything in this topic reduces to one habit of thought: fix the body in the standard position, choose the correct axis, then describe one structure relative to another.

Take the heart as the master example. It is inferior to the clavicles and superior to the diaphragm - the vertical axis. It is posterior to the sternum and anterior to the vertebral column - the front-back axis. It lies mostly medial, tilted slightly to the left of the midline, with the lungs lateral to it on both sides - the midline axis. And it is deep to the ribs - the depth axis. Four axes, four pairs of terms, one complete three-dimensional description. No single term did the work; the combination did.

Your cognitive map, in one glance. Position: upright, palms forward. Planes: sagittal splits right from left, coronal splits front from back, transverse splits upper from lower. Terms: superior and inferior for the head-foot axis, anterior and posterior for front and back, medial and lateral relative to the midline, proximal and distal along a limb, superficial and deep for depth, palmar and plantar for the hand and foot surfaces.

Now your final test. A patient has a laceration on the front of the forearm, halfway between the elbow and the wrist, on the thumb side, cutting through skin into the muscle beneath.

Question one: describe the wound's position using the correct directional terms.
Question two: which forearm bone lies nearer the wound, and what is its directional relationship to the other?
Question three: which single plane would a surgeon use to divide that forearm into anterior and posterior halves?

Work them out before reading on.

My answers. One: the wound is on the anterior surface of the forearm, distal to the elbow and proximal to the wrist, on the lateral side, and it extends from superficial skin to the deeper muscle. Two: the radius, which is the lateral bone of the forearm; the ulna is medial to it. Three: the frontal, or coronal, plane, since that is the plane that separates anterior from posterior.

If those came cleanly, you now hold the spatial language the rest of anatomy is written in. Every topic ahead assumes it.` },
  ],
  theory: [
    { q: "State the four features of the correct anatomical position.", a: "The body stands erect with the head and eyes facing forward; the feet are flat on the floor, slightly apart, with toes pointing forward; the upper limbs hang at the sides; and the palms face forward (anteriorly) so the thumbs point laterally." },
    { q: "Why must the palms face forward rather than toward the thighs?", a: "Because the forearm rotates. With palms forward the radius and ulna lie parallel, the thumb is lateral and the little finger medial. If the palm faced backward the radius would cross the ulna and those relationships would appear reversed, making every description of the forearm and hand ambiguous." },
    { q: "Name the three cardinal planes and state what each divides.", a: "The sagittal plane divides the body into right and left; the frontal (coronal) plane divides it into anterior and posterior; the transverse (horizontal or axial) plane divides it into superior and inferior." },
    { q: "Differentiate the midsagittal plane from a parasagittal plane.", a: "The midsagittal (median) plane passes exactly through the midline, producing two equal mirror halves. A parasagittal plane is any sagittal plane off the midline, producing unequal right and left portions." },
    { q: "What is an oblique plane?", a: "Any plane taken at an angle, not parallel to any of the three cardinal planes. It is used when a structure or a surgical or imaging approach lies diagonal to the body's own axes." },
    { q: "State the rule governing the use of all directional terms, and give a correct and an incorrect example.", a: "Directional terms are always comparative: Structure A is [term] to Structure B. Correct: the heart is superior to the diaphragm. Incorrect: the heart is superior, which is meaningless because no reference structure is given." },
    { q: "Explain why ventral and dorsal are interchangeable with anterior and posterior in humans but not in quadrupeds.", a: "Ventral refers to the belly surface and dorsal to the back surface. In an upright human the belly faces forward and the back faces backward, so ventral equals anterior and dorsal equals posterior. In a four-legged animal the belly faces the ground and the back faces upward, so ventral corresponds to inferior and dorsal to superior." },
    { q: "Why are proximal and distal restricted to the limbs, and what is their reference point?", a: "They describe position along the length of a limb relative to its attachment to the trunk - the shoulder or the hip. Proximal is nearer that attachment, distal is further from it. The trunk has no free end, so the pair does not apply there; the terms also extend to branching structures such as arteries relative to their origin." },
    { q: "Give the surface terms for the hand and foot and state which forearm bone is lateral.", a: "The hand has a palmar (volar) surface and a dorsal surface; the foot has a plantar surface (the sole) and a dorsum. In the anatomical position the radius is the lateral forearm bone (thumb side) and the ulna is medial (little-finger side)." },
    { q: "Describe the position of the heart using four different pairs of directional terms.", a: "The heart is superior to the diaphragm and inferior to the clavicles; posterior to the sternum and anterior to the vertebral column; medial, with the lungs lateral to it; and deep to the ribs." },
  ],
  videos: [
    { channel: "Institute of Human Anatomy", title: "Anatomical Terms: Direction and Position", note: "Drawn and defined on real anatomy - directional terms, planes and sections in one pass.", url: "https://www.youtube.com/watch?v=qJ9krjbNgzY" },
    { channel: "EZmed", title: "Easy Tricks for Anatomical Body Planes and Sections", note: "Memory tricks that separate sagittal, coronal and transverse for good.", url: "https://www.youtube.com/watch?v=iQB7baJA9wY" },
    { channel: "Catalyst University", title: "Anatomical Position, Directional Terms and Body Planes", note: "Lab-style run-through, useful right before a practical.", url: "https://www.youtube.com/watch?v=u7WXfp35FWk" },
  ],
  mcqs: [
    { q: "In the correct anatomical position, the palms face:", o: ["Toward the thighs", "Forward (anteriorly)", "Backward (posteriorly)", "Toward each other"], a: 1, w: "The palms face anteriorly, so the thumbs point laterally." },
    { q: "The main purpose of the anatomical position is to:", o: ["Demonstrate correct posture", "Provide a standard reference for describing the body", "Test joint flexibility", "Show how patients lie on a couch"], a: 1, w: "It is a universal reference frame that removes ambiguity from descriptions." },
    { q: "In the anatomical position, the head and eyes are directed:", o: ["To the left", "Upward", "Downward", "Straight ahead"], a: 3, w: "The body is erect with head and eyes facing straight forward." },
    { q: "The plane dividing the body into right and left portions is the:", o: ["Coronal", "Sagittal", "Oblique", "Transverse"], a: 1, w: "The sagittal plane separates right from left." },
    { q: "The plane dividing the body into anterior and posterior portions is the:", o: ["Midsagittal", "Parasagittal", "Transverse", "Frontal (coronal)"], a: 3, w: "The frontal or coronal plane separates front from back." },
    { q: "The plane dividing the body into superior and inferior portions is the:", o: ["Transverse", "Sagittal", "Coronal", "Median"], a: 0, w: "The transverse (horizontal or axial) plane separates upper from lower." },
    { q: "A sagittal plane passing exactly through the midline is called:", o: ["Oblique", "Midsagittal (median)", "Parasagittal", "Coronal"], a: 1, w: "The midsagittal or median plane produces two equal halves." },
    { q: "A sagittal plane that produces unequal right and left portions is:", o: ["Parasagittal", "Transverse", "Frontal", "Median"], a: 0, w: "Para- means beside; a parasagittal plane lies off the midline." },
    { q: "The coronal plane takes its name from a word meaning:", o: ["Side", "Crown", "Cut", "Middle"], a: 1, w: "Latin corona means crown, following the line a crown would sit on." },
    { q: "A section taken at an angle to all three cardinal planes is called:", o: ["Oblique", "Median", "Axial", "Transverse"], a: 0, w: "Any diagonal section not parallel to a cardinal plane is oblique." },
    { q: "The axial view seen on a CT scan corresponds to which plane?", o: ["Coronal", "Sagittal", "Oblique", "Transverse"], a: 3, w: "The transverse plane is also called the axial plane." },
    { q: "Which statement uses directional terms correctly?", o: ["The heart is a superior organ", "The heart is superior", "The heart is superior to the diaphragm", "Superior is the heart"], a: 2, w: "Directional terms are comparative: A is [term] to B." },
    { q: "The nose is ___ to the mouth:", o: ["Inferior", "Deep", "Superior", "Distal"], a: 2, w: "The nose lies nearer the head, so it is superior to the mouth." },
    { q: "The stomach is ___ to the heart:", o: ["Superior", "Lateral", "Inferior", "Anterior"], a: 2, w: "The stomach lies nearer the feet, so it is inferior to the heart." },
    { q: "The term meaning toward the head is:", o: ["Caudal", "Distal", "Ventral", "Cranial"], a: 3, w: "Cranial (superior) means toward the head; caudal means toward the tail." },
    { q: "The sternum is ___ to the heart:", o: ["Anterior", "Posterior", "Inferior", "Deep"], a: 0, w: "The sternum lies in front of the heart, so it is anterior to it." },
    { q: "The vertebral column is ___ to the oesophagus:", o: ["Superior", "Lateral", "Anterior", "Posterior"], a: 3, w: "The vertebral column lies behind the oesophagus." },
    { q: "In humans, the term ventral is equivalent to:", o: ["Superior", "Posterior", "Anterior", "Lateral"], a: 2, w: "In an upright human the belly surface faces forward, so ventral equals anterior." },
    { q: "In a four-legged animal, the dorsal surface faces:", o: ["Upward", "Backward", "Forward", "The ground"], a: 0, w: "In a quadruped the back faces upward, so dorsal corresponds to superior." },
    { q: "Medial and lateral are defined relative to the:", o: ["Body surface", "Midline of the body", "Point of limb attachment", "Head"], a: 1, w: "Medial is toward the midline; lateral is away from it." },
    { q: "The ears are ___ to the nose:", o: ["Medial", "Deep", "Lateral", "Distal"], a: 2, w: "The ears lie further from the midline than the nose." },
    { q: "Proximal and distal are used mainly for the:", o: ["Abdominal cavity", "Head and neck", "Trunk", "Limbs"], a: 3, w: "They describe position along a limb relative to its attachment to the trunk." },
    { q: "The elbow is ___ to the wrist:", o: ["Superficial", "Medial", "Distal", "Proximal"], a: 3, w: "The elbow is nearer the shoulder, the point of attachment, so it is proximal." },
    { q: "The fingers are ___ to the elbow:", o: ["Medial", "Distal", "Superior", "Proximal"], a: 1, w: "The fingers are further from the limb's attachment, so they are distal." },
    { q: "The skin is ___ to the muscles:", o: ["Medial", "Distal", "Superficial", "Deep"], a: 2, w: "Superficial means nearer the body surface." },
    { q: "The ribs are ___ to the skin of the chest:", o: ["Proximal", "Deep", "Superficial", "Lateral"], a: 1, w: "The ribs lie further from the surface, so they are deep to the skin." },
    { q: "In the anatomical position, the thumb lies on the ___ side of the hand:", o: ["Lateral", "Posterior", "Medial", "Plantar"], a: 0, w: "With palms forward the thumb is furthest from the midline, so it is lateral." },
    { q: "Which forearm bone is medial in the anatomical position?", o: ["Ulna", "Radius", "Humerus", "Carpal"], a: 0, w: "The ulna lies on the little-finger side, nearer the midline." },
    { q: "The sole of the foot is correctly called the ___ surface:", o: ["Plantar", "Dorsal", "Volar", "Palmar"], a: 0, w: "Plantar refers to the sole; the upper surface is the dorsum." },
    { q: "A fingernail is located on which surface of the distal phalanx?", o: ["Palmar", "Plantar", "Dorsal", "Medial"], a: 2, w: "Nails lie on the dorsal (back) surface of the distal phalanx." },
  ],
};

/* --------------------------- ana:1 --------------------------- */
const T_ANA_HISTO = {
  courseId: "ana",
  topicIndex: 1,
  title: "Introduction to Histology",
  minutes: 20,
  note: [
    { q: "You have the map of the body. Why do we now need an entirely new science to go smaller?",
      body: `In the last topic you learned the body's coordinate system - its planes, its directions, its spatial language. That was the macro map. Now we shrink the scale, travelling from the visible to the invisible, from the organ down to the cell.

This is histology: the microscopic study of tissues.

My Socratic question: if anatomy already studies the body's structures, why does the microscopic level need its own science, its own tools and its own vocabulary? Why not simply reach for a stronger magnifying glass?

The answer is that a tissue is far more than a heap of cells. It is an organised, cooperative community of cells together with the non-living material they secrete around themselves. To study a community you need tools that reveal relationships, not just objects - and that means specialised preservation, specialised dyes and a specialised language.

Crucial insight: histology is the bridge between the naked-eye anatomy you have just learned and the molecular biology of the cell. Everything above it is anatomy; everything below it is biochemistry. This is the level where structure and function meet visibly, and it is where laboratory medicine actually lives.

So become a microscopic detective. We will move in sequence: first how we manage to see tissue at all, then what we see, and finally how what we see is organised.` },

    { q: "Why can a fresh piece of liver never be studied directly under a microscope?",
      body: `My Socratic question: living tissue is soft, fragile and mostly transparent. Put a fresh piece of liver under a light microscope and you see a blurry, translucent smear. So how do we turn living tissue into a permanent, informative slide?

(Hint: consider three separate problems - the tissue is decaying, it is too soft to slice, and it is colourless.)

The answer is that in routine histology we do not look at living tissue at all. We look at tissue that has been killed, preserved, hardened, sliced and artificially coloured. Each of those words solves one of the problems above.

The whole process is a standardised sequence of four stages, and each stage exists for one reason:

Fixation stops decay. Processing makes the tissue firm enough to cut. Sectioning produces a slice thin enough for light to pass through. Staining supplies the colour that makes structures distinguishable.

Crucial insight: never memorise this pipeline as a list of four words. Memorise it as four problems and their solutions. Examiners love asking why a step exists, and a student who understands the purpose can reason out the step even after forgetting its name.` },

    { q: "Stage one - fixation: what exactly are we racing against?",
      body: `The moment a tissue is removed from the body, its blood supply stops and it begins to destroy itself. Two processes attack it at once.

Autolysis is self-digestion. The cell's own enzymes, normally kept safely inside lysosomes, leak out and begin breaking down the very structures we want to examine. Putrefaction is bacterial decay from outside.

Fixation halts both. The tissue is placed immediately into a chemical preservative, most commonly ten percent buffered formalin, a formaldehyde solution.

How does it work? Formaldehyde forms cross-links between proteins, locking the molecular scaffolding of the cell into place. The structure is effectively frozen in a life-like state, hardened slightly, and made resistant to bacteria.

Crucial insight: fixation must happen fast and the specimen must be small. Fixative diffuses inward slowly, so the centre of a large block may already be autolysing before the chemical reaches it. This is why surgical specimens are cut into small pieces and dropped into formalin at the bedside rather than carried to the laboratory first.` },

    { q: "Stage two - processing: why is water the enemy?",
      body: `My Socratic question: to cut a slice a few micrometres thick we need the tissue to be firm and uniformly supported. Fixed tissue is still soft and still full of water. Why exactly is that water a problem?

(Hint: what would happen if you tried to soak a wet sponge in molten candle wax?)

The answer is that the supporting medium we use is paraffin wax, and wax and water do not mix. Every trace of water must be removed before wax can infiltrate the tissue. That produces a three-step sequence, and the logic of it is a relay:

Dehydration removes the water. The tissue passes through a series of alcohols of increasing concentration - ascending grades of ethanol - so the water is drawn out gradually rather than violently, which would shrink and distort the tissue.

Clearing removes the alcohol. Alcohol will not mix with wax either, so a clearing agent such as xylene is used because it mixes with both alcohol and wax. It acts as the middleman in the relay. It also makes the tissue transparent, which is where the name comes from.

Infiltration and embedding replace the clearing agent with molten paraffin wax, which then cools into a solid block with the tissue suspended inside it.

Crucial insight: the sequence is water, then alcohol, then xylene, then wax - and each step exists only because the next substance will not mix with the previous one. Understand the relay and you will never scramble the order.` },

    { q: "Stage three - sectioning: how thin is thin enough?",
      body: `The hardened wax block is clamped into a microtome, an instrument that works like an extremely precise deli slicer, advancing the block by a fixed amount against a fixed blade.

Routine paraffin sections are cut between about three and ten micrometres thick, most commonly around four to five. To feel that number: a micrometre is one thousandth of a millimetre, and a human hair is roughly seventy micrometres across. A routine section is therefore about a fifteenth of the thickness of a hair.

The sections emerge as a connected ribbon. They are floated on a warm water bath, which relaxes the wax and removes wrinkles, then lifted onto a glass slide.

My Socratic question: why must the section be this thin, rather than merely thin?

The answer is that a light microscope works by transmitting light through the specimen. Too thick, and light cannot pass; you would also be looking through several overlapping layers of cells at once, so nothing would be in focus. A single-cell-thickness slice gives a clean, interpretable image.

Crucial insight: when a diagnosis is needed during surgery, there is no time for processing and wax embedding. Instead the tissue is frozen solid and cut on a cryostat - the frozen section. It trades some quality for speed, giving the surgeon an answer in minutes rather than a day.` },

    { q: "Stage four - staining: turning a colourless slice into an image.",
      body: `The tissue is now preserved and sliced, and it is still almost completely transparent. The nucleus, the cytoplasm and the membranes all look identical. Nothing has been gained until we add contrast.

That is what stains do. They are dyes with a chemical affinity for particular components of the cell, and the routine one - the stain behind virtually every histology image you have ever seen - is haematoxylin and eosin, universally abbreviated H and E.

Haematoxylin is a basic dye. It binds acidic structures, above all the nucleic acids of the nucleus, and colours them dark blue to purple. Structures that take it up are described as basophilic, meaning base-loving.

Eosin is an acidic dye. It binds basic structures, mainly the proteins of the cytoplasm and extracellular fibres, and colours them pink to red. Structures that take it up are described as acidophilic or eosinophilic.

The result is the image every laboratory scientist learns to read instantly: blue-purple nuclei scattered through a sea of pink cytoplasm.

Crucial insight: the naming trips almost everyone, so hold it deliberately. A basophilic structure is not basic - it is acidic, which is precisely why it attracts the basic dye. The suffix -philic tells you what the structure loves, not what it is.

Other stains exist for specific targets. Periodic acid-Schiff, or PAS, marks carbohydrates and basement membranes magenta. Silver impregnation blackens reticular fibres and nerve tissue. But H and E is the default, and everything else is an addition to it.` },

    { q: "What we actually see: why only four tissues, out of two hundred cell types?",
      body: `My Socratic question: the human body contains roughly two hundred distinct cell types. Cataloguing them one by one would be chaos. What logic does nature offer that lets us organise them into something learnable?

(Hint: group by what cells do together, not by what each one is.)

The answer is that every tissue in the body belongs to one of four primary types. Every organ you can name is simply a particular arrangement of these four:

Epithelial tissue is the covering and lining tissue. It covers body surfaces, lines cavities and tubes, and forms glands. Its defining features are that it is packed almost entirely with cells and very little material between them, that every cell has a free apical surface and an attached basal surface resting on a basement membrane, and that it contains no blood vessels of its own - it is nourished by diffusion from below.

Connective tissue is the supporting and connecting tissue, the most abundant and most varied of the four. Bone, cartilage, fat, blood and tendon are all connective tissue. Its defining feature is the opposite of epithelium: the cells are sparse and scattered, and the tissue is dominated by the extracellular matrix they secrete - fibres such as collagen and elastin suspended in a gel-like ground substance.

Muscle tissue is the movement tissue, specialised for contraction. Its cells are elongated fibres packed with the contractile proteins actin and myosin, and it comes in three forms: skeletal, cardiac and smooth.

Nervous tissue is the communication tissue, specialised for generating and transmitting electrical impulses. It comprises neurons, which conduct the impulse, and neuroglia, the supporting cells that nourish, insulate and protect them.

Crucial insight: epithelium and connective tissue are best learned as opposites - many cells and almost no matrix, versus few cells and abundant matrix. That single contrast will carry you through most identification questions you will ever face.` },

    { q: "Classifying epithelium: two questions, one name.",
      body: `Epithelium covers everything, and the skin on your elbow looks nothing like the lining of your cheek or the tubules of your kidney. My Socratic question: how do we tame that diversity into a system that can be reasoned out rather than memorised?

The answer is that every epithelium is named by asking exactly two questions.

The first question is how many cell layers there are. Simple epithelium is a single layer in which every cell touches the basement membrane, suited to diffusion, filtration, secretion and absorption. Stratified epithelium is two or more layers in which only the deepest touches the basement membrane, suited to protection against abrasion.

The second question is the shape of the cells in the apical layer. Squamous cells are flat and scale-like, resembling a fried egg. Cuboidal cells are box-shaped, about as tall as they are wide. Columnar cells are tall rectangles, like a brick standing on its end.

Combine the two answers and the name appears. Simple squamous lines blood vessels and the air sacs of the lungs, where a paper-thin barrier allows diffusion. Simple cuboidal lines kidney tubules and gland ducts for secretion and absorption. Simple columnar lines the stomach and intestines for absorption. Stratified squamous forms the epidermis and the lining of the mouth and oesophagus, for protection.

Two arrangements refuse to fit neatly and must be learned separately. Pseudostratified columnar looks layered because its nuclei sit at different heights, but every cell touches the basement membrane, so it is truly simple; it lines the trachea, usually ciliated. Transitional epithelium, or urothelium, is a stretching epithelium with dome-shaped surface cells, found in the urinary tract.

Crucial insight: for a stratified epithelium the name comes from the apical layer, not the base. Stratified squamous has flat cells on top even though its deeper layers are cuboidal or columnar. Look at the surface first and half of epithelial identification becomes automatic.` },

    { q: "Reading a real slide: the trachea, layer by layer.",
      body: `Tissues never appear alone. An organ is several tissues arranged so that each contributes what it is best at, and the golden rule of histology is that form follows function.

Put a section of tracheal wall under the microscope and read it from the lumen outward.

First, the inner lining. You see tall columnar cells whose nuclei sit at several different heights, yet every cell reaches the basement membrane: pseudostratified columnar epithelium. Fine hair-like projections cover the free surface, and pale, swollen goblet cells are scattered among them. Deduce the function: goblet cells secrete mucus that traps inhaled dust, and the cilia beat in coordinated waves to sweep that mucus upward toward the throat - the mucociliary escalator.

Next, immediately beneath the basement membrane, sparse cells scattered in a matrix of wavy pink fibres: loose connective tissue. Deduce the function: it binds the epithelium to the structures below and carries the blood vessels that feed the avascular epithelium above it.

Deeper still, large pale rings with a glassy matrix, containing small cells sitting in little spaces called lacunae: hyaline cartilage. Deduce the function: the trachea is a tube that must never collapse, yet must bend as the neck moves. Cartilage delivers exactly that combination of rigidity and flexibility.

Finally, the outermost wrap of dense fibrous connective tissue, the adventitia, anchoring the trachea to its neighbours in the neck.

Crucial insight: you have just identified four tissues without memorising a single picture. You asked what mechanical or chemical demand each layer must meet, and the structure answered. That is the entire skill of histology.` },

    { q: "Consolidation and your final test.",
      body: `Your cognitive map for this topic, in four lines.

To see tissue: fix to stop decay, process to make it firm, section to make it thin, stain to make it visible - with H and E colouring nuclei blue and cytoplasm pink.

The four families: epithelium covers and lines, connective tissue supports and connects, muscle contracts, nervous tissue communicates.

To identify an epithelium: count the layers, then read the shape of the apical layer.

The cardinal rule: form follows function. Faced with any unfamiliar slide, ask what demand this location places on its tissue, and the structure will tell you the answer.

Now your final test. Pinch the skin on the back of your hand. You are holding an organ.

Question one: name the four primary tissues contained in that pinch and state what each contributes.
Question two: which specific type of epithelium forms its outer surface, and why that type rather than a simple one?
Question three: the epithelium you named has no blood supply of its own. How does it survive, and what does that tell you about the layer beneath it?

Work them through before reading on.

My answers. One: epithelial tissue forms the tough outer barrier; connective tissue forms the bulk of the dermis, giving strength and elasticity through its collagen; muscle tissue lies deeper and moves the hand; nervous tissue carries the sensation of the pinch to your brain. Two: keratinized stratified squamous epithelium - many layers to resist constant abrasion, and a keratinized surface to waterproof the body, which a single thin layer could never achieve. Three: it survives by diffusion of nutrients from the capillaries in the connective tissue immediately beneath it, which is why every epithelium in the body must rest on vascular connective tissue and can never stand alone.

If those came cleanly, you are ready to stop seeing slides as random splashes of colour and start reading them as functioning blueprints. Epithelium in full detail is next.` },
  ],
  theory: [
    { q: "Define histology and state what distinguishes a tissue from a mere collection of cells.", a: "Histology is the microscopic study of tissues. A tissue is an organised, cooperative group of similar cells together with the extracellular material they secrete, working together to perform a shared function - not simply cells lying side by side." },
    { q: "List the four stages of routine tissue preparation and give the purpose of each.", a: "Fixation halts autolysis and putrefaction and preserves structure; processing (dehydration, clearing, infiltration and embedding) makes the tissue firm enough to cut; sectioning produces a slice thin enough for light to pass through; staining provides the colour contrast that makes structures distinguishable." },
    { q: "What is autolysis, and which fixative is used routinely to prevent it?", a: "Autolysis is self-digestion of tissue by its own released enzymes. Ten percent buffered formalin (a formaldehyde solution) is the routine fixative; it cross-links proteins and locks the structure in a life-like state." },
    { q: "Why must tissue be dehydrated and cleared before embedding in paraffin wax?", a: "Paraffin wax is not miscible with water, so all water must first be removed by ascending grades of alcohol. Alcohol is also not miscible with wax, so a clearing agent such as xylene, which mixes with both, replaces the alcohol before wax infiltration." },
    { q: "State the typical thickness of a routine paraffin section and explain why it must be so thin.", a: "About three to ten micrometres, most often four to five. The light microscope transmits light through the specimen, so a thicker section would block light and superimpose several layers of cells, making a clear focused image impossible." },
    { q: "What is a frozen section and when is it used?", a: "Tissue is frozen and cut on a cryostat rather than processed and embedded in wax. It is used when a rapid diagnosis is needed, typically during surgery, giving an answer in minutes at the cost of some image quality." },
    { q: "Explain the action of haematoxylin and eosin, and define basophilic and acidophilic.", a: "Haematoxylin is a basic dye that binds acidic components, chiefly nuclear nucleic acids, staining nuclei blue to purple; such structures are called basophilic. Eosin is an acidic dye that binds basic components, chiefly cytoplasmic proteins and extracellular fibres, staining them pink; such structures are called acidophilic or eosinophilic." },
    { q: "Name the four primary tissue types and the defining feature of each.", a: "Epithelial tissue covers and lines, is highly cellular with little matrix, polarised and avascular. Connective tissue supports and connects, with sparse cells and abundant extracellular matrix. Muscle tissue contracts, its elongated fibres packed with actin and myosin. Nervous tissue communicates, comprising neurons and supporting neuroglia." },
    { q: "State the two criteria used to classify epithelium and the rule for naming a stratified epithelium.", a: "The number of cell layers (simple, one layer with every cell on the basement membrane; or stratified, two or more layers) and the shape of the apical cells (squamous, cuboidal or columnar). A stratified epithelium is named for the shape of its most superficial layer, not its base." },
    { q: "Why is pseudostratified epithelium described as false-layered, and where is it typically found?", a: "Its nuclei lie at different heights, giving the appearance of several layers, but every cell contacts the basement membrane, so it is genuinely a single layer. It lines the trachea and upper airways, usually ciliated and containing goblet cells." },
  ],
  videos: [
    { channel: "The Noted Anatomist", title: "Histology Fundamentals: The Complete Overview", note: "Thorough 38-minute walk-through covering H and E staining, then all four tissues in order.", url: "https://www.youtube.com/watch?v=0U5J_unEM-Q" },
    { channel: "Corporis", title: "Intro to Histology: The Four Tissue Types", note: "Short and clear - ideal for separating the four tissues when they first look identical.", url: "https://www.youtube.com/watch?v=S59JwFCjNhc" },
    { channel: "Histology Video Course", title: "Four Basic Tissue Types of Histology (Epithelium 1 of 7)", note: "Opening lecture of a structured series that continues into epithelium in detail.", url: "https://www.youtube.com/watch?v=H28sK9E6hGY" },
  ],
  mcqs: [
    { q: "Histology is best defined as the study of:", o: ["Body cavities", "Organs by dissection", "Disease processes", "Tissues under the microscope"], a: 3, w: "Histology is the microscopic study of tissues." },
    { q: "A tissue consists of:", o: ["Extracellular material only", "Cells together with their extracellular material", "A group of organs", "Cells only"], a: 1, w: "A tissue is similar cells plus the matrix they secrete, sharing a function." },
    { q: "The correct order of routine tissue preparation is:", o: ["Section, fix, stain, embed", "Fix, process, section, stain", "Embed, stain, fix, section", "Stain, fix, section, embed"], a: 1, w: "Fixation, then processing, then sectioning, then staining." },
    { q: "The main purpose of fixation is to:", o: ["Halt autolysis and preserve structure", "Cut thin sections", "Add colour to the tissue", "Dissolve fat"], a: 0, w: "Fixation stops self-digestion and bacterial decay, preserving life-like structure." },
    { q: "Self-digestion of tissue by its own enzymes is called:", o: ["Putrefaction", "Fixation", "Autolysis", "Clearing"], a: 2, w: "Autolysis is breakdown by the cell's own released enzymes." },
    { q: "The routine fixative used in histology is:", o: ["Paraffin wax", "Xylene", "Absolute alcohol", "Ten percent buffered formalin"], a: 3, w: "Buffered formalin is the standard fixative; it cross-links proteins." },
    { q: "Formaldehyde preserves tissue mainly by:", o: ["Cross-linking proteins", "Freezing water", "Dissolving lipids", "Removing water"], a: 0, w: "It forms cross-links between proteins, locking the structure in place." },
    { q: "Dehydration of tissue is achieved using:", o: ["Xylene", "Distilled water", "Molten wax", "Ascending grades of alcohol"], a: 3, w: "Increasing concentrations of ethanol draw the water out gradually." },
    { q: "The clearing agent used before wax infiltration is typically:", o: ["Eosin", "Xylene", "Ethanol", "Formalin"], a: 1, w: "Xylene is miscible with both alcohol and wax, acting as the middleman." },
    { q: "Tissue is embedded in paraffin wax in order to:", o: ["Make it firm enough for thin sectioning", "Preserve its enzymes", "Stain it evenly", "Make it transparent"], a: 0, w: "Wax gives the uniform firmness required for clean thin sections." },
    { q: "Water must be removed before embedding because:", o: ["Water dissolves the stain", "Water blocks light", "Wax is not miscible with water", "Water causes autolysis"], a: 2, w: "Paraffin wax and water do not mix, so all water must be replaced first." },
    { q: "Sections of embedded tissue are cut using a:", o: ["Microtome", "Spectrophotometer", "Cryostat only", "Centrifuge"], a: 0, w: "The microtome slices the hardened wax block into thin ribbons." },
    { q: "A routine paraffin section is approximately:", o: ["50 micrometres thick", "3 to 10 micrometres thick", "3 to 10 millimetres thick", "1 centimetre thick"], a: 1, w: "Routine sections are about three to ten micrometres, most often four to five." },
    { q: "One micrometre is equal to:", o: ["One centimetre", "One tenth of a millimetre", "One thousandth of a millimetre", "One millimetre"], a: 2, w: "A micrometre is 10 to the minus 3 millimetres." },
    { q: "For rapid diagnosis during surgery, tissue is cut on a:", o: ["Cryostat after freezing", "Microtome after wax embedding", "Grinding wheel", "Vibrating sieve"], a: 0, w: "Frozen sections on a cryostat give an intra-operative answer in minutes." },
    { q: "Tissue sections must be stained because unstained tissue is:", o: ["Radioactive", "Chemically unstable", "Nearly transparent and colourless", "Too thick"], a: 2, w: "Stains supply the contrast that transparent tissue lacks." },
    { q: "The routine stain in histology is:", o: ["Ziehl-Neelsen", "Gram stain", "India ink", "Haematoxylin and eosin"], a: 3, w: "H and E is the standard routine stain." },
    { q: "Haematoxylin is a basic dye that stains the nucleus:", o: ["Blue to purple", "Green", "Pink", "Yellow"], a: 0, w: "It binds acidic nucleic acids, colouring nuclei blue-purple." },
    { q: "Eosin is an acidic dye that stains the cytoplasm:", o: ["Blue", "Colourless", "Black", "Pink to red"], a: 3, w: "Eosin binds basic cytoplasmic proteins, staining them pink." },
    { q: "A structure described as basophilic:", o: ["Repels all dyes", "Stains pink with eosin", "Is basic in nature", "Takes up basic dyes because it is acidic"], a: 3, w: "Basophilic means base-loving: the structure is acidic and attracts the basic dye." },
    { q: "Carbohydrates and basement membranes are best demonstrated by:", o: ["Haematoxylin alone", "The periodic acid-Schiff (PAS) reaction", "Eosin alone", "Congo red"], a: 1, w: "PAS stains carbohydrates and basement membranes magenta." },
    { q: "Reticular fibres and nerve tissue are classically demonstrated by:", o: ["PAS", "Gram stain", "Silver impregnation", "Eosin"], a: 2, w: "Silver stains blacken reticular fibres and nerve tissue." },
    { q: "The four primary tissue types are:", o: ["Simple, stratified, cuboidal, columnar", "Skin, muscle, nerve, gland", "Epithelial, connective, muscle, nervous", "Bone, blood, fat, cartilage"], a: 2, w: "All body structures are built from these four tissues." },
    { q: "The tissue that covers surfaces, lines cavities and forms glands is:", o: ["Epithelial", "Connective", "Nervous", "Muscle"], a: 0, w: "Epithelium is the covering, lining and glandular tissue." },
    { q: "The tissue characterised by sparse cells in abundant extracellular matrix is:", o: ["Nervous", "Connective", "Epithelial", "Muscle"], a: 1, w: "Connective tissue is matrix-dominated; epithelium is cell-dominated." },
    { q: "Epithelium is avascular, which means it obtains nutrients by:", o: ["Lymphatic vessels within it", "Diffusion from underlying connective tissue", "Its own capillaries", "Direct arterial supply"], a: 1, w: "Having no vessels of its own, it is fed by diffusion from the tissue below." },
    { q: "Simple epithelium is defined as:", o: ["A single layer with every cell on the basement membrane", "Two or more layers", "Cells of identical shape", "Epithelium without cilia"], a: 0, w: "Simple means one layer, with every cell contacting the basement membrane." },
    { q: "Which epithelium best suits an area exposed to constant abrasion?", o: ["Simple columnar", "Stratified squamous", "Simple squamous", "Simple cuboidal"], a: 1, w: "Multiple layers of flat surface cells resist wear, as in the epidermis." },
    { q: "A stratified epithelium is named according to the shape of cells in its:", o: ["Basal layer", "Basement membrane", "Middle layer", "Most superficial layer"], a: 3, w: "Stratified epithelia are named for the apical, most superficial layer." },
    { q: "Pseudostratified epithelium appears layered because:", o: ["It has cilia on its surface", "Only the top cells are stained", "Nuclei lie at different heights though all cells reach the basement membrane", "Cells are stacked in two rows"], a: 2, w: "Staggered nuclei fake a layered look; it is truly a single layer." },
  ],
};

/* --------------------------- phy:0 --------------------------- */
const T_PHY_GENERAL = {
  courseId: "phy",
  topicIndex: 0,
  title: "General Physiology",
  minutes: 20,
  note: [
    { q: "A perfect heart, perfect tissue, and still dead. What is missing?",
      body: `You now hold two of the three foundations. Anatomy gave you the hardware - the structures and the spatial language to describe them. Histology gave you the materials - the tissues those structures are built from. Physiology gives you the third thing, and it is the one that matters most.

My Socratic question: suppose I hand you a flawlessly dissected human heart. You section it, stain it, and under the microscope you find beautiful, undamaged cardiac muscle. Every structure is intact. Is it alive? What single ingredient separates a cadaver from a living being?

The answer is function - the coordinated, ceaseless movement of ions, molecules and energy across membranes. Structure is necessary but it is never sufficient. A dead heart contains every protein a living heart contains; what it has lost is the gradients, the traffic, the activity.

Crucial insight: physiology is not a body of facts, it is the study of mechanisms. It asks how and why, never merely what. Every question in this course reduces to the same form - what moves, what drives it, and what would happen if it stopped.

That single habit of thought is what this topic installs. Anatomy is the hardware, histology the materials, physiology the software running on both.` },

    { q: "Where does physiology actually take place? The internal environment.",
      body: `My Socratic question: your cells are not in contact with the outside world. A cell deep in your liver has never met air, food or water. What is it actually bathed in, and why does that matter?

(Hint: think about what a single-celled organism in a pond has, that a liver cell must be given.)

The answer is that every cell in your body is bathed in a private internal ocean - a watery environment the body creates and controls. Claude Bernard, the father of modern physiology, called it the milieu interieur, the internal environment, and he argued that its constancy is the condition of free life.

That fluid is distributed in compartments, and the division matters enormously.

The intracellular fluid is the fluid inside cells. It accounts for roughly two thirds of total body water and is the larger compartment by some margin.

The extracellular fluid is everything outside cells, roughly one third of body water, and it has two main parts: the interstitial fluid that directly bathes the cells, and the blood plasma travelling inside vessels. Materials pass between plasma and interstitial fluid across capillary walls.

Crucial insight: because cells only ever touch interstitial fluid, the body does not need to control the outside world - it only needs to control that thin film of fluid. This is the reason the lungs, kidneys, gut and circulation exist. They are all servants of one job: keeping the internal ocean within limits the cells can survive.` },

    { q: "The boundary: what exactly is the cell membrane made of?",
      body: `Every cell is a busy city that must import raw materials, export waste, generate energy and reproduce. For any of that to be controlled, the city needs a wall with gates.

My Socratic question: what kind of boundary can separate a watery inside from a watery outside, yet still let selected substances through?

The answer is the cell membrane, and its design is elegant. The backbone is a phospholipid bilayer - a double sheet of lipid molecules. Each phospholipid has a hydrophilic, water-loving phosphate head and two hydrophobic, water-fearing fatty acid tails.

Drop these molecules into water and they arrange themselves automatically. The heads turn outward toward the water on both sides; the tails hide from water by facing each other in the middle. The result is a sheet with a greasy core sandwiched between two water-friendly surfaces.

That greasy core is the whole point. It repels water-soluble substances, which means ions, glucose and amino acids cannot simply drift in or out. Meanwhile lipid-soluble substances pass through easily.

Cholesterol is wedged among the phospholipids, regulating how fluid the membrane is, and a sugar coating called the glycocalyx sits on the outer surface, involved in recognition and protection.

Crucial insight: the membrane is described as a fluid mosaic because it is not a rigid wall. Its components drift laterally within the sheet, like objects floating on a two-dimensional sea. It is fluid, and it is a mosaic of many different molecules.` },

    { q: "The gates: what do membrane proteins actually do?",
      body: `A pure lipid bilayer would be a sealed bag, and a sealed bag cannot live. What makes the membrane intelligent rather than merely impermeable is the proteins embedded in it.

They fall into four functional groups, and it is worth holding them by job rather than by name.

Channels are tunnels selective for particular ions - sodium channels, potassium channels, calcium channels. When open, the ion flows through passively, driven by its gradient. Many are gated, meaning they open only in response to a voltage change or a chemical signal.

Carriers, or transporters, physically bind a molecule and change shape to move it across. Because binding sites are limited, carriers can be saturated - which channels cannot.

Receptors are antennae. They bind chemical messengers such as hormones or neurotransmitters and trigger changes inside the cell without the messenger itself entering.

Enzymes catalyse reactions right at the membrane surface, often as part of a signalling cascade.

Crucial insight: the lipid decides what cannot cross; the proteins decide what can. Almost every drug you will ever study in pharmacology acts on one of these proteins - a channel, a carrier, a receptor or a membrane enzyme. Learn this list well and half of pharmacology already has a home to sit in.` },

    { q: "Why does the cell fight so hard to stay unequal?",
      body: `My Socratic question: why does physiology obsess over the concentrations of sodium, potassium and calcium? Why not simply let them even out on both sides of the membrane?

(Hint: what happens to a battery when both terminals reach the same charge?)

The answer is that life is a fight against equilibrium. The intracellular and extracellular fluids are deliberately kept chemically different:

Potassium is high inside the cell and low outside. Sodium is high outside and low inside. Calcium is very low inside and far higher outside.

Each difference is a concentration gradient, and every gradient is stored energy - exactly like a charged battery or water held behind a dam. Substances always tend to move down a gradient toward equilibrium, and the cell continuously spends energy pushing them back.

Crucial insight: equilibrium is death. A cell at true equilibrium with its surroundings has no stored potential, cannot fire an impulse, cannot contract, cannot pump. Every nerve signal and every heartbeat is the controlled release of energy that was banked by building these gradients in the first place.

That is also why calcium is kept so extraordinarily low inside cells. A steep inward gradient means that opening a calcium channel for a fraction of a second produces a sharp, unmistakable internal signal - which is precisely how muscle contraction and neurotransmitter release are triggered.` },

    { q: "Who pays for the gradients? The sodium-potassium pump.",
      body: `Gradients leak. Sodium constantly seeps into the cell and potassium constantly seeps out, so a gradient maintained against that leak must be actively rebuilt, continuously, for as long as the cell lives.

The protein that does it is the sodium-potassium pump, formally the sodium-potassium ATPase, and it is arguably the single most important protein in physiology.

Its cycle is fixed and worth memorising exactly: for each molecule of ATP consumed, it pumps three sodium ions out of the cell and two potassium ions in.

My Socratic question: three positive charges leave and only two enter. What must that do to the charge inside the cell?

The answer is that it makes the interior slightly more negative than it would otherwise be. The pump is therefore described as electrogenic - it generates a small direct contribution to the membrane voltage, on top of its much larger role in maintaining the gradients themselves.

The cost is enormous. Estimates put the share of the body's resting ATP consumption devoted to this one pump at roughly a quarter to a third. A large fraction of everything you eat is spent simply keeping sodium out and potassium in.

Crucial insight: the pump does three jobs at once. It maintains the gradients that power nerve and muscle activity, it powers secondary active transport, and by removing more solute than it brings in it draws water out osmotically, controlling cell volume. Stop the pump and cells swell and die - which is exactly how the poison ouabain and the drug digoxin exert their effects.` },

    { q: "Moving things across: the two great categories.",
      body: `All transport across the membrane divides into two families, and the dividing line is one question: does it need energy?

Passive transport requires no energy from the cell because the substance moves down its gradient, from high concentration to low. Simple diffusion is the direct route for small, lipid-soluble molecules such as oxygen, carbon dioxide and steroid hormones, which dissolve straight through the lipid core. Facilitated diffusion is the assisted route for larger or charged particles such as glucose and ions, which cross only through a channel or a carrier - but still downhill. Osmosis is the diffusion of water itself, largely through water channels called aquaporins, moving toward the side with more solute.

Active transport requires energy because the substance moves against its gradient, from low concentration to high. Primary active transport spends ATP directly, as the sodium-potassium pump does. Secondary active transport spends no ATP directly; instead it lets sodium flow downhill into the cell and harnesses that flow to drag another substance uphill - the way glucose is absorbed from the gut and reclaimed in the kidney.

Bulk transport moves material too large for any protein, wrapping it in membrane vesicles. Endocytosis brings material in, exocytosis expels it.

Crucial insight: notice that secondary active transport is only possible because the sodium-potassium pump built the sodium gradient in the first place. The pump pays once, and the cell then spends that stored energy repeatedly. Every glucose molecule you absorb from your gut is ultimately paid for by that pump.` },

    { q: "The pay-off: why a cell has a voltage at all.",
      body: `Everything so far converges here. Because ions are unequally distributed and the membrane is selectively permeable, the inside of a resting cell carries a negative electrical charge relative to the outside. In a typical neuron this resting membrane potential is about minus seventy millivolts.

My Socratic question: the sodium gradient and the potassium gradient are both steep. Why is the resting cell negative inside rather than positive?

(Hint: a gradient can only produce movement if there is an open route.)

The answer is permeability. At rest, the membrane is far more permeable to potassium than to sodium, because potassium leak channels are open while most sodium channels are shut. Potassium therefore drifts out of the cell down its gradient, carrying positive charge with it and leaving behind large negatively charged proteins that cannot follow. The interior becomes negative.

The resting potential is thus set mainly by potassium, maintained by the sodium-potassium pump, and it is not a resting state at all in the everyday sense - it is a poised, energy-consuming readiness.

Crucial insight: this is why nerve and muscle are called excitable tissues. They sit permanently charged, like a loaded spring, so that opening the right channels for a millisecond releases a signal that travels. Physiology in later topics - the action potential, muscle contraction, the heartbeat - is simply the story of what that stored charge is used for.` },

    { q: "How a physiologist actually thinks.",
      body: `Before consolidating, take the method itself, because it is more valuable than any single fact in this topic.

Faced with any physiological process, ask four questions in order.

What is moving? Usually an ion, a molecule, water, or an electrical charge.

What drives it? A concentration gradient, a pressure difference, an electrical gradient, or ATP spent directly.

What route does it take? Straight through the lipid, through a channel, on a carrier, by pump, or in a vesicle.

What is it for? Every mechanism serves the stability of the internal environment in the end.

My Socratic question: apply that to a single fact - glucose is absorbed from the gut lumen into the intestinal cell against its concentration gradient. What is moving, what drives it, and by what route?

The answer: glucose is moving; the driving force is not ATP acting on glucose directly but the sodium gradient, with sodium flowing downhill into the cell; the route is a carrier that binds both at once, that is, secondary active transport. And the purpose is to keep blood glucose supplied to every cell in the body.

Crucial insight: memorising that "SGLT1 is a sodium-glucose cotransporter" earns one mark. Reasoning it out from the four questions lets you answer any variant of the question the examiner invents, including ones about drugs that block it.` },

    { q: "Consolidation and your final test.",
      body: `Your cognitive map for general physiology, in five lines.

The subject: physiology is the study of mechanism - how function is produced and maintained.

The setting: cells live in the internal environment, with fluid divided into intracellular and extracellular compartments, the latter containing interstitial fluid and plasma.

The boundary: the fluid mosaic membrane, a phospholipid bilayer whose greasy core blocks water-soluble substances, studded with channels, carriers, receptors and enzymes.

The stored energy: gradients, with potassium high inside and sodium and calcium high outside, maintained by the sodium-potassium pump moving three sodium out and two potassium in per ATP.

The pay-off: a resting membrane potential of about minus seventy millivolts, set mainly by potassium permeability, which makes nerve and muscle excitable.

Now your final test. A patient's cells are exposed to a toxin that completely blocks the sodium-potassium ATPase.

Question one: what happens to the intracellular sodium and potassium concentrations over the following minutes?
Question two: what happens to the cell's volume, and why?
Question three: intestinal absorption of glucose fails as well, even though the toxin does not touch the glucose carrier. Explain why.

Work them through before reading on.

My answers. One: sodium accumulates inside the cell and potassium is lost from it, because the leaks continue while the pump that opposed them has stopped, so both gradients collapse toward equilibrium. Two: the cell swells and may burst. The pump normally exports three particles for every two it imports, so stopping it raises intracellular solute; water then follows osmotically into the cell. Three: glucose absorption depends on secondary active transport, which is powered by sodium flowing down its gradient into the cell. With the pump stopped there is no sodium gradient left to flow down, so the cotransporter has nothing to drive it - the energy for glucose uptake was always coming from the pump indirectly.

If those three came cleanly, you are thinking like a physiologist rather than reciting one. Homeostasis, the principle all of this ultimately serves, is next.` },
  ],
  theory: [
    { q: "Distinguish anatomy, histology and physiology in one sentence each.", a: "Anatomy studies the structures of the body and their spatial relationships; histology studies the microscopic structure of tissues; physiology studies function - the mechanisms by which living structures work and maintain stability." },
    { q: "What is the internal environment, and who introduced the concept?", a: "The internal environment, or milieu interieur, is the extracellular fluid that bathes every cell of the body. Claude Bernard introduced the concept, arguing that the constancy of this internal environment is the condition of free and independent life." },
    { q: "Name the body fluid compartments and their approximate proportions.", a: "Intracellular fluid, inside cells, is about two thirds of total body water. Extracellular fluid is about one third and consists of interstitial fluid surrounding the cells and blood plasma within vessels." },
    { q: "Describe the fluid mosaic model of the cell membrane.", a: "The membrane is a phospholipid bilayer with hydrophilic heads facing the aqueous surfaces and hydrophobic tails facing inward, forming a lipid core. Proteins, cholesterol and surface carbohydrates are distributed through it like a mosaic, and the components move laterally, giving the membrane fluidity." },
    { q: "List the four functional classes of membrane protein and give the role of each.", a: "Channels form selective pores through which ions move passively; carriers bind a substance and change shape to move it across and can be saturated; receptors bind chemical messengers and trigger intracellular responses; membrane enzymes catalyse reactions at the membrane surface." },
    { q: "State the normal distribution of sodium, potassium and calcium across the cell membrane, and explain why gradients matter.", a: "Potassium is high inside the cell; sodium and calcium are high outside. Each difference is a concentration gradient that stores potential energy, and the controlled release of that energy underlies nerve impulses, muscle contraction and secondary active transport. Equilibrium would mean no stored energy and therefore no function." },
    { q: "Describe the stoichiometry and significance of the sodium-potassium pump.", a: "For each ATP hydrolysed it moves three sodium ions out of the cell and two potassium ions in. It maintains the sodium and potassium gradients, contributes directly to the negative membrane potential because it is electrogenic, powers secondary active transport, and regulates cell volume by keeping intracellular solute low." },
    { q: "Differentiate passive from active transport and give two examples of each.", a: "Passive transport moves a substance down its gradient and requires no cellular energy - for example simple diffusion of oxygen and facilitated diffusion of glucose. Active transport moves a substance against its gradient and requires energy - for example primary active transport by the sodium-potassium pump and secondary active transport of glucose coupled to sodium." },
    { q: "Explain how secondary active transport works and why it still ultimately depends on ATP.", a: "A carrier couples the downhill movement of sodium into the cell to the uphill movement of another substance such as glucose. No ATP is spent by that carrier, but the sodium gradient it exploits was itself created by the ATP-consuming sodium-potassium pump, so the energy is borrowed indirectly." },
    { q: "Why is the interior of a resting neuron negative, and what is the approximate value?", a: "About minus seventy millivolts. At rest the membrane is far more permeable to potassium than to sodium, so potassium leaves down its gradient carrying positive charge out while large negatively charged intracellular proteins remain, leaving the interior negative. The sodium-potassium pump maintains the gradients underlying this." },
  ],
  videos: [
    { channel: "Ninja Nerd", title: "Cell Membrane Structure and Function", note: "Detailed lecture on membrane lipids, proteins and the glycocalyx, with animation.", url: "https://www.youtube.com/watch?v=iYG_GH1EdEc" },
    { channel: "Ninja Nerd", title: "Passive and Active Transport, Endocytosis and Exocytosis", note: "Full walk-through of every transport mechanism, timestamped by type.", url: "https://www.youtube.com/watch?v=xHIzfkbj82U" },
    { channel: "Ninja Nerd", title: "Cell Biology: Cell Structure and Function", note: "Foundational organelle lecture if you want the cell itself revised first.", url: "https://www.youtube.com/watch?v=t5DvF5OVr1Y" },
  ],
  mcqs: [
    { q: "Physiology is best defined as the study of:", o: ["Disease processes", "Function and the mechanisms producing it", "Body structures", "Microscopic tissues"], a: 1, w: "Physiology studies how the body functions - mechanism, not structure alone." },
    { q: "The term milieu interieur, the internal environment, was introduced by:", o: ["Andreas Vesalius", "Louis Pasteur", "Claude Bernard", "William Harvey"], a: 2, w: "Claude Bernard described the constancy of the internal environment as the condition of free life." },
    { q: "The fluid that directly bathes most body cells is the:", o: ["Blood plasma", "Interstitial fluid", "Intracellular fluid", "Cerebrospinal fluid"], a: 1, w: "Cells are surrounded by interstitial fluid, a component of extracellular fluid." },
    { q: "Approximately what fraction of total body water is intracellular?", o: ["One tenth", "One third", "Nine tenths", "Two thirds"], a: 3, w: "About two thirds of body water lies inside cells." },
    { q: "The two components of extracellular fluid are:", o: ["Lymph and cytosol", "Cytosol and plasma", "Plasma and intracellular fluid", "Interstitial fluid and blood plasma"], a: 3, w: "Extracellular fluid comprises interstitial fluid and blood plasma." },
    { q: "The structural backbone of the cell membrane is the:", o: ["Phospholipid bilayer", "Protein network", "Cholesterol layer", "Glycocalyx"], a: 0, w: "A double sheet of phospholipids forms the membrane framework." },
    { q: "In the phospholipid bilayer, the fatty acid tails are:", o: ["Hydrophilic and face outward", "Hydrophobic and face inward", "Charged and face outward", "Hydrophobic and face outward"], a: 1, w: "The water-fearing tails point inward, away from water on both sides." },
    { q: "The membrane is described as a fluid mosaic because:", o: ["It is rigid and uniform", "It is made only of lipid", "It dissolves in water", "Its components are varied and move laterally"], a: 3, w: "It is a mosaic of many molecules that drift within the plane of the sheet." },
    { q: "Which substance crosses the lipid bilayer most easily by simple diffusion?", o: ["Sodium ions", "Oxygen", "Glucose", "Amino acids"], a: 1, w: "Small, lipid-soluble, uncharged molecules such as oxygen pass straight through." },
    { q: "Cholesterol in the cell membrane primarily:", o: ["Catalyses reactions", "Regulates membrane fluidity", "Transports ions", "Binds hormones"], a: 1, w: "Cholesterol sits among the phospholipids and modulates fluidity." },
    { q: "A membrane protein that binds a chemical messenger and triggers an internal response is a:", o: ["Pump", "Channel", "Receptor", "Carrier"], a: 2, w: "Receptors act as antennae for hormones and neurotransmitters." },
    { q: "Unlike channels, carrier proteins:", o: ["Never move solutes", "Require no binding site", "Can become saturated", "Are always gated"], a: 2, w: "Carriers have limited binding sites, so their transport rate can saturate." },
    { q: "Which ion is normally at high concentration inside the cell?", o: ["Sodium", "Calcium", "Chloride", "Potassium"], a: 3, w: "Potassium is the major intracellular cation; sodium and calcium are higher outside." },
    { q: "Intracellular calcium is kept extremely low mainly so that:", o: ["A brief calcium entry makes a sharp internal signal", "Calcium can be excreted", "Cells stay acidic", "The membrane stays fluid"], a: 0, w: "A steep inward gradient lets a brief channel opening produce a clear signal." },
    { q: "A concentration gradient across a membrane represents:", o: ["Chemical equilibrium", "Membrane damage", "Wasted energy", "Stored potential energy"], a: 3, w: "Gradients bank energy, like water behind a dam, ready to be released." },
    { q: "For each ATP used, the sodium-potassium pump moves:", o: ["3 sodium out and 2 potassium in", "2 sodium out and 3 potassium in", "1 sodium out and 1 potassium in", "3 potassium out and 2 sodium in"], a: 0, w: "Three sodium ions out, two potassium ions in, per ATP hydrolysed." },
    { q: "The sodium-potassium pump is described as electrogenic because it:", o: ["Moves equal charge both ways", "Uses electrical energy", "Moves more positive charge out than in", "Transports only anions"], a: 2, w: "Exporting three positives while importing two leaves the interior more negative." },
    { q: "Blocking the sodium-potassium pump causes cells to:", o: ["Swell", "Stop dividing only", "Shrink", "Become more negative inside"], a: 0, w: "Intracellular solute rises, so water follows osmotically and the cell swells." },
    { q: "Which process requires no cellular energy?", o: ["Exocytosis", "Endocytosis", "Primary active transport", "Facilitated diffusion"], a: 3, w: "Facilitated diffusion is passive; the solute still moves down its gradient." },
    { q: "The diffusion of water across a membrane is called:", o: ["Osmosis", "Dialysis", "Filtration", "Pinocytosis"], a: 0, w: "Osmosis is water movement toward the side with higher solute concentration." },
    { q: "Water crosses membranes rapidly mainly through:", o: ["Aquaporins", "Sodium channels", "Carrier proteins", "The glycocalyx"], a: 0, w: "Aquaporins are dedicated water channels." },
    { q: "Simple and facilitated diffusion differ in that facilitated diffusion:", o: ["Moves solute against the gradient", "Requires a membrane protein", "Requires ATP", "Only moves gases"], a: 1, w: "Facilitated diffusion needs a channel or carrier but remains passive." },
    { q: "Secondary active transport of glucose is powered by:", o: ["ATP acting on the glucose carrier", "The potassium gradient", "Osmotic pressure", "The sodium gradient"], a: 3, w: "Sodium moving downhill into the cell drags glucose uphill on a shared carrier." },
    { q: "If the sodium-potassium pump stops, secondary active transport fails because:", o: ["Glucose becomes insoluble", "ATP is no longer produced", "The sodium gradient collapses", "The carrier is destroyed"], a: 2, w: "Without the pump there is no sodium gradient left to supply the driving force." },
    { q: "Movement of large particles into the cell within a vesicle is called:", o: ["Endocytosis", "Exocytosis", "Filtration", "Osmosis"], a: 0, w: "Endocytosis brings material in; exocytosis expels it." },
    { q: "Release of neurotransmitter from a nerve ending occurs by:", o: ["Osmosis", "Simple diffusion", "Exocytosis", "Primary active transport"], a: 2, w: "Vesicles fuse with the membrane and expel their contents by exocytosis." },
    { q: "The resting membrane potential of a typical neuron is approximately:", o: ["Minus 700 millivolts", "Plus 70 millivolts", "Minus 70 millivolts", "Zero millivolts"], a: 2, w: "The interior rests at about minus seventy millivolts relative to the exterior." },
    { q: "The resting membrane potential is negative inside mainly because:", o: ["Calcium is pumped inward", "The membrane is far more permeable to potassium than sodium", "Water leaves the cell", "Sodium leaks into the cell"], a: 1, w: "Potassium leaves through open leak channels, leaving negative proteins behind." },
    { q: "Nerve and muscle are described as excitable tissues because they:", o: ["Can rapidly change their membrane potential to generate signals", "Contain more mitochondria", "Never reach equilibrium", "Lack a resting potential"], a: 0, w: "They sit charged and ready, so opening channels briefly produces a travelling signal." },
    { q: "For a cell, reaching true equilibrium with its surroundings would mean:", o: ["Increased ATP production", "Loss of all stored energy, and death", "Faster nerve conduction", "Maximum efficiency"], a: 1, w: "Equilibrium means no gradients, therefore no stored energy and no function." },
  ],
};
/* --------------------------- bch:0 --------------------------- */
const T_BCH_INTRO = {
  courseId: "bch",
  topicIndex: 0,
  title: "Introduction to Biochemistry",
  minutes: 20,
  note: [
    { q: "What is biochemistry and why does it matter?", body: "Biochemistry is the study of the molecules of life. It bridges anatomy and physiology by explaining the molecular mechanisms behind structure and function." },
    { q: "What are the four major classes of biomolecules?", body: "Proteins (enzymes, structure), carbohydrates (energy), lipids (membranes, energy storage), and nucleic acids (DNA, RNA, ATP)." },
    { q: "Why is water essential for life?", body: "Water is the solvent for all biochemical reactions, the transport medium, and a reactant in hydrolysis and dehydration synthesis." },
    { q: "What is pH and why must blood pH be constant?", body: "pH measures hydrogen ion concentration. Blood pH is maintained at 7.35-7.45 because enzymes require this range to function." },
    { q: "What is an enzyme and how does it work?", body: "Enzymes are proteins that lower activation energy, allowing reactions to occur at body temperature. They are specific and reusable." },
    { q: "What is ATP and why is it important?", body: "ATP is adenosine triphosphate, the energy currency of the cell. It stores energy in phosphate bonds and powers cellular work." },
    { q: "What is metabolism and how is it controlled?", body: "Metabolism is catabolism (breakdown) and anabolism (building). Insulin promotes anabolism; glucagon promotes catabolism." },
    { q: "What is the central dogma of molecular biology?", body: "DNA → RNA → Protein. DNA stores information, RNA copies it, protein executes it." },
    { q: "Why is the cell compartmentalised?", body: "Compartmentalisation allows different functions to occur simultaneously and efficiently in different organelles." },
    { q: "Consolidation: what are the key concepts?", body: "Four biomolecules, water as solvent, pH balance, enzymes as catalysts, ATP as energy, metabolism controlled by hormones, DNA → RNA → Protein, and compartmentalisation." }
  ],
  theory: [
    { q: "Define biochemistry.", a: "The study of the molecules and chemical reactions of life." },
    { q: "Name the four major classes of biomolecules.", a: "Proteins, carbohydrates, lipids, nucleic acids." },
    { q: "Why must blood pH be maintained?", a: "Enzymes require a narrow pH range to function." },
    { q: "What is an enzyme?", a: "A protein that catalyses reactions by lowering activation energy." },
    { q: "What is ATP?", a: "The energy currency of the cell." },
    { q: "Distinguish catabolism and anabolism.", a: "Catabolism breaks down; anabolism builds." },
    { q: "What is the central dogma?", a: "DNA → RNA → Protein." },
    { q: "What is the function of mitochondria?", a: "Produce ATP through oxidative phosphorylation." }
  ],
  videos: [
    { channel: "Khan Academy", title: "Introduction to Biochemistry", url: "https://www.youtube.com/watch?v=H8WJ2KENlK0" },
    { channel: "Amoeba Sisters", title: "Biomolecules", url: "https://www.youtube.com/watch?v=YO244P1e9YM" },
    { channel: "Ninja Nerd", title: "Enzyme Biochemistry", url: "https://www.youtube.com/watch?v=ok9esVzN8Vg" }
  ],
  mcqs: [
    { q: "Biochemistry is the study of:", o: ["Tissues", "Body structure", "The chemistry of life", "Organs"], a: 2, w: "Biochemistry is the study of the chemistry of life." },
    { q: "Which is NOT a major biomolecule?", o: ["Proteins", "Carbohydrates", "Lipids", "Nucleotides"], a: 3, w: "Nucleotides are monomers of nucleic acids." },
    { q: "Proteins are polymers of:", o: ["Nucleotides", "Amino acids", "Monosaccharides", "Fatty acids"], a: 1, w: "Proteins are made of amino acids." },
    { q: "The primary function of carbohydrates is:", o: ["Storage of genetic information", "Catalysis", "Energy", "Membrane formation"], a: 2, w: "Carbohydrates are the primary energy source." },
    { q: "Lipids are important for:", o: ["Energy storage", "Membrane formation", "Both", "Catalysis"], a: 2, w: "Lipids both store energy and form membranes." },
    { q: "The molecule that stores genetic information is:", o: ["Protein", "Carbohydrate", "DNA", "ATP"], a: 2, w: "DNA stores genetic information." },
    { q: "Water makes up approximately what % of the body?", o: ["20%", "40%", "60%", "80%"], a: 2, w: "The body is about 60% water." },
    { q: "Normal blood pH is approximately:", o: ["7.0", "7.4", "8.0", "6.4"], a: 1, w: "Blood pH is about 7.4." },
    { q: "Enzymes are primarily:", o: ["Carbohydrates", "Lipids", "Proteins", "Nucleic acids"], a: 2, w: "Enzymes are proteins." },
    { q: "The active site of an enzyme:", o: ["Binds substrate", "Stores energy", "Replicates DNA", "Transports molecules"], a: 0, w: "The active site binds the substrate." },
    { q: "ATP stands for:", o: ["Adenosine triphosphate", "Adenine triphosphate", "Adenosine diphosphate", "Adenine triphosphatase"], a: 0, w: "ATP is adenosine triphosphate." },
    { q: "Catabolism is the:", o: ["Building of molecules", "Breakdown of molecules", "Storage of energy", "Synthesis of DNA"], a: 1, w: "Catabolism breaks down molecules." },
    { q: "Anabolism is the:", o: ["Breakdown of molecules", "Building of molecules", "Release of energy", "Oxidation of glucose"], a: 1, w: "Anabolism builds molecules." },
    { q: "Insulin promotes:", o: ["Catabolism", "Anabolism", "Gluconeogenesis", "Glycogenolysis"], a: 1, w: "Insulin promotes anabolism (storage)." },
    { q: "Glucagon promotes:", o: ["Anabolism", "Catabolism", "Glycogenesis", "Protein synthesis"], a: 1, w: "Glucagon promotes catabolism." },
    { q: "DNA is transcribed into:", o: ["Protein", "mRNA", "tRNA", "rRNA"], a: 1, w: "DNA is transcribed into mRNA." },
    { q: "The organelle that produces ATP is:", o: ["Nucleus", "Ribosome", "Mitochondria", "Golgi"], a: 2, w: "Mitochondria produce ATP." },
    { q: "The organelle that contains DNA is:", o: ["Mitochondria", "Nucleus", "Ribosome", "Lysosome"], a: 1, w: "The nucleus contains DNA." },
    { q: "Lysosomes function to:", o: ["Synthesise proteins", "Digest waste", "Store lipids", "Produce ATP"], a: 1, w: "Lysosomes digest waste." },
    { q: "The central dogma is:", o: ["Protein → RNA → DNA", "DNA → RNA → Protein", "RNA → DNA → Protein", "Protein → DNA → RNA"], a: 1, w: "DNA → RNA → Protein." }
  ]
};

/* --------------------------- bio:0 --------------------------- */
const T_BIO_AMINO_ACIDS = {
  courseId: "bio",
  topicIndex: 0,
  title: "Amino Acids: The Building Blocks of Life",
  minutes: 20,
  note: [
    { q: "What are amino acids?", body: "Amino acids are the monomers of proteins. There are 20 standard amino acids, each with an amino group, a carboxyl group, and a variable R group." },
    { q: "What determines an amino acid's properties?", body: "The R group (side chain) determines whether it is hydrophobic or hydrophilic, charged or uncharged." },
    { q: "What is a peptide bond?", body: "A covalent bond formed between the carboxyl group of one amino acid and the amino group of another, releasing water." },
    { q: "What are the four levels of protein structure?", body: "Primary (sequence), secondary (alpha helix, beta sheet), tertiary (3D shape), and quaternary (subunits)." },
    { q: "What is denaturation?", body: "Loss of a protein's native structure, caused by heat, pH, or chaotropic agents." },
    { q: "What is the difference between a peptide and a protein?", body: "Peptides are short chains (<50 amino acids); proteins are longer and fold into complex structures." },
    { q: "What are the functions of proteins?", body: "Enzymes, structural support, transport, defence, hormones, and contraction." },
    { q: "What are essential amino acids?", body: "Nine amino acids that cannot be synthesised and must come from the diet." }
  ],
  theory: [
    { q: "What are amino acids?", a: "The monomers that form proteins." },
    { q: "How many standard amino acids are there?", a: "20." },
    { q: "What determines an amino acid's properties?", a: "The R group." },
    { q: "What is a peptide bond?", a: "A bond between the carboxyl and amino groups of two amino acids." },
    { q: "What are the four levels of protein structure?", a: "Primary, secondary, tertiary, quaternary." },
    { q: "What is denaturation?", a: "Loss of native protein structure." },
    { q: "How many essential amino acids are there?", a: "9." }
  ],
  videos: [
    { channel: "Ninja Nerd", title: "Amino Acids Classification", url: "https://www.youtube.com/watch?v=6S_1EQQCgvY" },
    { channel: "Khan Academy", title: "Introduction to Proteins", url: "https://www.youtube.com/watch?v=1Cv5q3Kp3MQ" },
    { channel: "Amoeba Sisters", title: "Proteins", url: "https://www.youtube.com/watch?v=KJfVYsl6bRg" }
  ],
  mcqs: [
    { q: "Amino acids are the monomers of:", o: ["Carbohydrates", "Lipids", "Proteins", "Nucleic acids"], a: 2, w: "Amino acids form proteins." },
    { q: "How many standard amino acids are there?", o: ["10", "20", "30", "40"], a: 1, w: "There are 20 standard amino acids." },
    { q: "The variable group in an amino acid is the:", o: ["Amino group", "Carboxyl group", "R group", "Hydrogen"], a: 2, w: "The R group varies." },
    { q: "A peptide bond is formed between:", o: ["Amino and carboxyl groups", "Two amino groups", "Two carboxyl groups", "R groups"], a: 0, w: "The peptide bond links the amino and carboxyl groups." },
    { q: "The primary structure of a protein is:", o: ["Amino acid sequence", "3D shape", "Alpha helix", "Subunits"], a: 0, w: "Primary structure is the sequence." },
    { q: "The alpha helix is an example of:", o: ["Primary structure", "Secondary structure", "Tertiary structure", "Quaternary structure"], a: 1, w: "The alpha helix is secondary structure." },
    { q: "How many essential amino acids are there?", o: ["9", "11", "20", "12"], a: 0, w: "There are 9 essential amino acids." },
    { q: "A complete protein contains:", o: ["All essential amino acids", "Only non-essential amino acids", "No amino acids", "Only one amino acid"], a: 0, w: "A complete protein has all essential amino acids." },
    { q: "Which is a source of complete protein?", o: ["Rice", "Beans", "Eggs", "Wheat"], a: 2, w: "Eggs are a complete protein." },
    { q: "Denaturation is the:", o: ["Loss of protein structure", "Synthesis of protein", "Joining of amino acids", "Formation of peptide bonds"], a: 0, w: "Denaturation is loss of structure." }
  ]
};

/* --------------------------- psy:0 --------------------------- */
const T_PSY_OVERVIEW = {
  courseId: "psy",
  topicIndex: 0,
  title: "Overview of Psychology",
  minutes: 20,
  note: [
    { q: "What is psychology?", body: "The scientific study of mind and behaviour. Essential for understanding the whole patient." },
    { q: "What are the four major perspectives?", body: "Biological (brain, genetics), psychodynamic (unconscious), behavioural (learning), cognitive (thinking)." },
    { q: "What is the biopsychosocial model?", body: "Health is influenced by biological, psychological, and social factors interacting." },
    { q: "How do we study the mind?", body: "Through experiments, case studies, correlational studies, surveys, and brain imaging." },
    { q: "What is consciousness?", body: "Subjective awareness of self and environment, arising from brain activity." },
    { q: "What is learning?", body: "A relatively permanent change in behaviour from experience." },
    { q: "What is stress?", body: "The response to perceived threats; chronic stress damages health." },
    { q: "What is mental health?", body: "The ability to function effectively and feel well." }
  ],
  theory: [
    { q: "Define psychology.", a: "The scientific study of mind and behaviour." },
    { q: "Name the four major perspectives.", a: "Biological, psychodynamic, behavioural, cognitive." },
    { q: "What is the biopsychosocial model?", a: "Biological, psychological, and social factors influence health." },
    { q: "What is the stress response?", a: "Increases heart rate, blood pressure, and blood glucose." },
    { q: "What is CBT?", a: "Cognitive-behavioural therapy focuses on changing thoughts and behaviours." }
  ],
  videos: [
    { channel: "CrashCourse", title: "The Biopsychosocial Model", url: "https://www.youtube.com/watch?v=W0E3PwJp2iY" },
    { channel: "Khan Academy", title: "Stress and Health", url: "https://www.youtube.com/watch?v=W9x4JMSyLpY" },
    { channel: "Simply Psychology", title: "Cognitive Behavioural Therapy", url: "https://www.youtube.com/watch?v=Do5x-SQR1S8" }
  ],
  mcqs: [
    { q: "Psychology is the:", o: ["Study of the brain", "Scientific study of mind and behaviour", "Study of mental illness", "Study of social interactions"], a: 1, w: "Psychology studies mind and behaviour." },
    { q: "The biopsychosocial model includes:", o: ["Biological factors", "Psychological factors", "Social factors", "All of the above"], a: 3, w: "All three factors are included." },
    { q: "The stress response is also called:", o: ["Relaxation response", "Fight-or-flight", "Homeostatic response", "Immune response"], a: 1, w: "The fight-or-flight response." },
    { q: "Chronic stress is associated with:", o: ["Improved health", "Cardiovascular disease", "Better immunity", "Increased energy"], a: 1, w: "Chronic stress causes cardiovascular disease." },
    { q: "The most evidence-based therapy is:", o: ["Psychodynamic", "CBT", "Humanistic", "Gestalt"], a: 1, w: "CBT has the strongest evidence." }
  ]
};

/* --------------------------- com:0 --------------------------- */
const T_COM_OVERVIEW = {
  courseId: "com",
  topicIndex: 0,
  title: "Communication: The Foundation of Professional Practice",
  minutes: 20,
  note: [
    { q: "Why is communication important?", body: "Poor communication is a leading cause of errors. Good communication saves lives." },
    { q: "What are the components of communication?", body: "Sender, message, channel, receiver, feedback." },
    { q: "What is the difference between verbal and non-verbal?", body: "Verbal uses words; non-verbal includes body language, tone, and eye contact." },
    { q: "What are the Seven Cs?", body: "Clarity, conciseness, concreteness, correctness, coherence, completeness, courtesy." },
    { q: "What is active listening?", body: "Listening with full attention and intention." },
    { q: "What is the role of empathy?", body: "Builds trust and rapport; patients feel understood." },
    { q: "What are barriers to communication?", body: "Language, culture, stress, noise, emotions." },
    { q: "Why document communication?", body: "It is the permanent record; if not documented, it was not done." }
  ],
  theory: [
    { q: "Why is communication important?", a: "Essential for patient safety and quality care." },
    { q: "Name the components of communication.", a: "Sender, message, channel, receiver, feedback." },
    { q: "List the Seven Cs.", a: "Clarity, conciseness, concreteness, correctness, coherence, completeness, courtesy." },
    { q: "Define active listening.", a: "Listening with full attention and intention." },
    { q: "What is the SBAR tool?", a: "Situation, Background, Assessment, Recommendation." }
  ],
  videos: [
    { channel: "Stanford Medicine", title: "The Power of Empathy", url: "https://www.youtube.com/watch?v=DjTz5RvvF7A" },
    { channel: "NHS England", title: "SBAR Communication Tool", url: "https://www.youtube.com/watch?v=T6lPc8ZJIKo" },
    { channel: "Erik Qualman", title: "Communication Skills in Healthcare", url: "https://www.youtube.com/watch?v=7lE5c7gFzPk" }
  ],
  mcqs: [
    { q: "Communication is essential for:", o: ["Patient safety", "Team coordination", "Quality care", "All of the above"], a: 3, w: "Communication is essential for all." },
    { q: "The sender is:", o: ["The person receiving", "The person initiating", "The message", "The channel"], a: 1, w: "The sender initiates the message." },
    { q: "Non-verbal communication includes:", o: ["Words", "Body language", "Writing", "Speaking"], a: 1, w: "Body language is non-verbal." },
    { q: "The Seven Cs include all EXCEPT:", o: ["Clarity", "Complexity", "Conciseness", "Courtesy"], a: 1, w: "Complexity is not one of the Seven Cs." },
    { q: "Active listening involves:", o: ["Hearing only", "Full attention", "Planning a reply", "Talking more"], a: 1, w: "Active listening is full attention." }
  ]
};

/* --------------------------- lab:0 --------------------------- */
const T_LAB_SAFETY = {
  courseId: "lab",
  topicIndex: 0,
  title: "Lab Safety: The Foundation of Laboratory Practice",
  minutes: 20,
  note: [
    { q: "Why is safety the most important skill?", body: "Without safety, there is no science. Safety culture protects everyone." },
    { q: "What are the main hazards?", body: "Biological (pathogens), chemical (corrosives, flammables), physical (sharps, equipment), ergonomic (repetitive tasks)." },
    { q: "What are standard precautions?", body: "All blood, body fluids, and tissues are potentially infectious. Use PPE and hand hygiene." },
    { q: "What is the chain of infection?", body: "Infectious agent → reservoir → portal of exit → mode of transmission → portal of entry → susceptible host." },
    { q: "What PPE should be worn?", body: "Gloves, gown, mask, eye protection as needed for the procedure." },
    { q: "What is the correct sharps handling?", body: "Never recap needles. Place directly in sharps containers." },
    { q: "When should hand hygiene be performed?", body: "Before and after patient/specimen contact, after removing gloves." },
    { q: "How to manage a chemical spill?", body: "Assess risk, protect yourself, contain, clean up, dispose properly, document." }
  ],
  theory: [
    { q: "Why is safety important?", a: "Protects staff, patients, and the community." },
    { q: "Name the four hazard categories.", a: "Biological, chemical, physical, ergonomic." },
    { q: "What are standard precautions?", a: "All samples are potentially infectious." },
    { q: "List the chain of infection.", a: "Agent, reservoir, exit, transmission, entry, host." },
    { q: "What is the most important infection control measure?", a: "Hand hygiene." },
    { q: "What is the correct sharps handling?", a: "No recapping; place directly in sharps containers." }
  ],
  videos: [
    { channel: "CDC", title: "Standard Precautions", url: "https://www.youtube.com/watch?v=8A9xXWvKjXE" },
    { channel: "NHS", title: "Sharps Safety", url: "https://www.youtube.com/watch?v=3w7g7uU6X7k" },
    { channel: "SafetyVideos", title: "Laboratory Safety Training", url: "https://www.youtube.com/watch?v=6r5sUJpQ0fA" }
  ],
  mcqs: [
    { q: "The most important component of lab safety is:", o: ["A safety manual", "A culture of safety", "Inspections", "Gloves"], a: 1, w: "A culture of safety is most important." },
    { q: "Biological hazards include:", o: ["Corrosive chemicals", "Flammable solvents", "Blood and body fluids", "Heavy lifting"], a: 2, w: "Blood and body fluids are biological hazards." },
    { q: "Standard precautions apply to:", o: ["Only patients with known infections", "All patients", "Only blood samples", "Only surgical patients"], a: 1, w: "Standard precautions apply to all patients." },
    { q: "The single most important infection control measure is:", o: ["Wearing gloves", "Hand hygiene", "Wearing a mask", "Using a biosafety cabinet"], a: 1, w: "Hand hygiene is the most important measure." },
    { q: "Needles should never be:", o: ["Disposed of in a sharps container", "Recapped after use", "Used once", "Handled with gloves"], a: 1, w: "Needles should never be recapped." },
    { q: "The chain of infection has how many links?", o: ["4", "5", "6", "7"], a: 2, w: "The chain has six links." },
    { q: "PPE stands for:", o: ["Personal Protective Equipment", "Professional Practice Equipment", "Patient Protection Equipment", "Personal Practice Equipment"], a: 0, w: "PPE is Personal Protective Equipment." },
    { q: "The PASS method for fire extinguishers:", o: ["Pull, Aim, Squeeze, Sweep", "Push, Aim, Squeeze, Spray", "Pull, Apply, Squeeze, Spray", "Push, Aim, Spray, Sweep"], a: 0, w: "PASS is Pull, Aim, Squeeze, Sweep." }
  ]
};
/* Registry: add each built topic here. */
const CONTENT = {
  "ana:0": T_ANA_POSITION,
  "ana:1": T_ANA_HISTO,
  "ana:2": T_ANA_EPI_OVERVIEW,
  "ana:3": T_ANA_EPI_MEMB,
  "phy:0": T_PHY_GENERAL,
  "bch:0": T_BCH_INTRO,
  "bio:0": T_BIO_AMINO_ACIDS,
  "psy:0": T_PSY_OVERVIEW,
  "com:0": T_COM_OVERVIEW,
  "lab:0": T_LAB_SAFETY,
};

const contentFor = (cid, tid) => CONTENT[`${cid}:${tid}`] || null;
const builtInCourse = (cid) => Object.keys(CONTENT).filter((k) => k.startsWith(cid + ":")).length;
const totalBuilt = () => Object.keys(CONTENT).length;

const DAILY = {
  1: { courseId: "ana", q: "The anatomical plane that separates anterior from posterior is the:", o: ["Sagittal", "Coronal (frontal)", "Transverse", "Median"], a: 1, w: "Coronal/frontal separates front from back." },
  2: { courseId: "phy", q: "Homeostasis primarily refers to:", o: ["Rapid cell division", "Maintenance of a stable internal environment", "Production of ATP", "Movement of muscles"], a: 1, w: "It is the maintenance of a steady internal environment." },
  3: { courseId: "bch", q: "The monomer of a protein is the:", o: ["Nucleotide", "Amino acid", "Monosaccharide", "Fatty acid"], a: 1, w: "Proteins are polymers of amino acids." },
  4: { courseId: "bio", q: "Two amino acids are joined by a:", o: ["Hydrogen bond", "Peptide (amide) bond", "Glycosidic bond", "Ester bond"], a: 1, w: "A peptide bond links amino acids." },
  5: { courseId: "psy", q: "Classical conditioning was first described by:", o: ["B.F. Skinner", "Ivan Pavlov", "Sigmund Freud", "Jean Piaget"], a: 1, w: "Pavlov demonstrated classical conditioning." },
  6: { courseId: "com", q: "Which is NOT one of the Seven Cs of communication?", o: ["Clarity", "Conciseness", "Complexity", "Courtesy"], a: 2, w: "Complexity is not one of the Seven Cs." },
  0: { courseId: "lab", q: "Standard precautions assume that:", o: ["Only sick patients are infectious", "All blood and body fluids are potentially infectious", "Gloves give full protection", "Handwashing is optional"], a: 1, w: "All blood and body fluids are potentially infectious." }
};

const BOARD_SEED = [];
const RANKS = [
  { name: "Bronze", min: 0, c: "#C08A5B" },
  { name: "Silver", min: 200, c: "#C6D2E0" },
  { name: "Gold", min: 500, c: "#F5B93F" },
  { name: "Elite", min: 1000, c: "#8FE3C6" }
];
const rankOf = (xp) => {
  let r = RANKS[0];
  for (const t of RANKS) if (xp >= t.min) r = t;
  const next = RANKS.find((t) => t.min > xp);
  return { ...r, next };
};
const courseById = (id) => COURSES.find((c) => c.id === id);
const todayKey = () => new Date().toISOString().slice(0, 10);
const shift = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

/* Storage works in both places:
   - inside the Claude artifact preview, window.storage exists
   - on your deployed site (Netlify/Vercel) it does not, so we use localStorage
   Without this fallback, nothing would save once deployed. */
const hasWS = () => typeof window !== "undefined" && !!window.storage;
const store = {
  async get(k) {
    try {
      if (hasWS()) { const r = await window.storage.get(k); return r ? JSON.parse(r.value) : null; }
      const item = localStorage.getItem(k);
      return item ? JSON.parse(item) : null;
    } catch { return null; }
  },
  async set(k, v) {
    try {
      if (hasWS()) { await window.storage.set(k, JSON.stringify(v)); return; }
      localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  },
  async setShared(k, v) {
    try {
      if (hasWS()) { await window.storage.set(k, JSON.stringify(v), true); return; }
      localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  }
};

function Ring({ value, size = 46, stroke = 5, color = "var(--amber)" }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, off = c * (1 - Math.min(value, 1));
  return (
    <svg width={size} height={size} className="ring">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--bg-3)" strokeWidth={stroke} fill="none" />
      <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" style={{ transition: "stroke-dashoffset .6s" }} />
    </svg>
  );
}

const Wordmark = () => (
  <div className="brand">
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
      <rect x="3" y="15" width="4.5" height="8" rx="1.4" fill="var(--amber)" opacity=".55" />
      <rect x="10.8" y="9" width="4.5" height="14" rx="1.4" fill="var(--amber)" opacity=".8" />
      <rect x="18.5" y="3" width="4.5" height="20" rx="1.4" fill="var(--amber)" />
    </svg>
    <div><div className="brand-word">ASCEND</div><div className="brand-sub">MLS 2029</div></div>
  </div>
);

function shuffleQuestion(item) {
  const order = item.o.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  return { ...item, o: order.map((k) => item.o[k]), a: order.indexOf(item.a) };
}
function shuffleBank(bank) {
  const q = bank.map(shuffleQuestion);
  for (let i = q.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [q[i], q[j]] = [q[j], q[i]]; }
  return q;
}

/* Change API_ENDPOINT to your serverless proxy (see claude-proxy.js) on deploy. */
const API_ENDPOINT = "https://api.anthropic.com/v1/messages";
/* Set this to your backend once deployed (see password-reset.js), e.g. "/api/request-reset".
   While it is empty, ASCEND uses the on-device recovery question instead of email. */
const AUTH_ENDPOINT = "";
async function callClaude(system, messages, maxTokens = 1024) {
  const body = JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: maxTokens, system, messages });
  let res;
  for (let attempt = 0; attempt < 3; attempt++) {
    res = await fetch(API_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body });
    if (res.ok) break;
    if (res.status === 429 || res.status === 529) { await new Promise((r) => setTimeout(r, 900 * (attempt + 1))); continue; }
    throw new Error("The AI service returned an error (" + res.status + ").");
  }
  if (!res.ok) throw new Error(res.status === 429 ? "The AI is busy right now. Wait a few seconds and try again." : "The AI service is unavailable at the moment.");
  const data = await res.json();
  const text = (data.content || []).map((b) => (b.type === "text" ? b.text : "")).join("").trim();
  if (!text) throw new Error("The AI returned an empty reply.");
  return text;
}

/* ------------------------ uploaded file extraction ----------------------- */
const fileExt = (f) => (f && f.name ? f.name.split(".").pop().toLowerCase() : "");

const readTextFile = (f) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(String(r.result || "").slice(0, 20000));
  r.onerror = () => rej(new Error("Could not read that file."));
  r.readAsText(f);
});

const readBase64 = (f) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(String(r.result).split(",")[1]);
  r.onerror = () => rej(new Error("Could not read that file."));
  r.readAsDataURL(f);
});

/* PPTX is a zip. Read the central directory, inflate each slide XML and pull the text runs. */
async function pptxToText(file) {
  const buf = await file.arrayBuffer();
  const dv = new DataView(buf);
  const u8 = new Uint8Array(buf);
  let eocd = -1;
  for (let i = u8.length - 22; i >= 0 && i > u8.length - 66000; i--) {
    if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error("That PowerPoint file could not be read.");
  const count = dv.getUint16(eocd + 10, true);
  let p = dv.getUint32(eocd + 16, true);
  const dec = new TextDecoder("utf-8");
  const slides = [];
  for (let n = 0; n < count; n++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    const method = dv.getUint16(p + 10, true);
    const compSize = dv.getUint32(p + 20, true);
    const fnLen = dv.getUint16(p + 28, true);
    const exLen = dv.getUint16(p + 30, true);
    const cmLen = dv.getUint16(p + 32, true);
    const localOff = dv.getUint32(p + 42, true);
    const name = dec.decode(u8.subarray(p + 46, p + 46 + fnLen));
    p += 46 + fnLen + exLen + cmLen;
    const m = name.match(/^ppt\/slides\/slide(\d+)\.xml$/);
    if (!m) continue;
    const lfnLen = dv.getUint16(localOff + 26, true);
    const lexLen = dv.getUint16(localOff + 28, true);
    const start = localOff + 30 + lfnLen + lexLen;
    const raw = u8.subarray(start, start + compSize);
    let xmlBytes;
    if (method === 0) xmlBytes = raw;
    else if (method === 8 && typeof DecompressionStream !== "undefined") {
      const ds = new DecompressionStream("deflate-raw");
      const blob = new Blob([raw]).stream().pipeThrough(ds);
      xmlBytes = new Uint8Array(await new Response(blob).arrayBuffer());
    } else throw new Error("This browser cannot open that PowerPoint. Export it as PDF and upload that instead.");
    const xml = dec.decode(xmlBytes);
    const runs = xml.match(/<a:t>([\s\S]*?)<\/a:t>/g) || [];
    const text = runs.map((t) => t.replace(/<[^>]+>/g, "")).join(" ")
      .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    if (text.trim()) slides.push({ n: parseInt(m[1], 10), text: text.trim() });
  }
  if (!slides.length) throw new Error("No text was found in that PowerPoint - it may be all images.");
  return slides.sort((a, b) => a.n - b.n).map((s) => `Slide ${s.n}: ${s.text}`).join("\n\n").slice(0, 20000);
}

function AITutor({ topicTitle, context }) {
  const [msgs, setMsgs] = useState([{ role: "assistant", content: `I'm your ASCEND tutor for "${topicTitle}". Ask me anything as you read, and I'll break it down step by step.` }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bodyRef = useRef(null);
  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [msgs, busy]);
  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const next = [...msgs, { role: "user", content: text }];
    setMsgs(next); setInput(""); setBusy(true);
    const sys = `You are the ASCEND tutor for KNUST medical laboratory science students. Teach the WHY and the mechanism, step by step. No emojis.\n\nTOPIC: ${topicTitle}\n\nSOURCE:\n${context}`;
    const apiMsgs = next.slice(1);
    try {
      const reply = await callClaude(sys, apiMsgs.map((m) => ({ role: m.role, content: m.content })));
      setMsgs([...next, { role: "assistant", content: reply }]);
    } catch (e) {
      setMsgs([...next, { role: "assistant", content: (e && e.message ? e.message + " " : "") + "The tutor runs live on the Claude API; on your deployed site, point API_ENDPOINT at your key proxy." }]);
    }
    setBusy(false);
  };
  return (
    <div className="chat">
      <div className="chat-body" ref={bodyRef}>
        {msgs.map((m, i) => <div key={i} className={"msg " + (m.role === "user" ? "u" : "a")}>{m.content}</div>)}
        {busy && <div className="msg a dots"><span /><span /><span /></div>}
      </div>
      <div className="chat-in">
        <input value={input} placeholder="Ask a question..." onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
        <button className="btn btn-a btn-sm" onClick={send} disabled={busy}><Ic.send p={17} /></button>
      </div>
    </div>
  );
}

function gradeOf(pct) {
  if (pct >= 70) return { letter: "A", remark: "Excellent", color: "var(--good)" };
  if (pct >= 60) return { letter: "B", remark: "Very good", color: "var(--amber)" };
  if (pct >= 50) return { letter: "C", remark: "Pass", color: "var(--amber-2)" };
  return { letter: "", remark: "You can do well - take your time, review and try again.", color: "var(--text-2)" };
}

/* ------------------------------- quiz ----------------------------------- */
function QuizView({ app }) {
  const t = contentFor(app.courseId, app.topicId);
  const mcqs = t ? (t.mcqs || []) : [];
  const [q, setQ] = useState(() => shuffleBank(mcqs));
  const [mode, setMode] = useState(null);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState({});
  const [reveal, setReveal] = useState(false);
  const [done, setDone] = useState(false);
  const bankLen = q.length;
  const [left, setLeft] = useState(bankLen * 45);

  const finish = () => {
    const correct = q.reduce((n, item, idx) => n + (answers[idx] === item.a ? 1 : 0), 0);
    if (t) app.finishQuiz(t.courseId, t.topicIndex, correct);
    setDone(true);
  };
  useEffect(() => {
    if (mode !== "exam" || done || bankLen === 0) return;
    if (left <= 0) { finish(); return; }
    const timer = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [mode, left, done, bankLen]);

  if (!t) return <div className="view"><button className="back" onClick={() => app.go("courses")}><Ic.chevR p={15} style={{ transform: "rotate(180deg)" }} /> Back</button><div className="card">This topic has no question bank yet.</div></div>;

  const pick = (oi) => {
    if (mode === "practice" && reveal) return;
    setAnswers((a) => ({ ...a, [i]: oi }));
    if (mode === "practice") setReveal(true);
  };
  const nextQ = () => { setReveal(false); if (i + 1 < bankLen) setI(i + 1); else finish(); };
  const score = q.reduce((n, item, idx) => n + (answers[idx] === item.a ? 1 : 0), 0);
  const mm = String(Math.floor(left / 60)).padStart(2, "0"), ss = String(left % 60).padStart(2, "0");

  if (!mode) {
    return (
      <div className="view">
        <button className="back" onClick={() => app.go("topic", { courseId: t.courseId, topicId: t.topicIndex })}><Ic.chevR p={15} style={{ transform: "rotate(180deg)" }} /> Back</button>
        <div className="eyebrow">Question bank</div>
        <h2 style={{ fontSize: 24, margin: "6px 0 4px" }}>{t.title}</h2>
        <p style={{ color: "var(--text-2)", marginTop: 0 }}>{bankLen} MCQs - single best answer, options shuffled every attempt.</p>
        <div className="grid g2" style={{ marginTop: 18 }}>
          <button className="card hover" style={{ textAlign: "left" }} onClick={() => setMode("practice")}>
            <Ic.target p={22} /><h3 style={{ fontSize: 17, margin: "10px 0 4px" }}>Practice mode</h3>
            <p style={{ color: "var(--text-2)", fontSize: 14, margin: 0 }}>Instant feedback after every question.</p>
          </button>
          <button className="card hover" style={{ textAlign: "left" }} onClick={() => setMode("exam")}>
            <Ic.clock p={22} /><h3 style={{ fontSize: 17, margin: "10px 0 4px" }}>Exam mode</h3>
            <p style={{ color: "var(--text-2)", fontSize: 14, margin: 0 }}>Timed, graded, full review at the end.</p>
          </button>
        </div>
      </div>
    );
  }

  if (done) {
    const pct = bankLen ? Math.round((score / bankLen) * 100) : 0;
    const g = gradeOf(pct);
    return (
      <div className="view">
        <div className="card" style={{ textAlign: "center", padding: "30px 20px" }}>
          <div className="eyebrow">Result</div>
          <div className="mono" style={{ fontSize: 46, fontWeight: 700, color: "var(--amber)", margin: "8px 0" }}>{score}/{bankLen}</div>
          <div style={{ color: "var(--text-2)" }}>{pct}% correct · +{score * 10} XP earned</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginTop: 16, padding: "10px 18px", borderRadius: 12, background: "var(--bg-3)", border: "1px solid var(--line)", maxWidth: "42ch" }}>
            {g.letter && <span style={{ fontSize: 30, fontWeight: 800, color: g.color, fontFamily: "var(--mono)" }}>{g.letter}</span>}
            <span style={{ color: g.letter ? "var(--text)" : "var(--text-2)", fontWeight: 600, textAlign: "left", fontSize: 14.5 }}>{g.remark}</span>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 18, flexWrap: "wrap" }}>
            <button className="btn btn-a" onClick={() => { setQ(shuffleBank(mcqs)); setMode(null); setI(0); setAnswers({}); setReveal(false); setDone(false); setLeft(bankLen * 45); }}>Try again</button>
            <button className="btn btn-g" onClick={() => app.go("topic", { courseId: t.courseId, topicId: t.topicIndex })}>Back to topic</button>
          </div>
        </div>
        <div className="eyebrow" style={{ margin: "24px 0 12px" }}>Review</div>
        {q.map((item, idx) => {
          const chosen = answers[idx];
          const gotIt = chosen === item.a;
          return (
            <div className="card" key={idx} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
                <div style={{ fontWeight: 600 }}><span className="mono" style={{ color: "var(--text-3)" }}>{String(idx + 1).padStart(2, "0")}. </span>{item.q}</div>
                <span className="mono" style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, color: gotIt ? "var(--good)" : "var(--bad)" }}>{chosen === undefined ? "SKIPPED" : gotIt ? "CORRECT" : "WRONG"}</span>
              </div>
              {item.o.map((opt, oi) => {
                let cls = "opt"; if (oi === item.a) cls += " correct"; else if (oi === chosen) cls += " wrong";
                return <div className={cls} key={oi}><span className="key">{"ABCD"[oi]}</span><span>{opt}</span></div>;
              })}
              <div style={{ color: "var(--text-2)", fontSize: 13.5, marginTop: 6 }}><strong style={{ color: "var(--text)" }}>Why: </strong>{item.w}</div>
            </div>
          );
        })}
      </div>
    );
  }

  const item = q[i], chosen = answers[i];
  return (
    <div className="view">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div className="eyebrow">{mode === "exam" ? "Exam mode" : "Practice"} · {i + 1} / {bankLen}</div>
        {mode === "exam" && <div className="chip mono" style={{ color: left < 60 ? "var(--bad)" : "var(--text)" }}><Ic.clock p={15} /> {mm}:{ss}</div>}
      </div>
      <div className="bar" style={{ marginBottom: 20 }}><i style={{ width: (i / bankLen) * 100 + "%" }} /></div>
      <h3 style={{ fontSize: 19, marginBottom: 16 }}>{item.q}</h3>
      {item.o.map((opt, oi) => {
        let cls = "opt";
        if (mode === "practice" && reveal) { if (oi === item.a) cls += " correct"; else if (oi === chosen) cls += " wrong"; }
        else if (oi === chosen) cls += " sel";
        return <button className={cls} key={oi} onClick={() => pick(oi)}><span className="key">{"ABCD"[oi]}</span><span>{opt}</span></button>;
      })}
      {mode === "practice" && reveal && (
        <div className="card" style={{ marginTop: 4, background: "var(--bg-3)" }}>
          <div style={{ fontSize: 14, color: "var(--text-2)" }}><strong style={{ color: chosen === item.a ? "var(--good)" : "var(--bad)" }}>{chosen === item.a ? "Correct. " : "Not quite. "}</strong>{item.w}</div>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
        <button className="btn btn-a" disabled={(mode === "exam" && chosen === undefined) || (mode === "practice" && !reveal)} onClick={nextQ}>{i + 1 === bankLen ? "Submit" : "Next"}</button>
      </div>
    </div>
  );
}

/* ------------------------------- topic ---------------------------------- */
function TopicView({ app }) {
  const t = contentFor(app.courseId, app.topicId);
  const c = courseById(app.courseId);
  if (!t) {
    const title = (TOPICS[app.courseId] || [])[app.topicId] || "This topic";
    return (
      <div className="view">
        <button className="back" onClick={() => app.go("course", { courseId: app.courseId })}><Ic.chevR p={15} style={{ transform: "rotate(180deg)" }} /> {c ? c.name : "Back"}</button>
        <div className="eyebrow">{c ? c.code : ""} · Preview</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,30px)", margin: "8px 0 12px" }}>{title}</h1>
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 16 }}>This topic is being written.</div>
          <p style={{ color: "var(--text-2)", margin: 0, fontSize: 14.5, lineHeight: 1.7 }}>Nothing in ASCEND is locked - every topic is open. This one is in the build queue and arrives with the full lesson, the AI tutor, theory questions and its MCQ bank.</p>
        </div>
      </div>
    );
  }
  const noteContext = (t.note || []).map((n) => n.q + " " + n.body).join("\n\n").slice(0, 5000);
  return (
    <div className="view">
      <button className="back" onClick={() => app.go("course", { courseId: t.courseId })}><Ic.chevR p={15} style={{ transform: "rotate(180deg)" }} /> {c.name}</button>
      <div className="eyebrow">{c.code} · Topic {String(t.topicIndex + 1).padStart(2, "0")}</div>
      <h1 style={{ fontSize: "clamp(22px,4vw,30px)", margin: "8px 0 6px" }}>{t.title}</h1>
      <div style={{ display: "flex", gap: 10, alignItems: "center", color: "var(--text-3)", fontSize: 13 }} className="mono">
        <span>{t.minutes || 15} MIN READ</span><span>·</span><span>{(t.theory || []).length} THEORY Q</span><span>·</span><span>{(t.mcqs || []).length} MCQ</span>
      </div>
      <div className="divider" />
      <div className="eyebrow" style={{ marginBottom: 14 }}>The lesson</div>
      <div className="lesson">
        {(t.note || []).map((it, idx) => (
          <div className="lesson-step" key={idx}>
            <h3 className="lesson-q"><span className="lesson-n">{String(idx + 1).padStart(2, "0")}</span><span>{it.q}</span></h3>
            {it.body.split("\n\n").map((p, k) => <p className="lesson-p" key={k}>{p}</p>)}
          </div>
        ))}
      </div>
      <div className="divider" />
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><Ic.ai p={18} /><div className="eyebrow" style={{ margin: 0 }}>Ask ASCEND</div></div>
      <AITutor topicTitle={t.title} context={noteContext} />
      <div className="divider" />
      <div className="eyebrow" style={{ marginBottom: 12 }}>{(t.theory || []).length} theory questions</div>
      <div className="qa">
        {(t.theory || []).map((it, idx) => (
          <div className="qa-item" key={idx}>
            <div className="qa-q"><span className="lesson-n">{String(idx + 1).padStart(2, "0")}</span><span>{it.q}</span></div>
            <p className="qa-a">{it.a}</p>
          </div>
        ))}
      </div>
      {(t.videos || []).length > 0 && (
        <>
          <div className="divider" />
          <div className="eyebrow" style={{ marginBottom: 12 }}>Watch</div>
          <div className="grid g2">
            {(t.videos || []).map((v, k) => (
              <a className="card hover" key={k} href={v.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--amber-dim)", color: "var(--amber)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ic.play p={18} /></div>
                  <div><div style={{ fontWeight: 650, fontSize: 14.5 }}>{v.title}</div><div className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>{v.channel.toUpperCase()}</div></div>
                </div>
                <p style={{ color: "var(--text-2)", fontSize: 13, margin: "10px 0 0" }}>{v.note}</p>
              </a>
            ))}
          </div>
        </>
      )}
      <div className="divider" />
      <div className="card card-feature" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div><div style={{ fontWeight: 700, fontSize: 16 }}>Ready to test yourself?</div><div style={{ color: "var(--text-2)", fontSize: 14 }}>{(t.mcqs || []).length} MCQs</div></div>
        <button className="btn btn-a" onClick={() => app.go("quiz", { courseId: t.courseId, topicId: t.topicIndex })}>Start <Ic.chevR p={16} /></button>
      </div>
    </div>
  );
}

/* ------------------------------- course --------------------------------- */
function CourseView({ app }) {
  const c = courseById(app.courseId);
  const topics = TOPICS[c.id] || [];
  return (
    <div className="view">
      <button className="back" onClick={() => app.go("courses")}><Ic.chevR p={15} style={{ transform: "rotate(180deg)" }} /> All courses</button>
      <h1 style={{ fontSize: "clamp(22px,4vw,30px)", margin: "10px 0 4px" }}>{c.name}</h1>
      <div className="ct-code">{c.code}</div>
      <p style={{ color: "var(--text-2)", maxWidth: "54ch", marginTop: 10 }}>Work top to bottom - each topic builds on the one before it. Nothing is locked.</p>
      <div className="ascent" style={{ marginTop: 24 }}>
        {topics.map((title, idx) => {
          const tc = contentFor(c.id, idx);
          const done = !!app.progress.completed?.[`${c.id}:${idx}`];
          const state = done ? "done" : tc ? "active" : "pending";
          return (
            <div className={"node " + state} key={idx}>
              <div className="dot">{done ? <Ic.check p={12} /> : <Ic.up p={12} />}</div>
              <button className="card hover" style={{ width: "100%", textAlign: "left", opacity: tc ? 1 : .82 }} onClick={() => app.go("topic", { courseId: c.id, topicId: idx })}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div>
                    <div className="mono" style={{ fontSize: 11, color: done ? "var(--good)" : tc ? "var(--amber)" : "var(--text-3)" }}>TOPIC {String(idx + 1).padStart(2, "0")} · {done ? "DONE" : tc ? "READY" : "PREVIEW"}</div>
                    <div style={{ fontWeight: 650, fontSize: 15.5, marginTop: 3 }}>{title}</div>
                    <div style={{ color: "var(--text-3)", fontSize: 12.5, marginTop: 4 }}>{tc ? `Lesson · AI tutor · ${(tc.theory || []).length} theory Q · ${(tc.mcqs || []).length} MCQ` : "Opening soon - tap to see what's coming."}</div>
                  </div>
                  <Ic.chevR p={20} />
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------- courses -------------------------------- */
function CoursesView({ app }) {
  return (
    <div className="view">
      <div className="eyebrow">This semester</div>
      <h1 style={{ fontSize: "clamp(22px,4vw,28px)", margin: "6px 0 4px" }}>Seven courses, one climb</h1>
      <div className="card" style={{ marginTop: 16, marginBottom: 18 }}>
        <div style={{ fontWeight: 650, fontSize: 14.5, marginBottom: 10 }}>Course code key</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
          {COURSES.map((c) => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14 }}>
              <span className="mono" style={{ color: "var(--amber-2)", fontWeight: 600, minWidth: 76 }}>{c.code}</span>
              <span style={{ color: "var(--text)" }}>{c.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid g2">
        {COURSES.map((c) => {
          const count = (TOPICS[c.id] || []).length;
          const live = builtInCourse(c.id);
          const done = Object.keys(app.progress.completed || {}).filter((k) => k.startsWith(c.id + ":")).length;
          const prog = count ? done / count : 0;
          return (
            <button className="card hover" key={c.id} style={{ textAlign: "left" }} onClick={() => app.go("course", { courseId: c.id })}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <span className="day-tag">{c.day.slice(0, 3)}</span>
                <Ring value={prog} size={38} stroke={4} />
              </div>
              <h3 style={{ fontSize: 16.5, margin: "0 0 3px" }}>{c.name}</h3>
              <div className="ct-code">{c.code} · {count} topics</div>
              <div style={{ marginTop: 12, fontSize: 12.5, color: live ? "var(--good)" : "var(--text-3)", fontWeight: 600 }} className="mono">{live ? `${live} TOPIC${live > 1 ? "S" : ""} LIVE` : "COMING SOON"}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------- daily ---------------------------------- */
function DailyView({ app }) {
  const jsDay = new Date().getDay();
  const d = DAILY[jsDay];
  const c = courseById(d.courseId);
  const alreadyDone = app.progress.dailyDone?.[todayKey()];
  const [chosen, setChosen] = useState(null);
  const [reveal, setReveal] = useState(!!alreadyDone);
  const submit = () => {
    if (chosen === null) return;
    setReveal(true);
    if (!alreadyDone) app.recordDaily(chosen === d.a);
  };
  return (
    <div className="view">
      <div className="eyebrow">Daily question · {new Date().toLocaleDateString("en-GB", { weekday: "long" })}</div>
      <h1 style={{ fontSize: "clamp(22px,4vw,28px)", margin: "6px 0 4px" }}>Keep the streak alive</h1>
      <p style={{ color: "var(--text-2)", marginTop: 0 }}>One question, one course, every day.</p>
      <div className="card" style={{ marginTop: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span className="day-tag">{c.name}</span>
          <span className="chip streakchip"><Ic.flame p={15} /><span className="val">{app.progress.streak}</span> day streak</span>
        </div>
        <h3 style={{ fontSize: 18, lineHeight: 1.4, marginBottom: 16 }}>{d.q}</h3>
        {d.o.map((opt, oi) => {
          let cls = "opt";
          if (reveal) { if (oi === d.a) cls += " correct"; else if (oi === chosen) cls += " wrong"; }
          else if (oi === chosen) cls += " sel";
          return <button className={cls} key={oi} disabled={reveal} onClick={() => setChosen(oi)}><span className="key">{"ABCD"[oi]}</span><span>{opt}</span></button>;
        })}
        {reveal ? (
          <div className="card" style={{ marginTop: 6, background: "var(--bg-3)" }}>
            <div style={{ fontSize: 14, color: "var(--text-2)" }}><strong style={{ color: "var(--text)" }}>Why: </strong>{d.w}</div>
            {alreadyDone && chosen === null && <div className="note-hint" style={{ marginTop: 8 }}>You already logged today's streak.</div>}
          </div>
        ) : (
          <button className="btn btn-a" style={{ marginTop: 8 }} disabled={chosen === null} onClick={submit}>Submit answer</button>
        )}
      </div>
      <div className="card" style={{ marginTop: 14 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Weekly rotation</div>
        <div className="grid" style={{ gap: 6 }}>
          {[1, 2, 3, 4, 5, 6, 0].map((wd) => (
            <div key={wd} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "5px 2px", color: wd === jsDay ? "var(--amber-2)" : "var(--text-2)", fontWeight: wd === jsDay ? 650 : 500 }}>
              <span className="mono" style={{ color: wd === jsDay ? "var(--amber)" : "var(--text-3)" }}>{["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][wd]}</span>
              <span>{courseById(DAILY[wd].courseId).name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- ranks ---------------------------------- */
function RanksView({ app }) {
  const me = { name: app.progress.name, xp: app.progress.xp, streak: app.progress.streak, me: true };
  const board = [...BOARD_SEED, me].sort((a, b) => b.xp - a.xp);
  const r = rankOf(app.progress.xp);
  const toNext = r.next ? r.next.min - app.progress.xp : 0;
  return (
    <div className="view">
      <div className="eyebrow">Leaderboard</div>
      <h1 style={{ fontSize: "clamp(22px,4vw,28px)", margin: "6px 0 4px" }}>No one wants to be last</h1>
      <p style={{ color: "var(--text-2)", marginTop: 0 }}>XP from daily questions and quizzes.</p>
      <div className="card card-feature" style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <Ring value={r.next ? (app.progress.xp - r.min) / (r.next.min - r.min) : 1} size={64} stroke={6} color={r.c} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: r.c, fontSize: 13 }}>{r.name[0]}</div>
        </div>
        <div>
          <div style={{ fontWeight: 750, fontSize: 18, color: r.c }}>{r.name}</div>
          <div className="mono" style={{ color: "var(--text-2)", fontSize: 13 }}>{app.progress.xp} XP{r.next ? ` · ${toNext} to ${r.next.name}` : " · top tier"}</div>
        </div>
      </div>
      <div style={{ marginTop: 18 }}>
        {board.map((p, idx) => (
          <div key={idx} className="card" style={{ marginBottom: 8, padding: "12px 15px", display: "flex", alignItems: "center", gap: 13, border: p.me ? "1px solid var(--amber)" : "1px solid var(--line)", background: p.me ? "var(--amber-dim)" : "var(--bg-2)" }}>
            <div className="mono" style={{ width: 24, textAlign: "center", fontWeight: 700, color: idx < 3 ? "var(--amber)" : "var(--text-3)", fontSize: 15 }}>{idx + 1}</div>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--bg-3)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "var(--text-2)", flexShrink: 0 }}>{p.name[0]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 650, fontSize: 14.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}{p.me && <span style={{ color: "var(--amber)", fontSize: 12 }}> · you</span>}</div>
              <div className="mono" style={{ fontSize: 11.5, color: "var(--text-3)" }}>{rankOf(p.xp).name.toUpperCase()}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="mono" style={{ fontWeight: 700, fontSize: 14 }}>{p.xp}</div>
              <div style={{ fontSize: 11, color: "var(--amber-2)", display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end" }}><Ic.flame p={12} />{p.streak}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="divider" />
      <div className="grid g2">
        <div className="card">
          <div className="eyebrow">Weekly top scorer</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--amber)", marginTop: 6 }}>{board[0]?.name || "No data yet"}</div>
          <div style={{ color: "var(--text-2)", fontSize: 13 }}>{board[0] ? board[0].xp + " XP this week" : "Do quizzes to appear here"}</div>
        </div>
        <div className="card">
          <div className="eyebrow">Demotion zone</div>
          <p style={{ color: "var(--text-2)", fontSize: 13, marginTop: 6, lineHeight: 1.6 }}>Practice at least once every seven days to hold your rank. Let your streak hit zero and you drift down the board.</p>
        </div>
      </div>
      <p className="note-hint" style={{ marginTop: 14, lineHeight: 1.6 }}>The class-wide leaderboard turns on with the cloud backend. For now this shows your own standing.</p>
    </div>
  );
}

/* ---- interactive runner: solve MCQs with instant feedback ---- */
function InteractiveSet({ items }) {
  const [bank] = useState(() => items.map(shuffleQuestion));
  const [picked, setPicked] = useState({});
  const answered = Object.keys(picked).length;
  const correct = bank.reduce((n, it, idx) => n + (picked[idx] === it.a ? 1 : 0), 0);
  return (
    <div>
      <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, marginBottom: 12 }}>
        <div className="eyebrow" style={{ margin: 0 }}>Interactive · tap your answer</div>
        <div className="mono" style={{ fontWeight: 700 }}><span style={{ color: "var(--amber)" }}>{correct}</span> / {answered} <span style={{ color: "var(--text-3)" }}>· {bank.length}</span></div>
      </div>
      {bank.map((it, idx) => {
        const chosen = picked[idx];
        const locked = chosen !== undefined;
        return (
          <div className="card" key={idx} style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 600, marginBottom: 10 }}><span className="mono" style={{ color: "var(--text-3)" }}>{String(idx + 1).padStart(2, "0")}. </span>{it.q}</div>
            {it.o.map((opt, oi) => {
              let cls = "opt";
              if (locked) { if (oi === it.a) cls += " correct"; else if (oi === chosen) cls += " wrong"; }
              return <button className={cls} key={oi} disabled={locked} onClick={() => setPicked((p) => ({ ...p, [idx]: oi }))}><span className="key">{"ABCD"[oi]}</span><span>{opt}</span></button>;
            })}
            {locked && <div style={{ color: "var(--text-2)", fontSize: 13.5, marginTop: 8 }}><strong style={{ color: chosen === it.a ? "var(--good)" : "var(--bad)" }}>{chosen === it.a ? "Correct. " : "Not quite. "}</strong>{it.w}</div>}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------- papers --------------------------------- */
function PapersView() {
  const [tab, setTab] = useState("solve");
  const [courseId, setCourseId] = useState("ana");
  const [sample, setSample] = useState("");
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState(null);
  const [err, setErr] = useState("");
  const RULES = `Rules: single best-answer MCQs, recall and understanding, NO diagrams. Make all four options similar in length and equally plausible so the answer is never obvious. Vary which position is correct. No repeats. Return ONLY a JSON array - no prose, no markdown. Each item: {"q": string, "o": [4 strings], "a": integer index, "w": one short explanation}.`;
  const genSet = async (usr) => {
    if (busy) return;
    setBusy(true); setErr(""); setItems(null);
    try {
      let text = await callClaude(`You generate KNUST-style medical laboratory science exam questions.`, [{ role: "user", content: usr }], 2048);
      text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      const arr = JSON.parse(text);
      const clean = (Array.isArray(arr) ? arr : []).filter((x) => x && x.q && Array.isArray(x.o) && x.o.length === 4 && typeof x.a === "number");
      if (!clean.length) throw new Error("No usable questions came back - try again.");
      setItems(clean);
    } catch (e) {
      setErr((e && e.message ? e.message + " " : "") + "This runs live on the Claude API - it works here inside Claude; on your deployed site, point API_ENDPOINT at your key proxy.");
    }
    setBusy(false);
  };
  const startSolve = () => genSet(`Generate 8 past-paper-style exam MCQs for a KNUST first-year student in ${courseById(courseId).name} (${courseById(courseId).code}). ${RULES}`);
  const startSimilar = () => genSet(`Here is a past exam question:\n\n${sample}\n\nGenerate 5 fresh MCQs testing the same concept and matching its style, for ${courseById(courseId).name}. ${RULES}`);
  return (
    <div className="view">
      <div className="eyebrow">Past papers</div>
      <h1 style={{ fontSize: "clamp(22px,4vw,28px)", margin: "6px 0 4px" }}>Solve them, don't just stare at the PDF</h1>
      <p style={{ color: "var(--text-2)", marginTop: 0, maxWidth: "58ch" }}>A past-paper PDF is easy to put off. Here you actually answer, tap by tap, with instant feedback - and ASCEND can spin fresh questions off any one you show it.</p>
      <div className="tabs">
        <button className={"tab " + (tab === "solve" ? "on" : "")} onClick={() => { setTab("solve"); setItems(null); setErr(""); }}>Solve a set</button>
        <button className={"tab " + (tab === "similar" ? "on" : "")} onClick={() => { setTab("similar"); setItems(null); setErr(""); }}>Generate similar</button>
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <label className="eyebrow" style={{ display: "block", marginBottom: 8 }}>Course</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: tab === "similar" ? 16 : 4 }}>
          {COURSES.map((c) => (
            <button key={c.id} className="btn btn-sm" style={{ background: courseId === c.id ? "var(--amber)" : "var(--bg-3)", color: courseId === c.id ? "#1B1405" : "var(--text-2)", border: "1px solid var(--line)" }} onClick={() => setCourseId(c.id)}>{c.code}</button>
          ))}
        </div>
        {tab === "similar" && (
          <>
            <label className="eyebrow" style={{ display: "block", marginBottom: 8 }}>Paste one past question</label>
            <textarea className="pastebox" value={sample} placeholder={"e.g.\n\nThe plane dividing the body into left and right is the\nA. coronal  B. sagittal  C. transverse  D. oblique"} onChange={(e) => setSample(e.target.value)} />
          </>
        )}
        <div style={{ marginTop: 14 }}>
          {tab === "solve"
            ? <button className="btn btn-a" onClick={startSolve} disabled={busy}>{busy ? "Building your set..." : "Start a practice set"} <Ic.ai p={16} /></button>
            : <button className="btn btn-a" onClick={startSimilar} disabled={busy || !sample.trim()}>{busy ? "Generating..." : "Generate similar questions"} <Ic.ai p={16} /></button>}
        </div>
      </div>
      {err && <div className="card" style={{ marginTop: 14, borderColor: "var(--line-2)", color: "var(--text-2)", fontSize: 14 }}>{err}</div>}
      {busy && <div className="card" style={{ marginTop: 14 }}><span className="dots"><span /><span /><span /></span></div>}
      {items && <InteractiveSet key={items.map((x) => x.q).join("|").length + "-" + items.length} items={items} />}
    </div>
  );
}

/* ------------------------------- resources ------------------------------ */
const SOCRATIC_SYS = "You are the ASCEND Socratic tutor for KNUST medical laboratory science students. Break material into a sequential continuum of knowledge: pose a question, give a hint, then answer it fully in flowing paragraphs, then state the crucial insight or clinical pearl. Teach mechanism over memorisation. No emojis.";
const SOCRATIC_TASK = "Break this study material into a Socratic lesson of 5 to 8 steps. For each step: state the question, explain the answer in full paragraphs, then give the crucial insight. End with a short consolidation and three self-test questions with worked answers.";

function ResourcesView() {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("");
  const [err, setErr] = useState("");

  const run = async () => {
    setErr(""); setResult("");
    const typed = text.trim();
    if (!typed && !file) { setErr("Paste some content or choose a file first."); return; }
    setBusy(true);
    try {
      const ext = fileExt(file);
      if (file && ext === "pdf") {
        setStage("Reading your PDF...");
        const b64 = await readBase64(file);
        setStage("Building your lesson...");
        const content = [
          { type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } },
          { type: "text", text: SOCRATIC_TASK + (typed ? "\n\nFocus especially on: " + typed : "") }
        ];
        setResult(await callClaude(SOCRATIC_SYS, [{ role: "user", content }], 3000));
      } else {
        let material = typed;
        if (file && !material) {
          if (ext === "pptx") { setStage("Opening your slides..."); material = await pptxToText(file); }
          else if (ext === "txt" || ext === "md") { setStage("Reading your file..."); material = await readTextFile(file); }
          else throw new Error("Supported files are PDF, PowerPoint (.pptx), and plain text. For .ppt or .doc, export to PDF first.");
        }
        if (!material) throw new Error("That file had no readable text.");
        setStage("Building your lesson...");
        setResult(await callClaude(SOCRATIC_SYS, [{ role: "user", content: SOCRATIC_TASK + "\n\nMATERIAL:\n" + material }], 3000));
      }
    } catch (e) {
      setErr((e && e.message ? e.message + " " : "") + "The breakdown runs live on the Claude API - it works here inside Claude; on your deployed site, point API_ENDPOINT at your key proxy.");
    }
    setStage(""); setBusy(false);
  };

  return (
    <div className="view">
      <div className="eyebrow">Resources</div>
      <h1 style={{ fontSize: "clamp(22px,4vw,28px)", margin: "6px 0 4px" }}>Bring your own material</h1>
      <p style={{ color: "var(--text-2)", marginTop: 0, maxWidth: "60ch" }}>Paste lecture notes or slides from the MELSSA Slides Group and ASCEND rebuilds it as a Socratic lesson - question, answer, crucial insight - so you learn the mechanism instead of skimming.</p>
      <div className="card" style={{ marginTop: 16 }}>
        <label className="field"><span>Paste your material</span>
          <textarea className="pastebox" value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste lecture notes or slide text here, or upload a file below..." style={{ minHeight: "130px" }} />
        </label>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <label className="btn btn-g" style={{ cursor: "pointer" }}>
            <Ic.upload p={16} /> Upload PDF, slides or text
            <input type="file" accept=".pdf,.pptx,.txt,.md" style={{ display: "none" }} onChange={(e) => { if (e.target.files[0]) { setFile(e.target.files[0]); setErr(""); } }} />
          </label>
          {file && (
            <span style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-2)", fontSize: 13 }}>
              {file.name}
              <button className="iconbtn" style={{ width: 26, height: 26 }} onClick={() => setFile(null)} aria-label="Remove file"><Ic.x p={13} /></button>
            </span>
          )}
        </div>
        <p className="note-hint" style={{ marginTop: 10, lineHeight: 1.6 }}>PDF, PowerPoint (.pptx) and plain text are read directly. For older .ppt or .doc files, export to PDF first. With a PDF you can also type what to focus on above.</p>
        <button className="btn btn-a" style={{ marginTop: 12, width: "100%", padding: "12px" }} onClick={run} disabled={busy || (!text.trim() && !file)}>
          {busy ? (stage || "Working...") : "Break it down with ASCEND"}
        </button>
      </div>
      {err && <div className="card" style={{ marginTop: 14, color: "var(--text-2)", fontSize: 14, lineHeight: 1.6 }}>{err}</div>}
      {busy && <div className="card" style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 12 }}><span className="dots"><span /><span /><span /></span><span style={{ color: "var(--text-3)", fontSize: 13.5 }}>{stage}</span></div>}
      {result && (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>ASCEND breakdown</div>
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.8, fontSize: 15 }}>{result}</div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------- home ----------------------------------- */
function HomeView({ app }) {
  const jsDay = new Date().getDay();
  const todayCourse = courseById(DAILY[jsDay].courseId);
  const doneToday = app.progress.dailyDone?.[todayKey()];
  const r = rankOf(app.progress.xp);
  const builtKeys = Object.keys(CONTENT);
  const nextKey = builtKeys.find((k) => !app.progress.completed?.[k]) || builtKeys[builtKeys.length - 1] || null;
  const nt = nextKey ? CONTENT[nextKey] : null;
  const ntCourse = nt ? courseById(nt.courseId) : null;
  return (
    <div className="view">
      <div className="hero">
        <svg className="ridge" viewBox="0 0 600 220" preserveAspectRatio="none" aria-hidden>
          <defs><radialGradient id="glow" cx="82%" cy="12%" r="45%"><stop offset="0%" stopColor="rgba(245,185,63,.28)" /><stop offset="100%" stopColor="rgba(245,185,63,0)" /></radialGradient>
            <linearGradient id="rl" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="rgba(157,175,201,.15)" /><stop offset="100%" stopColor="rgba(245,185,63,.55)" /></linearGradient></defs>
          <rect width="600" height="220" fill="url(#glow)" />
          <polyline points="0,210 90,180 170,190 260,140 340,150 420,95 500,60 600,20" fill="none" stroke="url(#rl)" strokeWidth="2.2" />
          <circle cx="600" cy="20" r="4" fill="var(--amber)" />
        </svg>
        <div style={{ position: "relative" }}>
          <div className="eyebrow" style={{ color: "var(--amber)" }}>ASCEND</div>
          <h1 className="hero-h">Understand the <span className="hl">mechanism</span>, and recall takes care of itself.</h1>
          <p className="hero-p">Built by Prince and Ansah so the Class of 2029 rises together.</p>
        </div>
      </div>
      <div className="grid g3" style={{ marginTop: 16 }}>
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="chip streakchip"><Ic.flame p={16} /><span className="val">{app.progress.streak}</span></span>
            <span className="eyebrow">Streak</span>
          </div>
          <div style={{ marginTop: 12, fontSize: 14, color: "var(--text-2)" }}>{doneToday ? "Logged today." : "Answer today's question."}</div>
        </div>
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="mono" style={{ fontWeight: 700, fontSize: 20, color: r.c }}>{app.progress.xp}</span>
            <span className="eyebrow">XP · {r.name}</span>
          </div>
          <div className="bar" style={{ marginTop: 14 }}><i style={{ width: (r.next ? Math.min((app.progress.xp - r.min) / (r.next.min - r.min), 1) : 1) * 100 + "%", background: r.c }} /></div>
        </div>
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Ic.book p={20} /><span className="eyebrow">Courses</span>
          </div>
          <div style={{ marginTop: 12, fontSize: 14, color: "var(--text-2)" }}>7 courses · {totalBuilt()} topics live</div>
        </div>
      </div>
      <button className="card card-feature hover" style={{ width: "100%", textAlign: "left", marginTop: 16 }} onClick={() => app.go("daily")}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14 }}>
          <div>
            <div className="eyebrow" style={{ color: "var(--amber)" }}>Today · {todayCourse.day}</div>
            <div style={{ fontWeight: 700, fontSize: 17, margin: "6px 0 2px" }}>{doneToday ? "Streak logged" : `${todayCourse.name} daily question`}</div>
            <div style={{ color: "var(--text-2)", fontSize: 14 }}>{doneToday ? "See the weekly rotation." : "One question. Do not break the chain."}</div>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--amber-dim)", color: "var(--amber)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ic.flame p={22} /></div>
        </div>
      </button>
      <div className="grid g2" style={{ marginTop: 12 }}>
        <button className="card hover" style={{ textAlign: "left" }} onClick={() => app.go("lamla")}>
          <div className="eyebrow" style={{ color: "var(--amber)" }}>LAMLA · last-minute rescue</div>
          <div style={{ fontWeight: 700, fontSize: 16, margin: "6px 0 2px" }}>Exam in a few hours?</div>
          <div style={{ color: "var(--text-2)", fontSize: 14 }}>Get a high-yield plan for the time you have left.</div>
        </button>
        <button className="card hover" style={{ textAlign: "left" }} onClick={() => app.go("resources")}>
          <div className="eyebrow" style={{ color: "var(--amber)" }}>Resources</div>
          <div style={{ fontWeight: 700, fontSize: 16, margin: "6px 0 2px" }}>Bring your own notes</div>
          <div style={{ color: "var(--text-2)", fontSize: 14 }}>Turn any lecture material into a Socratic lesson.</div>
        </button>
      </div>
      <div className="eyebrow" style={{ margin: "26px 0 12px" }}>Jump back in</div>
      {nt && ntCourse ? (
        <button className="card hover" style={{ width: "100%", textAlign: "left" }} onClick={() => app.go("topic", { courseId: nt.courseId, topicId: nt.topicIndex })}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14 }}>
            <div>
              <div className="mono" style={{ fontSize: 11, color: "var(--amber)" }}>{ntCourse.name.toUpperCase()} · TOPIC {String(nt.topicIndex + 1).padStart(2, "0")}</div>
              <div style={{ fontWeight: 650, fontSize: 16, margin: "4px 0 2px" }}>{nt.title}</div>
              <div style={{ color: "var(--text-3)", fontSize: 13 }}>Lesson · AI tutor · {(nt.mcqs || []).length} MCQs</div>
            </div>
            <Ic.chevR p={22} />
          </div>
        </button>
      ) : (
        <div className="card">
          <div style={{ fontWeight: 650, fontSize: 16 }}>Content is on the way</div>
          <div style={{ color: "var(--text-3)", fontSize: 13, marginTop: 4 }}>Topics are being built one by one. Browse the full course maps under Courses.</div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------- auth ----------------------------------- */
const encodePw = (s) => { try { return btoa(unescape(encodeURIComponent(s))); } catch { return s; } };
const freshProgress = (name) => ({ name, xp: 0, streak: 0, lastActive: null, dailyDone: {}, completed: {} });
const progKey = (u) => "ascend_progress:" + String(u).toLowerCase();
const ONBOARD = [
  { k: "firstclass", q: "Are you aiming for First Class this year?" },
  { k: "why", q: "Do you like to understand the mechanism before memorizing?" },
  { k: "reminder", q: "Want a daily nudge to do the daily question?" },
  { k: "mobile", q: "Do you study mostly on your phone?" }
];

const RECOVERY_QS = [
  "What is your mother's first name?",
  "What was the name of your senior high school?",
  "What is your best friend's nickname?",
  "What town were you born in?",
  "What is the name of your favourite lecturer?"
];
const normAns = (x) => encodePw(String(x || "").trim().toLowerCase());

function AuthScreen({ onAuthed }) {
  const [tab, setTab] = useState("login");        // login | signup | forgot
  const [step, setStep] = useState("form");       // form | onboard
  const [username, setUsername] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [rqIdx, setRqIdx] = useState(0);
  const [rAns, setRAns] = useState("");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(null);
  const [ans, setAns] = useState({});
  // forgot-password flow
  const [fStage, setFStage] = useState("who");    // who | answer | done
  const [fAcct, setFAcct] = useState(null);

  // remember the last student who used this device, so the field is prefilled
  useEffect(() => { (async () => { const last = await store.get("ascend_last_user"); if (last) setUsername(last); })(); }, []);

  const clearMsgs = () => { setErr(""); setOk(""); };

  const submit = async () => {
    clearMsgs();
    const u = username.trim();
    if (u.length < 2) { setErr("Pick a username of at least 2 characters."); return; }
    if (pw.length < 4) { setErr("Use a password of at least 4 characters."); return; }
    setBusy(true);
    const accounts = (await store.get("ascend_accounts")) || {};
    const key = u.toLowerCase();
    if (tab === "signup") {
      if (pw !== pw2) { setErr("The two passwords do not match."); setBusy(false); return; }
      if (accounts[key]) { setErr("That username is taken - try logging in instead."); setBusy(false); return; }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) { setErr("Enter a valid email address for password recovery."); setBusy(false); return; }
      if (rAns.trim().length < 2) { setErr("Add a recovery answer as a backup."); setBusy(false); return; }
      setPending({ username: u, email: email.trim().toLowerCase(), pass: encodePw(pw), rq: rqIdx, ra: normAns(rAns), prefs: {}, createdAt: Date.now() });
      setStep("onboard"); setBusy(false); return;
    }
    const acct = accounts[key];
    if (!acct || acct.pass !== encodePw(pw)) { setErr("Username or password is not right."); setBusy(false); return; }
    await store.set("ascend_session", key);
    await store.set("ascend_last_user", acct.username);
    setBusy(false); onAuthed(acct);
  };

  const finishOnboard = async () => {
    setBusy(true);
    const accounts = (await store.get("ascend_accounts")) || {};
    const key = pending.username.toLowerCase();
    const acct = { ...pending, prefs: { ...ans } };
    accounts[key] = acct;
    await store.set("ascend_accounts", accounts);
    await store.set("ascend_session", key);
    await store.set("ascend_last_user", acct.username);
    setBusy(false); onAuthed(acct);
  };

  const findAccount = async () => {
    clearMsgs();
    const key = username.trim().toLowerCase();
    if (!key) { setErr("Type your username or email first."); return; }
    setBusy(true);
    const accounts = (await store.get("ascend_accounts")) || {};
    // match on username or on the email saved at sign-up
    const acct = accounts[key] || Object.values(accounts).find((a) => a.email && a.email === key);

    // If a reset backend is configured, ask it to email a reset link.
    if (AUTH_ENDPOINT) {
      try {
        const res = await fetch(AUTH_ENDPOINT, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: key })
        });
        setBusy(false);
        if (res.ok) { setFStage("sent"); return; }
        throw new Error("reset service error");
      } catch (e) {
        setBusy(false);
        setErr("The reset email could not be sent right now. Use your recovery question below instead.");
      }
    } else { setBusy(false); }

    if (!acct) { setErr("No account with that username or email on this device."); return; }
    if (acct.rq === undefined || acct.ra === undefined) {
      setErr("This account was created before recovery was added, so it has no recovery question or email. Create a fresh account (your progress starts over), or keep using it on a device where you are still logged in.");
      return;
    }
    setFAcct(acct); setFStage("answer");
  };

  const resetPassword = async () => {
    clearMsgs();
    if (normAns(rAns) !== fAcct.ra) { setErr("That answer does not match."); return; }
    if (pw.length < 4) { setErr("Use a new password of at least 4 characters."); return; }
    if (pw !== pw2) { setErr("The two passwords do not match."); return; }
    setBusy(true);
    const accounts = (await store.get("ascend_accounts")) || {};
    const key = fAcct.username.toLowerCase();
    accounts[key] = { ...accounts[key], pass: encodePw(pw) };
    await store.set("ascend_accounts", accounts);
    setBusy(false); setFStage("done"); setOk("Password changed. You can log in now.");
    setPw(""); setPw2(""); setRAns("");
  };

  const goTab = (t) => { setTab(t); clearMsgs(); setPw(""); setPw2(""); setRAns(""); setFStage("who"); setFAcct(null); };

  const Logo = (
    <div className="auth-logo">
      <div className="auth-mark">
        <svg width="46" height="46" viewBox="0 0 26 26" aria-hidden>
          <rect x="3" y="15" width="4.5" height="8" rx="1.4" fill="var(--amber)" opacity=".55" />
          <rect x="10.8" y="9" width="4.5" height="14" rx="1.4" fill="var(--amber)" opacity=".8" />
          <rect x="18.5" y="3" width="4.5" height="20" rx="1.4" fill="var(--amber)" />
        </svg>
        <span className="auth-name">ASCEND</span>
      </div>
      <p className="auth-tag">The climb to First Class, together. <strong>No gatekeeping.</strong> Learn the why, not just the what.</p>
    </div>
  );

  if (step === "onboard") return (
    <div className="auth-wrap">
      {Logo}
      <div className="auth-card">
        <div className="eyebrow" style={{ marginBottom: 4 }}>Welcome, {pending.username}</div>
        <h2 style={{ fontSize: 19, margin: "0 0 4px" }}>A few quick questions</h2>
        <p style={{ color: "var(--text-2)", fontSize: 13.5, marginTop: 0 }}>Tap yes or no - this tunes ASCEND to how you study.</p>
        {ONBOARD.map((o) => (
          <div className="onb-q" key={o.k}>
            <span>{o.q}</span>
            <div className="yn">
              <button className={ans[o.k] === true ? "on" : ""} onClick={() => setAns((a) => ({ ...a, [o.k]: true }))}>Yes</button>
              <button className={ans[o.k] === false ? "on" : ""} onClick={() => setAns((a) => ({ ...a, [o.k]: false }))}>No</button>
            </div>
          </div>
        ))}
        <button className="btn btn-a auth-btn" style={{ marginTop: 18 }} onClick={finishOnboard} disabled={busy}>{busy ? "Setting up..." : "Start learning"}</button>
      </div>
    </div>
  );

  if (tab === "forgot") return (
    <div className="auth-wrap">
      {Logo}
      <div className="auth-card">
        <div className="eyebrow" style={{ marginBottom: 4 }}>Password reset</div>
        <h2 style={{ fontSize: 19, margin: "0 0 12px" }}>Forgot your password?</h2>
        {fStage === "who" && (
          <>
            <p style={{ color: "var(--text-2)", fontSize: 13.5, marginTop: 0, lineHeight: 1.6 }}>Enter your username or the email you signed up with. {AUTH_ENDPOINT ? "We will email you a reset link." : "ASCEND will then ask your recovery question."}</p>
            <label className="field"><span>Username or email</span>
              <input className="auth-input" name="username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="prince_a  or  you@gmail.com" autoCapitalize="none" autoCorrect="off" />
            </label>
            {err && <div className="auth-err">{err}</div>}
            <button className="btn btn-a auth-btn" onClick={findAccount} disabled={busy}>{busy ? "Checking..." : "Continue"}</button>
          </>
        )}
        {fStage === "sent" && (
          <>
            <div className="card" style={{ background: "var(--good-dim)", padding: 16, marginBottom: 14 }}>
              <div style={{ fontWeight: 700, color: "var(--good)", marginBottom: 5 }}>Check your email</div>
              <div style={{ color: "var(--text-2)", fontSize: 13.5, lineHeight: 1.6 }}>If an account matches that username or email, a reset link is on its way. It expires in one hour. Check your spam folder if you do not see it.</div>
            </div>
            <button className="btn btn-a auth-btn" onClick={() => goTab("login")}>Back to log in</button>
          </>
        )}
        {fStage === "answer" && (
          <>
            <div className="card" style={{ background: "var(--bg-3)", marginBottom: 14, padding: 14 }}>
              <div className="eyebrow" style={{ marginBottom: 5 }}>Your recovery question</div>
              <div style={{ fontSize: 14.5, fontWeight: 600 }}>{RECOVERY_QS[fAcct.rq] || RECOVERY_QS[0]}</div>
            </div>
            <label className="field"><span>Your answer</span>
              <input className="auth-input" value={rAns} onChange={(e) => setRAns(e.target.value)} placeholder="Not case sensitive" autoCapitalize="none" />
            </label>
            <PasswordInput id="newpw" autoComplete="new-password" label="New password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 4 characters" />
            <PasswordInput id="newpw2" autoComplete="new-password" label="Confirm new password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Type it again" />
            {err && <div className="auth-err">{err}</div>}
            <button className="btn btn-a auth-btn" onClick={resetPassword} disabled={busy}>{busy ? "Saving..." : "Reset password"}</button>
          </>
        )}
        {fStage === "done" && (
          <>
            <div style={{ color: "var(--good)", fontSize: 14, marginBottom: 14 }}>{ok}</div>
            <button className="btn btn-a auth-btn" onClick={() => goTab("login")}>Back to log in</button>
          </>
        )}
        {fStage !== "done" && <button className="btn btn-g btn-sm" style={{ width: "100%", marginTop: 10 }} onClick={() => goTab("login")}>Back to log in</button>}
      </div>
    </div>
  );

  return (
    <div className="auth-wrap">
      {Logo}
      <div className="auth-card">
        <div className="seg">
          <button className={tab === "login" ? "on" : ""} onClick={() => goTab("login")}>Log in</button>
          <button className={tab === "signup" ? "on" : ""} onClick={() => goTab("signup")}>Create account</button>
        </div>
        <label className="field">
          <span>{tab === "signup" ? "Username (your name on the leaderboard - a nickname is fine)" : "Username"}</span>
          <input className="auth-input" name="username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. prince_a" autoCapitalize="none" autoCorrect="off" />
        </label>
        <PasswordInput id="password" autoComplete={tab === "signup" ? "new-password" : "current-password"} label="Password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 4 characters" />
        {tab === "signup" && (
          <>
            <PasswordInput id="password2" autoComplete="new-password" label="Confirm password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Type it again" />
            <label className="field"><span>Email (used to send you a password reset)</span>
              <input className="auth-input" type="email" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@gmail.com" autoCapitalize="none" autoCorrect="off" />
            </label>
            <label className="field"><span>Backup recovery question</span>
              <select className="auth-input" value={rqIdx} onChange={(e) => setRqIdx(Number(e.target.value))}>
                {RECOVERY_QS.map((q, i) => <option key={i} value={i}>{q}</option>)}
              </select>
            </label>
            <label className="field"><span>Your answer</span>
              <input className="auth-input" value={rAns} onChange={(e) => setRAns(e.target.value)} placeholder="Something you will not forget" autoCapitalize="none" />
            </label>
          </>
        )}
        {err && <div className="auth-err">{err}</div>}
        {ok && <div style={{ color: "var(--good)", fontSize: 13, margin: "2px 0 12px" }}>{ok}</div>}
        <button className="btn btn-a auth-btn" onClick={submit} disabled={busy}>{busy ? "Please wait..." : tab === "signup" ? "Create account" : "Log in"}</button>
        {tab === "login" && (
          <button className="btn btn-g btn-sm" style={{ width: "100%", marginTop: 10 }} onClick={() => goTab("forgot")}>Forgot password?</button>
        )}
        <p className="note-hint" style={{ marginTop: 14, textAlign: "center", lineHeight: 1.55 }}>Your browser or phone keychain can save this login and fill it in next time. ASCEND keeps you signed in on this device until you log out.</p>
      </div>
    </div>
  );
}

const ANNOUNCEMENTS = [
  { id: "a2", tag: "Feature", title: "CWA planner, themes and resources", body: "Plan your target CWA under the CWA tab, switch light and dark with the toggle up top, and turn your own notes into lessons under Resources." },
  { id: "a1", tag: "Welcome", title: "Welcome to ASCEND", body: "The climb to First Class, together. Do the daily question every day to build your streak and rise through the ranks." }
];

/* ------------------------------- plan (CWA) ----------------------------- */
function PlanView() {
  const planCourses = [
    { id: "ana", name: "Human Anatomy", cr: 3 },
    { id: "phy", name: "General Physiology", cr: 3 },
    { id: "bch", name: "Biochemistry", cr: 3 },
    { id: "bio", name: "Biological Chemistry", cr: 3 },
    { id: "psy", name: "Medical Psychology", cr: 2 },
    { id: "com", name: "Communication Skills II", cr: 2 },
    { id: "lab", name: "Lab Safety & Instrumentation", cr: 2 }
  ];
  const [prevCWA, setPrevCWA] = useState("");
  const [prevCr, setPrevCr] = useState("21");
  const [thisCr, setThisCr] = useState("20");
  const [target, setTarget] = useState("");
  const [aiScore, setAiScore] = useState("95");
  const [counts, setCounts] = useState(() => Object.fromEntries(planCourses.map((c) => [c.id, { mid: "80", fin: "200" }])));
  const AI_CR = 2;
  const pc = parseFloat(prevCWA), pcr = parseFloat(prevCr), tcr = parseFloat(thisCr), tg = parseFloat(target);
  const ai = parseFloat(aiScore);
  const valid = [pc, pcr, tcr, tg].every((x) => !isNaN(x)) && pcr > 0 && tcr > 0 && tg > 0 && tg <= 100 && pc >= 0 && pc <= 100;
  const aiVal = isNaN(ai) ? 0 : Math.min(100, Math.max(0, ai));
  let S = 0, prevWeighted = 0, totalCr = 0, examCr = 0, aiWeighted = 0, neededExams = 0, maxCWA = 0;
  if (valid) {
    prevWeighted = pc * pcr;
    totalCr = pcr + tcr;
    examCr = tcr - AI_CR;
    aiWeighted = aiVal * AI_CR;
    neededExams = tg * totalCr - prevWeighted - aiWeighted;
    S = examCr > 0 ? neededExams / examCr : 0;
    maxCWA = (prevWeighted + aiWeighted + 100 * examCr) / totalCr;
  }
  const rawNeeded = (count) => { const n = parseFloat(count); return isNaN(n) || S < 0 ? "-" : Math.ceil((S / 100) * n); };
  return (
    <div className="view">
      <div className="eyebrow">CWA planner</div>
      <h1 style={{ fontSize: "clamp(22px,4vw,28px)", margin: "6px 0 4px" }}>Reverse-engineer your target</h1>
      <p style={{ color: "var(--text-2)", marginTop: 0, maxWidth: "60ch" }}>Open AIM, read your current CWA, and tell ASCEND the CWA you are chasing. It works out the average you need this semester, then the raw score to aim for on every mid-sem and final.</p>
      <div className="card" style={{ marginTop: 16 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Where you stand</div>
        <div className="plan-row">
          <label className="field"><span>Current CWA (from AIM)</span><input className="plan-in" inputMode="decimal" value={prevCWA} onChange={(e) => setPrevCWA(e.target.value)} placeholder="e.g. 78.1" /></label>
          <label className="field"><span>Credits done so far</span><input className="plan-in" inputMode="numeric" value={prevCr} onChange={(e) => setPrevCr(e.target.value)} placeholder="21" /></label>
        </div>
        <div className="plan-row" style={{ marginTop: 4 }}>
          <label className="field"><span>Target CWA (cumulative)</span><input className="plan-in" inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="e.g. 80" /></label>
          <label className="field"><span>This semester's credits</span><input className="plan-in" inputMode="numeric" value={thisCr} onChange={(e) => setThisCr(e.target.value)} placeholder="20" /></label>
        </div>
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>AI for Learning (self-paced, 2 credits)</div>
        <p style={{ color: "var(--text-2)", fontSize: 13.5, marginTop: 0, lineHeight: 1.6 }}>This portal course has no mid-sem or finals - you just finish it before the semester ends, and most students land between 90 and 100. Predict the score you expect and ASCEND folds it into the plan.</p>
        <label className="field" style={{ maxWidth: 220, marginBottom: 0 }}><span>Expected score</span><input className="plan-in" inputMode="decimal" value={aiScore} onChange={(e) => setAiScore(e.target.value)} placeholder="e.g. 97" /></label>
      </div>
      {!valid && <div className="card" style={{ marginTop: 14, color: "var(--text-2)", fontSize: 14 }}>Fill in your current CWA, your credits, and a target CWA between 0 and 100 to see your plan.</div>}
      {valid && S > 100 && <div className="card" style={{ marginTop: 14 }}><div style={{ fontWeight: 700, color: "var(--bad)", marginBottom: 6 }}>That target is out of reach in one semester.</div><p style={{ color: "var(--text-2)", margin: 0, fontSize: 14.5, lineHeight: 1.6 }}>Even a perfect 100% in every exam course, plus your predicted AI score, lands you at about <strong style={{ color: "var(--text)" }}>{maxCWA.toFixed(2)}</strong>. Aim at or below that, or spread the climb across more semesters.</p></div>}
      {valid && S < 0 && <div className="card" style={{ marginTop: 14 }}><div style={{ fontWeight: 700, color: "var(--good)", marginBottom: 6 }}>You are already past this target.</div><p style={{ color: "var(--text-2)", margin: 0, fontSize: 14.5 }}>Your current standing already clears a CWA of {tg}. Raise the bar and push higher.</p></div>}
      {valid && S >= 0 && S <= 100 && (
        <>
          <div className="card" style={{ marginTop: 14, textAlign: "center", padding: "26px 20px" }}>
            <div className="eyebrow">You need to average</div>
            <div className="headline" style={{ margin: "10px 0" }}>{S.toFixed(1)}%</div>
            <div style={{ color: "var(--text-2)", fontSize: 14 }}>across your seven exam courses this semester to reach a CWA of {tg}</div>
          </div>
          <div className="card" style={{ marginTop: 12 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>How that number is built</div>
            <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.8, margin: 0 }}>
              Target CWA x total credits = {tg} x {totalCr} = <strong style={{ color: "var(--text)" }}>{(tg * totalCr).toFixed(1)}</strong> weighted marks needed overall.<br />
              You already hold {pc} x {pcr} = <strong style={{ color: "var(--text)" }}>{prevWeighted.toFixed(1)}</strong>, and your predicted AI course adds {aiVal} x {AI_CR} = <strong style={{ color: "var(--text)" }}>{aiWeighted.toFixed(1)}</strong>.<br />
              That leaves <strong style={{ color: "var(--amber-2)" }}>{neededExams.toFixed(1)}</strong> weighted marks from your exam courses ({examCr} credits) - which is {S.toFixed(1)}% each.
            </p>
          </div>
          <div className="card" style={{ marginTop: 12 }}>
            <div className="eyebrow" style={{ marginBottom: 4 }}>What {S.toFixed(1)}% means on each paper</div>
            <p style={{ color: "var(--text-3)", fontSize: 12.5, marginTop: 0 }}>Mid-sem is scaled to 30, finals to 70. Aim for {S.toFixed(1)}% on both.</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 150, background: "var(--bg-3)", border: "1px solid var(--line)", borderRadius: 11, padding: 14 }}>
                <div className="mono" style={{ fontSize: 11, color: "var(--amber)" }}>MID-SEM · 30%</div>
                <div style={{ fontWeight: 700, fontSize: 22, margin: "4px 0" }}>{(0.30 * S).toFixed(1)}<span style={{ fontSize: 13, color: "var(--text-3)" }}> / 30</span></div>
              </div>
              <div style={{ flex: 1, minWidth: 150, background: "var(--bg-3)", border: "1px solid var(--line)", borderRadius: 11, padding: 14 }}>
                <div className="mono" style={{ fontSize: 11, color: "var(--amber)" }}>FINALS · 70%</div>
                <div style={{ fontWeight: 700, fontSize: 22, margin: "4px 0" }}>{(0.70 * S).toFixed(1)}<span style={{ fontSize: 13, color: "var(--text-3)" }}> / 70</span></div>
              </div>
            </div>
          </div>
          <div className="card" style={{ marginTop: 12 }}>
            <div className="eyebrow" style={{ marginBottom: 4 }}>Raw score to aim for, course by course</div>
            <p style={{ color: "var(--text-3)", fontSize: 12.5, marginTop: 0 }}>Set each paper's question count (mid-sem 70-100, finals 150-200) to see the marks to hit at {S.toFixed(1)}%.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 10, alignItems: "center", fontSize: 11, color: "var(--text-3)", fontWeight: 600, paddingBottom: 2 }}>
              <span>COURSE</span><span style={{ textAlign: "center" }}>MID-SEM</span><span style={{ textAlign: "center" }}>FINALS</span>
            </div>
            {planCourses.map((c) => {
              const cc = counts[c.id] || { mid: "80", fin: "200" };
              return (
                <div className="crs-line" key={c.id}>
                  <div><div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div><div className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>{c.cr} credits</div></div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: 700, color: "var(--good)", fontSize: 15 }}>{rawNeeded(cc.mid)}</div>
                    <input className="qbox" inputMode="numeric" value={cc.mid} onChange={(e) => setCounts((s) => ({ ...s, [c.id]: { ...cc, mid: e.target.value } }))} />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: 700, color: "var(--good)", fontSize: 15 }}>{rawNeeded(cc.fin)}</div>
                    <input className="qbox" inputMode="numeric" value={cc.fin} onChange={(e) => setCounts((s) => ({ ...s, [c.id]: { ...cc, fin: e.target.value } }))} />
                  </div>
                </div>
              );
            })}
            <p style={{ color: "var(--text-3)", fontSize: 12, marginTop: 10, lineHeight: 1.6 }}>The green number is the marks to score; the box beneath it is that paper's total questions. This assumes the same percentage on both papers - score higher on finals and you can ease off on the mid-sem.</p>
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------- LAMLA ---------------------------------- */
function LAMLAView({ app }) {
  const [step, setStep] = useState("setup");
  const [courseId, setCourseId] = useState("");
  const [hours, setHours] = useState(6);
  const [prep, setPrep] = useState(1);
  const [goal, setGoal] = useState("pass");
  const [examType, setExamType] = useState("MCQ");
  const [plan, setPlan] = useState(null);
  const [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState(false);

  const prepOptions = ["Not started", "Read once", "Mostly understand", "Just revising", "Confident"];
  const goalOptions = ["Pass", "B", "A", "Distinction"];
  const examOptions = ["MCQ", "Essay", "Practical", "Mixed"];
  const targetFor = (g) => g === "distinction" ? "90%" : g === "a" ? "80%" : g === "b" ? "70%" : "60%";

  /* offline fallback: order topics by position in the syllabus and time available */
  const fallbackPlan = () => {
    const topics = TOPICS[courseId] || [];
    const budget = Math.max(1, Math.round((hours * 60) * 0.8));
    const howMany = Math.max(3, Math.min(topics.length, Math.round(hours * 1.5)));
    const per = Math.max(10, Math.round(budget / howMany));
    const picked = topics.slice(0, howMany).map((title, i) => ({
      topic: title, index: i, allocatedMinutes: per,
      priority: i < howMany / 3 ? "High" : i < (howMany * 2) / 3 ? "Med" : "Low",
      bullets: ["Open this topic in ASCEND and read the lesson steps.", "Say the mechanism out loud in one sentence.", "Do the MCQs and review every wrong answer."]
    }));
    return { topics: picked, summary: { confidence: prep >= 3 ? "75%" : prep >= 1 ? "60%" : "45%", targetScore: targetFor(goal), focusAreas: picked.slice(0, 3).map((t) => t.topic) } };
  };

  const generatePlan = async () => {
    if (!courseId || busy) return;
    setBusy(true); setOffline(false);
    const course = courseById(courseId);
    const topics = TOPICS[courseId] || [];
    const prompt = `Emergency study plan for ${course.name} (${course.code}) at KNUST.
Student has ${hours} hours. Preparation level: "${prepOptions[prep]}". Goal: ${goal}. Exam format: ${examType}.
Syllabus topics, in order: ${topics.join("; ")}.
Choose only the highest-yield topics that fit the time, order them for revision, allocate minutes, and give 3 to 5 of the most testable points for each.
Return ONLY JSON, no markdown: {"topics":[{"topic":"name","allocatedMinutes":20,"priority":"High|Med|Low","bullets":["b1","b2","b3"]}],"summary":{"confidence":"65%","targetScore":"70%","focusAreas":["a","b","c"]}}`;
    try {
      const res = await callClaude("You are LAMLA, the Last Minute Learners Association emergency exam assistant for KNUST medical laboratory science students. Give only high-yield, testable points. No emojis.", [{ role: "user", content: prompt }], 2048);
      const clean = res.replace(/```json/gi, "").replace(/```/g, "").trim();
      const data = JSON.parse(clean);
      if (!data || !Array.isArray(data.topics) || !data.topics.length) throw new Error("bad shape");
      setPlan(data);
    } catch (e) {
      setPlan(fallbackPlan()); setOffline(true);
    }
    setStep("plan"); setBusy(false);
  };

  if (step === "setup") {
    return (
      <div className="view">
        <div className="eyebrow">LAMLA</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,28px)", margin: "6px 0 4px" }}>Last Minute Learners Association</h1>
        <p style={{ color: "var(--text-2)", marginTop: 0 }}>Tell us your situation and LAMLA builds a personalised rescue plan. When time is short, every minute must count.</p>
        <div className="card" style={{ marginTop: 18 }}>
          <label className="field"><span>Which course?</span>
            <select className="auth-input" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              <option value="">Select a course</option>
              {COURSES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="field"><span>How many hours do you have?</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[1, 2, 4, 6, 8, 12, 24].map((h) => (
                <button key={h} className="btn btn-sm" style={{ background: hours === h ? "var(--amber)" : "var(--bg-3)", color: hours === h ? "#1B1405" : "var(--text-2)", border: "1px solid var(--line)" }} onClick={() => setHours(h)}>{h}h</button>
              ))}
            </div>
          </label>
          <label className="field"><span>How prepared are you?</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {prepOptions.map((p, i) => (
                <button key={i} className="btn btn-sm" style={{ background: prep === i ? "var(--amber)" : "var(--bg-3)", color: prep === i ? "#1B1405" : "var(--text-2)", border: "1px solid var(--line)" }} onClick={() => setPrep(i)}>{p}</button>
              ))}
            </div>
          </label>
          <label className="field"><span>What is your goal?</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {goalOptions.map((g) => (
                <button key={g} className="btn btn-sm" style={{ background: goal === g.toLowerCase() ? "var(--amber)" : "var(--bg-3)", color: goal === g.toLowerCase() ? "#1B1405" : "var(--text-2)", border: "1px solid var(--line)" }} onClick={() => setGoal(g.toLowerCase())}>{g}</button>
              ))}
            </div>
          </label>
          <label className="field"><span>Exam type</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {examOptions.map((e) => (
                <button key={e} className="btn btn-sm" style={{ background: examType === e ? "var(--amber)" : "var(--bg-3)", color: examType === e ? "#1B1405" : "var(--text-2)", border: "1px solid var(--line)" }} onClick={() => setExamType(e)}>{e}</button>
              ))}
            </div>
          </label>
          <button className="btn btn-a" style={{ width: "100%", marginTop: 8, padding: "14px", fontSize: "15px" }} onClick={generatePlan} disabled={!courseId || busy}>
            {busy ? "Generating rescue plan..." : "Generate rescue plan"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="view">
      <button className="back" onClick={() => { setStep("setup"); setPlan(null); }}><Ic.chevR p={15} style={{ transform: "rotate(180deg)" }} /> Back</button>
      <div className="eyebrow">LAMLA · rescue plan</div>
      <h1 style={{ fontSize: "clamp(22px,4vw,28px)", margin: "6px 0 4px" }}>{courseById(courseId)?.name}</h1>
      <div className="card card-feature" style={{ marginTop: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, textAlign: "center" }}>
          <div><div className="eyebrow">Time</div><div style={{ fontSize: 20, fontWeight: 700, color: "var(--amber)" }}>{hours}h</div></div>
          <div><div className="eyebrow">Topics</div><div style={{ fontSize: 20, fontWeight: 700, color: "var(--good)" }}>{plan?.topics?.length || 0}</div></div>
          <div><div className="eyebrow">Confidence</div><div style={{ fontSize: 20, fontWeight: 700, color: "var(--amber-2)" }}>{plan?.summary?.confidence || "60%"}</div></div>
          <div><div className="eyebrow">Target</div><div style={{ fontSize: 20, fontWeight: 700, color: "var(--amber)" }}>{plan?.summary?.targetScore || targetFor(goal)}</div></div>
        </div>
      </div>
      {offline && <div className="card" style={{ marginTop: 12, color: "var(--text-2)", fontSize: 13.5, lineHeight: 1.6 }}>The live AI plan was unavailable, so this is ASCEND's offline ordering: work top to bottom, highest priority first. Connect your key proxy for the fully tailored plan.</div>}
      <div className="card" style={{ marginTop: 12 }}>
        <div className="eyebrow">Focus areas</div>
        <p style={{ color: "var(--text-2)", marginTop: 4 }}>{plan?.summary?.focusAreas?.join(" · ") || "Key topics only"}</p>
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Your plan, in order</div>
        {(plan?.topics || []).map((t, i) => (
          <div key={i} style={{ padding: "12px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
              <span className="mono" style={{ color: "var(--amber)", fontSize: 12 }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ fontWeight: 700, fontSize: 15, flex: 1, minWidth: 140 }}>{t.topic}</span>
              <span className="mono" style={{ fontSize: 12, color: "var(--amber)" }}>{t.allocatedMinutes} min</span>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 5, background: t.priority === "High" ? "var(--amber-dim)" : "var(--bg-3)", color: t.priority === "High" ? "var(--amber-2)" : "var(--text-3)" }}>{t.priority || "Med"}</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: 20, color: "var(--text-2)", fontSize: 14, lineHeight: 1.8 }}>
              {(t.bullets || []).map((b, bi) => <li key={bi}>{b}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <div className="eyebrow">Learning depth</div>
        <p style={{ color: "var(--text-2)", fontSize: 13.5, marginTop: 4 }}>{hours < 2 ? "Sixty-second explanations - skim the mechanism and move." : hours < 4 ? "Five-minute summaries per topic." : "Full lessons with clinical relevance."}</p>
      </div>
      <button className="btn btn-a" style={{ width: "100%", marginTop: 12, padding: "14px" }} onClick={() => app.go("courses")}>Start studying</button>
    </div>
  );
}

/* ------------------------------- feedback ------------------------------- */
function FeedbackView() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const submitFeedback = async () => {
    if (rating === 0) return;
    setBusy(true);
    await store.setShared("ascend_feedback:" + Date.now(), { rating, comment, timestamp: new Date().toISOString() });
    setSubmitted(true); setBusy(false);
  };
  if (submitted) {
    return (
      <div className="view">
        <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--good-dim)", color: "var(--good)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}><Ic.check p={28} /></div>
          <h2 style={{ fontSize: 22 }}>Thank you for your feedback</h2>
          <p style={{ color: "var(--text-2)", marginTop: 8 }}>Your input helps ASCEND improve for the whole class.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="view">
      <div className="eyebrow">Feedback</div>
      <h1 style={{ fontSize: "clamp(22px,4vw,28px)", margin: "6px 0 4px" }}>How is your experience?</h1>
      <p style={{ color: "var(--text-2)", marginTop: 0 }}>Tell us what is working, what broke, and what to build next.</p>
      <div className="card" style={{ marginTop: 18 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <button key={s} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} onClick={() => setRating(s)} style={{ background: "none", border: "none", cursor: "pointer", color: (hover || rating) >= s ? "var(--amber)" : "var(--text-3)" }}>
              <Ic.star p={34} fill={(hover || rating) >= s ? "currentColor" : "none"} />
            </button>
          ))}
        </div>
        <label className="field"><span>Comment, problem or suggestion</span>
          <textarea className="pastebox" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What did you like? What could be better? Any bug to report?" style={{ minHeight: "100px" }} />
        </label>
        <button className="btn btn-a" style={{ width: "100%", padding: "14px" }} onClick={submitFeedback} disabled={rating === 0 || busy}>{busy ? "Submitting..." : "Submit feedback"}</button>
      </div>
    </div>
  );
}

const NAV = [
  { key: "home", label: "Home", icon: "home" },
  { key: "courses", label: "Courses", icon: "book" },
  { key: "daily", label: "Daily", icon: "flame" },
  { key: "ranks", label: "Ranks", icon: "trophy" },
  { key: "papers", label: "Papers", icon: "file" },
  { key: "plan", label: "CWA", icon: "target" },
  { key: "resources", label: "Resources", icon: "upload" },
  { key: "lamla", label: "LAMLA", icon: "clock" },
  { key: "feedback", label: "Feedback", icon: "star" }
];

const DEFAULT_PROGRESS = { name: "Prince", xp: 0, streak: 0, lastActive: shift(-1), dailyDone: {}, completed: {} };

/* ------------------------------- app ------------------------------------ */
export default function App() {
  const [route, setRoute] = useState({ view: "home" });
  const [progress, setProgress] = useState(DEFAULT_PROGRESS);
  const [auth, setAuth] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [notifOpen, setNotifOpen] = useState(false);
  const [rateStars, setRateStars] = useState(0);
  const [rateDismissed, setRateDismissed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap";
    document.head.appendChild(link);
    (async () => {
      const t = await store.get("ascend_theme");
      if (t === "light" || t === "dark") setTheme(t);
      const session = await store.get("ascend_session");
      if (session) {
        const accounts = (await store.get("ascend_accounts")) || {};
        const acct = accounts[session];
        if (acct) {
          setAuth(acct);
          const p = await store.get(progKey(acct.username));
          setProgress(p ? { ...freshProgress(acct.username), ...p, name: acct.username } : freshProgress(acct.username));
        }
      }
      setLoaded(true);
    })();
    return () => { try { document.head.removeChild(link); } catch {} };
  }, []);

  const handleAuthed = async (acct) => {
    setAuth(acct);
    const p = await store.get(progKey(acct.username));
    setProgress(p ? { ...freshProgress(acct.username), ...p, name: acct.username } : freshProgress(acct.username));
    setRoute({ view: "home" });
  };
  const logout = async () => { await store.set("ascend_session", ""); setAuth(null); setMenuOpen(false); setRoute({ view: "home" }); };
  const toggleTheme = () => { const t = theme === "light" ? "dark" : "light"; setTheme(t); store.set("ascend_theme", t); };

  const persist = (p) => {
    setProgress(p);
    if (auth) store.set(progKey(auth.username), p);
    store.setShared("ascend_board:" + p.name.toLowerCase().replace(/[^a-z0-9]/g, ""), { name: p.name, xp: p.xp, streak: p.streak });
  };
  const go = (view, extra = {}) => { setRoute({ view, ...extra }); setMenuOpen(false); if (typeof window !== "undefined") window.scrollTo?.(0, 0); };

  const recordDaily = (correct) => {
    const tk = todayKey();
    if (progress.dailyDone?.[tk]) return;
    const streak = progress.lastActive === shift(-1) ? progress.streak + 1 : (progress.lastActive === tk ? progress.streak : 1);
    persist({ ...progress, xp: progress.xp + (correct ? 20 : 5), streak, lastActive: tk, dailyDone: { ...progress.dailyDone, [tk]: true } });
  };
  const finishQuiz = (cid, tid, correct) => {
    persist({ ...progress, xp: progress.xp + correct * 10, completed: { ...progress.completed, [`${cid}:${tid}`]: true } });
  };
  const setName = () => {
    const n = typeof window !== "undefined" ? window.prompt("Display name for the leaderboard", progress.name) : null;
    if (n && n.trim()) persist({ ...progress, name: n.trim().slice(0, 24) });
  };

  const app = { progress, go, recordDaily, finishQuiz, courseId: route.courseId, topicId: route.topicId };
  const render = () => {
    switch (route.view) {
      case "home": return <HomeView app={app} />;
      case "courses": return <CoursesView app={app} />;
      case "course": return <CourseView app={app} />;
      case "topic": return <TopicView app={app} />;
      case "quiz": return <QuizView app={app} />;
      case "daily": return <DailyView app={app} />;
      case "ranks": return <RanksView app={app} />;
      case "papers": return <PapersView />;
      case "plan": return <PlanView />;
      case "resources": return <ResourcesView />;
      case "lamla": return <LAMLAView app={app} />;
      case "feedback": return <FeedbackView />;
      default: return <HomeView app={app} />;
    }
  };
  const activeNav = ["course", "topic", "quiz"].includes(route.view) ? "courses" : route.view;
  const r = rankOf(progress.xp);
  const rootCls = "ascend-root" + (theme === "light" ? " light" : "");
  const dailyNotDone = !progress.dailyDone?.[todayKey()];
  const unreadAnn = (progress.seenAnn || 0) < ANNOUNCEMENTS.length;
  const hasUnread = unreadAnn || dailyNotDone;
  const openNotif = () => { setNotifOpen(true); if (unreadAnn) persist({ ...progress, seenAnn: ANNOUNCEMENTS.length }); };
  const showRate = !!auth && progress.xp >= 30 && !progress.rated && !progress.ratePromptSeen && !rateDismissed && route.view !== "feedback";

  if (!loaded) return <div className={rootCls}><style>{CSS}</style><div style={{ padding: 40, color: "var(--text-3)" }} className="mono">Loading ASCEND...</div></div>;
  if (!auth) return <div className={rootCls}><style>{CSS}</style><AuthScreen onAuthed={handleAuthed} /></div>;

  const navButtons = (onNav) => NAV.map((n) => {
    const Icon = Ic[n.icon];
    return <button key={n.key} className={"navi " + (activeNav === n.key ? "on" : "")} onClick={() => onNav(n.key)}><Icon p={19} />{n.label}</button>;
  });

  return (
    <div className={rootCls}>
      <style>{CSS}</style>
      <div className="shell">
        <aside className="side">
          <div style={{ padding: "0 6px 18px" }}><Wordmark /></div>
          {navButtons(go)}
          <div style={{ marginTop: "auto", padding: "14px 10px 0", borderTop: "1px solid var(--line)" }}>
            <div className="note-hint" style={{ lineHeight: 1.6, marginBottom: 10 }}>No gatekeeping.</div>
            <button className="btn btn-g btn-sm" style={{ width: "100%" }} onClick={logout}>Log out</button>
          </div>
        </aside>

        <div className="main">
          <header className="topbar">
            <button className="iconbtn onlymobile" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Ic.menu p={18} /></button>
            <div className="onlymobile" style={{ flex: 1 }}><Wordmark /></div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
              <span className="chip streakchip"><Ic.flame p={15} /><span className="val">{progress.streak}</span></span>
              <button className="iconbtn" onClick={toggleTheme} title="Toggle light and dark">{theme === "light" ? <Ic.moon p={17} /> : <Ic.sun p={17} />}</button>
              <button className="iconbtn" onClick={openNotif} title="Announcements"><Ic.bell p={18} />{hasUnread && <span className="notif-dot" />}</button>
              <span className="chip"><span className="val" style={{ color: r.c }}>{progress.xp}</span> XP</span>
              <button className="avatar" onClick={setName} title="Change your leaderboard name">{progress.name[0]?.toUpperCase()}</button>
            </div>
          </header>
          <div className="content">{render()}</div>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-sidebar-overlay" onClick={() => setMenuOpen(false)}>
          <div className="mobile-sidebar" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Wordmark />
              <button className="iconbtn" style={{ width: 30, height: 30 }} onClick={() => setMenuOpen(false)}><Ic.x p={15} /></button>
            </div>
            {navButtons(go)}
            <div style={{ marginTop: "auto", padding: "14px 18px", borderTop: "1px solid var(--line)" }}>
              <div className="note-hint" style={{ lineHeight: 1.6, marginBottom: 10 }}>No gatekeeping.</div>
              <button className="btn btn-g btn-sm" style={{ width: "100%" }} onClick={logout}>Log out</button>
            </div>
          </div>
        </div>
      )}

      {notifOpen && (
        <div className="notif-wrap">
          <div className="notif-scrim" onClick={() => setNotifOpen(false)} />
          <div className="notif-panel">
            <div className="notif-head">
              <div style={{ fontWeight: 700, fontSize: 15 }}>Announcements</div>
              <button className="iconbtn" style={{ width: 30, height: 30 }} onClick={() => setNotifOpen(false)}><Ic.x p={15} /></button>
            </div>
            {dailyNotDone && (
              <div className="notif-item" style={{ background: "var(--amber-dim)" }}>
                <div className="mono" style={{ fontSize: 11, color: "var(--amber-2)", marginBottom: 4 }}>REMINDER</div>
                <div style={{ fontWeight: 650, marginBottom: 3 }}>Today's daily question is waiting</div>
                <div style={{ color: "var(--text-2)", fontSize: 13.5, marginBottom: 9 }}>Keep your streak alive - it only takes a minute.</div>
                <button className="btn btn-a btn-sm" onClick={() => { setNotifOpen(false); go("daily"); }}>Go to daily</button>
              </div>
            )}
            {ANNOUNCEMENTS.map((a) => (
              <div className="notif-item" key={a.id}>
                <div className="mono" style={{ fontSize: 11, color: "var(--amber)", marginBottom: 4 }}>{a.tag.toUpperCase()}</div>
                <div style={{ fontWeight: 650, marginBottom: 3 }}>{a.title}</div>
                <div style={{ color: "var(--text-2)", fontSize: 13.5, lineHeight: 1.6 }}>{a.body}</div>
              </div>
            ))}
            <div style={{ padding: "14px 18px" }}>
              <button className="btn btn-g btn-sm" style={{ width: "100%" }} onClick={() => { setNotifOpen(false); go("feedback"); }}>Send feedback</button>
            </div>
          </div>
        </div>
      )}

      {showRate && (
        <div className="notif-wrap" style={{ justifyContent: "center", alignItems: "center" }}>
          <div className="notif-scrim" onClick={() => setRateDismissed(true)} />
          <div className="notif-panel" style={{ margin: 0, width: "min(400px, calc(100vw - 32px))", maxHeight: "none" }}>
            <div style={{ padding: 22, textAlign: "center" }}>
              <div className="eyebrow" style={{ color: "var(--amber)" }}>Enjoying ASCEND?</div>
              <h3 style={{ fontSize: 19, margin: "8px 0 4px" }}>Rate your experience</h3>
              <p style={{ color: "var(--text-2)", fontSize: 13.5, marginTop: 0 }}>A quick tap helps us make it better for the whole class.</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", margin: "8px 0 16px" }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => setRateStars(s)} style={{ background: "none", border: "none", cursor: "pointer", color: rateStars >= s ? "var(--amber)" : "var(--text-3)" }}>
                    <Ic.star p={30} fill={rateStars >= s ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
              <button className="btn btn-a" style={{ width: "100%" }} disabled={rateStars === 0} onClick={() => { store.setShared("ascend_feedback:" + Date.now(), { rating: rateStars, comment: "", timestamp: new Date().toISOString() }); persist({ ...progress, rated: true }); setRateDismissed(true); }}>Submit</button>
              <button className="btn btn-g btn-sm" style={{ width: "100%", marginTop: 8 }} onClick={() => { persist({ ...progress, ratePromptSeen: true }); setRateDismissed(true); }}>Maybe later</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
