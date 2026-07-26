import React, { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";

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
.shell{display:flex;min-height:100vh;max-width:1440px;margin:0 auto;width:100%}
/* The permanent sidebar is retired in favour of the tap-to-open menu at every
   screen size, so the layout is consistent between laptop and phone. */
.side{display:none}
.main{flex:1;min-width:0;display:flex;flex-direction:column;max-width:100%;overflow-x:hidden}
.topbar{position:sticky;top:0;z-index:20;background:rgba(10,15,26,.82);
  backdrop-filter:blur(10px);border-bottom:1px solid var(--line);
  padding:13px 26px;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.content{padding:26px 30px 60px;max-width:100%;overflow-x:hidden}
/* keep long-form reading comfortable while the app still fills the window */
.content>.view{max-width:1080px;margin:0 auto;width:100%}
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
/* the menu button and wordmark now show at every size */
.onlymobile{display:flex}
/* comfortable reading width on large screens */
@media (min-width:1280px){
  .content{padding:30px 44px 70px}
}
/* tighter padding on phones */
@media (max-width:900px){
  .content{padding:16px 14px 50px}
  .content>.view{max-width:100%}
  .topbar{padding:10px 14px;gap:8px}
  .card{padding:14px}
  .grid{grid-template-columns:1fr;gap:12px}
  .g2,.g3{grid-template-columns:1fr}
  .plan-row{flex-direction:column;gap:10px}
  .plan-row>.field{min-width:100%}
  .headline{font-size:32px}
  .notif-panel{margin:40px 12px 0;width:calc(100vw - 24px)}
}
@media(min-width:640px){.g2{grid-template-columns:1fr 1fr}.g3{grid-template-columns:1fr 1fr 1fr}}
@media (max-width:480px){
  .content{padding:12px 10px 40px}
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

/* --------------------------- ana:2 --------------------------- */
const T_ANA_EPI_OVERVIEW = {
  courseId: "ana",
  topicIndex: 2,
  title: "Epithelium - Overview",
  minutes: 19,
  note: [
    { q: "Of the four tissues, why start with epithelium, and what defines it?",
      body: `In histology you met the four primary tissues in passing. Now we slow down and take the first one apart, because epithelium is where laboratory medicine looks most often - almost every biopsy, every Pap smear, every gut or skin sample you will ever handle is read as epithelium first.

My Socratic question: what single feature separates epithelium from the other three tissues at a glance down the microscope?

(Hint: think about what is between the cells.)

The answer is cellularity. Epithelium is packed almost entirely with cells, sitting shoulder to shoulder with only a thin film of glue between them. This is the exact opposite of connective tissue, where cells are sparse and the matrix dominates. If a slide shows a dense sheet of cells with almost no space between them, you are almost certainly looking at epithelium.

Epithelium does three great jobs. It covers the outside of the body and lines every cavity and tube inside it, it forms the glands that secrete, and at every boundary it controls what crosses.

Crucial insight: hold epithelium and connective tissue as a permanent pair of opposites - many cells and little matrix versus few cells and much matrix. That one contrast resolves most tissue-identification questions before you even look at cell shape.` },

    { q: "What are the four defining characteristics every epithelium shares?",
      body: `Beyond being cell-dense, epithelium has four properties that appear again and again in exams, and each one has a reason.

Cellularity with little extracellular material, as we said - cells bound tightly to their neighbours by specialised junctions, so the sheet holds together and controls what leaks between cells.

Polarity. Every epithelial cell has two different ends. The apical surface faces the outside world or the hollow space of a tube or cavity; the basal surface faces inward and sits on the basement membrane. The two ends carry different proteins and do different jobs - a gut lining cell absorbs at its apical surface and passes nutrients out through its basal surface.

Attachment to a basement membrane. Every epithelium rests on a thin, non-cellular sheet called the basement membrane, which anchors it to the connective tissue beneath and acts as a selective filter.

Avascularity. Epithelium contains no blood vessels of its own. It is fed entirely by diffusion from the vessels in the connective tissue below the basement membrane.

Crucial insight: avascularity and the basement membrane are linked, and they explain a clinical fact. Because nutrients must diffuse up from below, epithelium cannot be too thick, and it can only survive resting on vascular connective tissue. When cancers are described as in situ, meaning still above the basement membrane, they have not yet reached blood vessels and cannot spread - crossing that membrane is the step that turns a local growth into an invasive one.` },

    { q: "Where does epithelium come from, and why does that matter?",
      body: `Epithelium has one more distinctive property: it regenerates. The cells lining your gut are replaced every few days, and your skin surface is entirely renewed within weeks.

My Socratic question: a tissue that is constantly worn away at its surface must be constantly rebuilt from somewhere. Where are the new cells made?

The answer is the basal layer. The deepest cells, resting on the basement membrane, divide continuously; their daughters are pushed toward the surface, mature as they travel, and are eventually shed. This is why the basement membrane matters so much - it is the anchor for the dividing stem-like cells that keep the whole sheet alive.

Epithelium arises embryologically from all three germ layers - ectoderm forms the epidermis, endoderm forms the gut lining, mesoderm forms the lining of blood vessels and body cavities. The linings derived from mesoderm get special names you should know: endothelium lines the blood vessels and heart, and mesothelium lines the great body cavities such as the pleura and peritoneum.

Crucial insight: high turnover is a double-edged sword. Rapidly dividing tissue heals fast, which is why a graze on the skin or a gut ulcer repairs quickly - but rapid division also means more chances for mutation, which is why the great majority of human cancers, the carcinomas, arise from epithelium rather than from the slow-dividing tissues.` },

    { q: "The classification: which two questions name every epithelium?",
      body: `Epithelium looks bewilderingly varied, but the whole system reduces to two questions asked in order. You met this in histology; here it becomes second nature.

The first question is how many layers of cells there are. If there is a single layer, with every cell touching the basement membrane, it is simple. If there are two or more layers, with only the deepest touching the membrane, it is stratified.

The second question is the shape of the cells - and specifically, in a stratified epithelium, the shape of the cells at the apical surface. Squamous cells are flat and scale-like, wider than they are tall, like a fried egg. Cuboidal cells are box-shaped, about as tall as they are wide. Columnar cells are tall, like a brick standing on end, taller than they are wide.

Combine the answers and you have the name: simple squamous, simple cuboidal, simple columnar, stratified squamous, and so on.

Crucial insight: the logic of the pairing is not arbitrary - it follows function. A single flat layer is the thinnest possible barrier, perfect for rapid diffusion. Many layers of tough flat cells make the best shield against abrasion. Tall cells have room for the machinery of secretion and absorption. Once you see that shape and number follow the job, you can predict the tissue from its location, or the location from the tissue.` },

    { q: "Why does layer number follow function so exactly?",
      body: `Take the first question - simple versus stratified - and see how completely it is dictated by the job the tissue must do.

Simple epithelium is a single cell layer, so it is thin. Thinness is ideal wherever something must cross quickly and easily: oxygen and carbon dioxide across the air sacs of the lungs, nutrients across the gut lining, filtered fluid across the kidney tubule. A thick barrier here would defeat the purpose. But a single delicate layer cannot survive friction, so simple epithelium is only found in sheltered internal locations.

Stratified epithelium is many layers, so it is thick and tough. Thickness is ideal wherever the surface is battered: the skin, the lining of the mouth and oesophagus, the outer eye. The top cells are worn away and constantly replaced from below, so the tissue can be scraped and abraded without the barrier ever being breached. But all those layers make it useless for diffusion, so you will never find stratified epithelium where exchange must happen.

Crucial insight: this gives you a diagnostic shortcut. Ask what the location does. If its job is exchange or filtration or absorption, expect simple. If its job is protection against physical or chemical assault, expect stratified. You can reason out the tissue from first principles instead of memorising a list - which is exactly what an examiner rewards.` },

    { q: "Reading cell shape, and the three surface specialisations.",
      body: `The second question, cell shape, tells you what the tissue does at its free surface. And many epithelia add surface modifications that announce their function even more loudly.

Squamous cells, being flat, offer the least resistance to diffusion and the best flat shield when stacked - so they appear at exchange surfaces when simple, and protective surfaces when stratified. Cuboidal and columnar cells, being taller, have room inside for secretory granules and absorptive machinery - so they dominate glands, ducts and absorptive linings.

Three surface specialisations are worth recognising on sight, because each names a job. Microvilli are tiny finger-like projections that hugely increase the apical surface area for absorption - a dense fringe of them on a gut cell forms the brush border. Cilia are longer, motile, hair-like structures that beat in waves to sweep material along a surface, as in the trachea moving mucus upward. Keratin is a tough, waterproof protein deposited in the surface cells of skin, sealing the body against water loss and abrasion.

Crucial insight: a specialisation is a clue you can read backwards. See a brush border and you are looking at an absorptive surface, almost certainly gut or kidney tubule. See cilia and you are in an airway or the reproductive tract. See keratin and you are at a dry, exposed body surface. The structure is telling you the function without a label.` },

    { q: "Cell junctions: how the sheet is held together and sealed.",
      body: `A barrier is only as good as its seams. Epithelial cells are joined by a set of specialised junctions, and each solves a different mechanical or sealing problem. You need the concept, not exhaustive detail, at this stage.

My Socratic question: a sheet of cells lining the gut must do two contradictory things - stick together strongly against the churning, and seal the gaps so gut contents cannot leak between the cells into the body. Can one junction do both?

The answer is no, and that is why there are several types working together. Tight junctions near the apical surface fuse neighbouring membranes and seal the space between cells, controlling what can pass between them and separating the apical from the basal domain, which is what makes polarity possible. Anchoring junctions, including desmosomes, act like rivets and welds that bind cells firmly to one another and to the basement membrane, giving the sheet its mechanical strength. Gap junctions are pores that connect the insides of adjacent cells directly, letting ions and small molecules pass so the cells can act in a coordinated way.

Crucial insight: tight junctions are why your gut can hold digestive enzymes and bacteria in the lumen without them leaking into your bloodstream. When these junctions fail, the barrier becomes leaky - a mechanism now linked to inflammation in the gut and elsewhere. The seam, not just the cell, is what makes epithelium a barrier.` },

    { q: "The basement membrane and the clinical line it draws.",
      body: `We keep returning to the basement membrane because it is the single most clinically important structure in this whole topic.

It is a thin, non-cellular sheet, secreted jointly by the epithelium above and the connective tissue below, lying exactly at their boundary. It does several jobs at once: it anchors the epithelium so the sheet does not slide off, it acts as a selective molecular filter, and it provides the scaffold along which cells migrate during healing.

My Socratic question: why is this thin sheet the structure oncologists care about more than almost any other?

The answer is that it is the border between local and dangerous. An abnormal epithelial growth that remains above the basement membrane is carcinoma in situ - contained, curable by local removal, unable to spread because it has not reached blood or lymphatic vessels, which all lie below. The moment those cells breach the basement membrane and invade the connective tissue beneath, the cancer becomes invasive: now it can reach vessels and metastasise. That single microscopic line is the difference the pathologist is looking for.

Crucial insight: everything in this topic converges on the basement membrane. It is the anchor for the dividing cells that renew the sheet, the reason epithelium is avascular and therefore thin, the filter, and the frontier a cancer must cross to become deadly. Understand this one structure and epithelium as a whole makes sense.` },

    { q: "Putting it together: reading three real surfaces.",
      body: `Let us apply the whole framework to three locations and predict the epithelium from the job, the way form-follows-function lets you do.

The air sac of the lung. Its job is gas exchange - oxygen and carbon dioxide must cross as fast as possible. The demand is a barrier as thin as life allows. Prediction: simple squamous epithelium, a single flat layer. Correct, and it is why a lung can move gases across a membrane less than a micrometre thick.

The lining of the small intestine. Its job is to absorb nutrients from digested food. The demands are a single layer thin enough to pass nutrients through, tall cells with room for absorptive machinery, and maximum surface area. Prediction: simple columnar epithelium with a brush border of microvilli. Correct - and goblet cells are scattered among them to secrete lubricating mucus.

The surface of the skin. Its job is protection against abrasion, water loss and invasion. The demands are many tough layers, constantly renewed, sealed against water. Prediction: keratinized stratified squamous epithelium. Correct - many flat layers, dead and keratin-filled at the very top.

Crucial insight: notice you never once had to memorise these. Each fell out of asking what the location must do. That is the entire method of this topic, and it is far more durable than any list, because it works on tissues you have never seen before.` },

    { q: "Consolidation and your final test.",
      body: `Your cognitive map for epithelium, in five lines.

What it is: the covering, lining and glandular tissue - cell-dense, with almost no matrix, the opposite of connective tissue.

Its four defining features: high cellularity with junctions, polarity with distinct apical and basal surfaces, attachment to a basement membrane, and avascularity with nutrition by diffusion from below.

Its classification: two questions - how many layers (simple or stratified), then the apical cell shape (squamous, cuboidal, columnar).

Its guiding rule: form follows function. Thin simple sheets for exchange, thick stratified sheets for protection, tall cells for secretion and absorption, and surface specialisations - microvilli, cilia, keratin - that each announce a job.

Its clinical anchor: the basement membrane, the line whose crossing turns contained carcinoma in situ into invasive cancer.

Now your final test. A pathologist examines a biopsy from the cervix and reports keratinized stratified squamous epithelium at the surface, with abnormal dividing cells confined entirely above an intact basement membrane.

Question one: what is the normal job of stratified squamous epithelium, and does its presence at the cervix make sense?
Question two: which layer of this epithelium normally divides, and where do the new cells go?
Question three: the report stresses that the basement membrane is intact. Why is that the single most important word in the report for the patient?

Work them through before reading on.

My answers. One: protection against abrasion; the lower cervix is exposed to the physical stresses of the vaginal canal, so a tough, many-layered, renewable surface is exactly right. Two: the basal layer, resting on the basement membrane, divides; its daughter cells are pushed toward the surface, flatten as they mature, and are shed from the top. Three: because an intact basement membrane means the abnormal cells are still carcinoma in situ - contained, unable to reach the blood or lymphatic vessels that lie below it, and therefore curable by local removal. The day those cells breach that membrane, the disease becomes invasive and can spread. That one line is the difference between a minor procedure and a life-threatening cancer.

If those came cleanly, you now understand epithelium as a system, not a list. The membranous epithelia in full detail come next.` },
  ],
  theory: [
    { q: "State the single feature that distinguishes epithelium from the other three tissues, and contrast it with connective tissue.", a: "High cellularity - epithelium is packed with tightly joined cells and has almost no extracellular matrix. This is the opposite of connective tissue, in which cells are sparse and the extracellular matrix dominates." },
    { q: "List the four defining characteristics of epithelium.", a: "High cellularity with cell junctions and little matrix; polarity with distinct apical and basal surfaces; attachment to a basement membrane; and avascularity, being nourished by diffusion from the underlying connective tissue." },
    { q: "What is polarity in an epithelial cell and why does it matter?", a: "Polarity means the cell has two structurally and functionally distinct ends - an apical surface facing the lumen or exterior and a basal surface resting on the basement membrane. It allows directional transport, for example absorbing at the apical surface and exporting at the basal surface." },
    { q: "Why is epithelium avascular, and how is it nourished?", a: "It contains no blood vessels of its own. It receives nutrients by diffusion from the capillaries in the connective tissue beneath the basement membrane, which is why epithelium must remain relatively thin and always rests on vascular connective tissue." },
    { q: "Which layer of an epithelium divides, and what happens to the new cells?", a: "The basal layer, resting on the basement membrane, divides continuously. Its daughter cells are pushed toward the apical surface, mature as they migrate, and are eventually shed, giving epithelium its high turnover and rapid healing." },
    { q: "Define endothelium and mesothelium.", a: "Endothelium is the simple squamous epithelium lining blood vessels and the heart. Mesothelium is the simple squamous epithelium lining the great body cavities such as the pleura, pericardium and peritoneum. Both are of mesodermal origin." },
    { q: "State the two criteria used to classify epithelium and how a stratified epithelium is named.", a: "The number of layers (simple, a single layer with every cell on the basement membrane; or stratified, two or more layers) and the shape of the cells (squamous, cuboidal or columnar). A stratified epithelium is named for the shape of its apical, most superficial layer." },
    { q: "Explain why simple epithelium suits exchange while stratified suits protection.", a: "Simple epithelium is a single thin layer, offering minimal resistance to diffusion, filtration and absorption. Stratified epithelium is many layers thick; its surface cells are worn away and continuously replaced from below, allowing it to withstand abrasion without breaching the barrier, but its thickness makes it unsuitable for exchange." },
    { q: "Name the three common surface specialisations and the function of each.", a: "Microvilli are small projections that increase apical surface area for absorption, forming a brush border. Cilia are longer motile projections that beat to move substances such as mucus across the surface. Keratin is a tough waterproof protein in the surface cells of skin providing protection and preventing water loss." },
    { q: "Why is the basement membrane the critical structure in distinguishing in situ from invasive carcinoma?", a: "Carcinoma in situ remains above an intact basement membrane, so it has not reached the blood or lymphatic vessels that lie below and cannot metastasise; it is curable by local removal. Once the cells breach the basement membrane and invade the underlying connective tissue, the cancer becomes invasive and can spread." },
  ],
  videos: [
    { channel: "Kenhub", title: "Types of Simple Epithelia", note: "Clear, labelled walk-through of each simple epithelium with its location and function.", url: "https://www.youtube.com/watch?v=-koWOLMd904" },
    { channel: "Dr. G Bhanu Prakash", title: "Epithelial Tissue: Simple, Stratified, Pseudostratified, Transitional", note: "Complete classification in one animated lecture - good for the whole system at once.", url: "https://www.youtube.com/watch?v=chl91a2Cm-Y" },
    { channel: "AnimatedBiology With Arpan", title: "Epithelial Tissue: Classification, Functions and Clinical Significance", note: "Adds the clinical angle, including junctions and the basement membrane.", url: "https://www.youtube.com/watch?v=_pw5wbEL07c" },
  ],
  mcqs: [
    { q: "The feature that most distinguishes epithelium from connective tissue is:", o: ["Scattered cells", "High cellularity with little matrix", "Abundant matrix", "Presence of blood vessels"], a: 1, w: "Epithelium is cell-dense with minimal matrix; connective tissue is the opposite." },
    { q: "Which is NOT a defining feature of epithelium?", o: ["High cellularity", "A rich internal blood supply", "Attachment to a basement membrane", "Polarity"], a: 1, w: "Epithelium is avascular; it has no blood vessels of its own." },
    { q: "The apical surface of an epithelial cell:", o: ["Rests on the basement membrane", "Attaches to connective tissue", "Contains the nucleus only", "Faces the lumen or external surface"], a: 3, w: "The apical surface faces the outside world or the hollow lumen." },
    { q: "Epithelium obtains its nutrients by:", o: ["Lymphatic vessels within it", "Diffusion from underlying connective tissue", "Its own capillaries", "Direct arterial branches"], a: 1, w: "Being avascular, it is fed by diffusion from the connective tissue below." },
    { q: "The property of having distinct apical and basal surfaces is called:", o: ["Avascularity", "Polarity", "Stratification", "Cellularity"], a: 1, w: "Polarity is the structural and functional difference between the two ends." },
    { q: "New epithelial cells are produced by division in the:", o: ["Basal layer", "Basement membrane itself", "Apical layer", "Middle layer"], a: 0, w: "Basal cells divide and their daughters migrate toward the surface." },
    { q: "The simple squamous epithelium lining blood vessels is called:", o: ["Endothelium", "Urothelium", "Epidermis", "Mesothelium"], a: 0, w: "Endothelium lines the blood vessels and heart." },
    { q: "The epithelium lining the pleura and peritoneum is called:", o: ["Urothelium", "Endothelium", "Mesothelium", "Epidermis"], a: 2, w: "Mesothelium lines the great body cavities." },
    { q: "A simple epithelium is defined as one in which:", o: ["There are always cilia", "Two layers are present", "Every cell contacts the basement membrane", "Cells are all flat"], a: 2, w: "Simple means a single layer, so every cell touches the basement membrane." },
    { q: "Stratified epithelium is named according to the shape of cells in its:", o: ["Basement membrane", "Basal layer", "Apical (most superficial) layer", "Middle layer"], a: 2, w: "Stratified epithelia are named for their most superficial layer." },
    { q: "Squamous cells are best described as:", o: ["Flat and scale-like", "Spherical", "Tall and column-like", "Box-shaped"], a: 0, w: "Squamous cells are flattened, wider than they are tall." },
    { q: "Columnar cells are best described as:", o: ["Taller than they are wide", "As wide as they are tall", "Flat", "Star-shaped"], a: 0, w: "Columnar cells are tall, like a brick standing on end." },
    { q: "Simple squamous epithelium is ideally suited to:", o: ["Bearing mechanical stress", "Mucus secretion in bulk", "Rapid diffusion and filtration", "Protection against abrasion"], a: 2, w: "A single flat layer is the thinnest barrier, perfect for exchange." },
    { q: "Which epithelium best resists constant abrasion?", o: ["Simple squamous", "Stratified squamous", "Simple cuboidal", "Simple columnar"], a: 1, w: "Many tough layers, renewed from below, withstand wear." },
    { q: "Tall cells such as columnar cells are typically specialised for:", o: ["Filtration only", "Bearing weight", "Secretion and absorption", "Diffusion only"], a: 2, w: "Their height gives room for secretory and absorptive machinery." },
    { q: "Microvilli on an apical surface indicate a function of:", o: ["Contraction", "Protection", "Absorption", "Insulation"], a: 2, w: "Microvilli increase surface area for absorption, forming a brush border." },
    { q: "Motile hair-like projections that sweep material across a surface are:", o: ["Desmosomes", "Microvilli", "Keratin", "Cilia"], a: 3, w: "Cilia beat in coordinated waves to move mucus and other material." },
    { q: "Keratin in surface epithelial cells provides:", o: ["Absorption", "Secretion of mucus", "Rapid diffusion", "A tough waterproof barrier"], a: 3, w: "Keratin waterproofs and toughens exposed surfaces such as skin." },
    { q: "The junction that seals the space between epithelial cells is the:", o: ["Gap junction", "Hemidesmosome", "Desmosome", "Tight junction"], a: 3, w: "Tight junctions fuse adjacent membranes and seal the intercellular space." },
    { q: "Junctions that act like rivets to give the sheet mechanical strength are:", o: ["Tight junctions", "Desmosomes", "Gap junctions", "Aquaporins"], a: 1, w: "Desmosomes are anchoring junctions binding cells firmly together." },
    { q: "Gap junctions function to:", o: ["Seal the intercellular space", "Anchor cells to the membrane", "Waterproof the surface", "Allow ions and small molecules to pass between cells"], a: 3, w: "Gap junctions are pores permitting direct communication between cells." },
    { q: "The basement membrane is:", o: ["A blood vessel network", "The apical surface", "A thin non-cellular sheet under the epithelium", "A layer of muscle"], a: 2, w: "It is a thin acellular sheet at the epithelium-connective tissue boundary." },
    { q: "Carcinoma in situ is defined by abnormal cells that:", o: ["Are found in connective tissue", "Remain above an intact basement membrane", "Have spread to other organs", "Have entered the blood"], a: 1, w: "In situ means still confined above the basement membrane, unable to spread." },
    { q: "A cancer becomes invasive when its cells:", o: ["Divide rapidly", "Breach the basement membrane", "Produce keratin", "Form a single layer"], a: 1, w: "Crossing the basement membrane gives access to vessels and allows spread." },
    { q: "Most human cancers (carcinomas) arise from epithelium mainly because it:", o: ["Divides rapidly, accumulating mutations", "Is avascular", "Contains keratin", "Has no nerves"], a: 0, w: "High turnover means more cell divisions and more chances for mutation." },
    { q: "The epithelium of the small intestine is:", o: ["Simple columnar with microvilli", "Stratified squamous", "Transitional", "Simple squamous"], a: 0, w: "A single tall layer with a brush border maximises absorption." },
    { q: "The epithelium of the epidermis of skin is:", o: ["Keratinized stratified squamous", "Simple columnar", "Simple squamous", "Pseudostratified columnar"], a: 0, w: "Many keratin-filled flat layers protect against abrasion and water loss." },
    { q: "Epithelium arises embryologically from:", o: ["Mesoderm only", "Ectoderm only", "Endoderm only", "All three germ layers"], a: 3, w: "Epithelia derive from ectoderm, endoderm and mesoderm." },
    { q: "The high regenerative capacity of epithelium is clinically useful because it:", o: ["Prevents all cancer", "Removes the need for blood supply", "Stops mutation", "Allows rapid healing of surfaces"], a: 3, w: "Constant renewal repairs grazes and ulcers quickly." },
    { q: "To predict whether an epithelium is simple or stratified, the best question to ask is:", o: ["Does the location need exchange or protection", "Is the location dry or wet", "How old is the patient", "Is the tissue coloured"], a: 0, w: "Exchange and absorption favour simple; protection favours stratified." },
  ],
};

/* --------------------------- ana:3 --------------------------- */
const T_ANA_EPI_MEMB = {
  courseId: "ana",
  topicIndex: 3,
  title: "Membranous (Covering & Lining) Epithelium",
  minutes: 20,
  note: [
    { q: "You have the classification system. Now what do we do with it?",
      body: `In the overview you learned the machine that names any epithelium: count the layers, then read the apical cell shape. This topic runs every real epithelium through that machine, so that a name on a slide becomes a location, a function and a reason.

Membranous epithelium means the covering and lining epithelia - the sheets that wrap surfaces and line tubes and cavities. It is set against glandular epithelium, the secreting kind, which is the next topic. Here we stay with the sheets.

My Socratic question: there are only a handful of named membranous epithelia. Why bother learning each one's location, rather than just the classification rule?

The answer is that the classification tells you what a tissue is; the location and function tell you why it is there, and that is what exams and diagnosis actually test. A pathologist who finds stratified squamous epithelium where simple columnar should be is looking at disease. You cannot recognise the abnormal until you have made the normal automatic.

Crucial insight: work through this topic as a table you build in your head - name, structure, location, function - but never memorise it as a flat list. Each entry should feel inevitable once you ask what its location demands. Build it that way and it stays; memorise it cold and it fades by the exam.` },

    { q: "Simple squamous: the thinnest barrier in the body.",
      body: `Simple squamous epithelium is a single layer of flat, scale-like cells. Seen from above the cells look like crazy-paving; seen in section they are so thin the nucleus makes a small bulge in an otherwise flat line.

My Socratic question: what job demands the thinnest possible living barrier, and where in the body is that job done?

The answer is any surface across which substances must move fast and freely - diffusion, filtration, or the smooth flow of fluid. Three classic locations follow directly.

The air sacs of the lungs, the alveoli, where oxygen and carbon dioxide diffuse between air and blood across a barrier less than a micrometre thick. The filtration membrane of the kidney, in the glomerulus, where blood is filtered into the tubule. And the lining of all blood and lymphatic vessels and the heart - given its own name, endothelium - and the lining of the body cavities - given its own name, mesothelium - both providing a slick, friction-free surface for blood to flow and organs to slide.

Crucial insight: simple squamous epithelium is only ever found in protected internal sites, never anywhere exposed, because a single flat layer is far too delicate to survive friction. Its thinness is its whole purpose and also its whole weakness.` },

    { q: "Simple cuboidal: the workhorse of ducts and tubules.",
      body: `Simple cuboidal epithelium is a single layer of box-shaped cells, about as tall as they are wide, each with a round central nucleus. In section it looks like a row of small square boxes.

My Socratic question: raising the cells from flat to cuboidal gives them internal volume. What does that extra volume let them do that squamous cells cannot?

The answer is active work - secretion and absorption, which need room for organelles, mitochondria and transport machinery. Flat cells have no space for this; cuboidal cells do.

So simple cuboidal appears wherever a tissue must actively move substances in a small tube. It lines the kidney tubules, where it reabsorbs useful molecules from the filtrate. It forms the walls of many small gland ducts. And it covers the surface of the ovary and lines the thyroid follicles, which store and secrete hormone.

Crucial insight: the kidney is the perfect illustration of shape following function. The glomerulus, which only needs to filter, is lined by ultra-thin simple squamous; the tubules, which must actively reabsorb, are lined by simple cuboidal a step taller. Two epithelia, side by side in one organ, each shaped for its exact task.` },

    { q: "Simple columnar: the lining built for absorption.",
      body: `Simple columnar epithelium is a single layer of tall cells, distinctly taller than they are wide, with oval nuclei usually lined up neatly near the base.

My Socratic question: what is gained by making an absorptive cell tall rather than merely cuboidal?

The answer is still more room - for even more absorptive and secretory machinery, and for surface specialisations. This is the lining of most of the digestive tract, from the stomach to the rectum, and it comes in two flavours.

Where it must absorb, as in the small intestine, the cells carry a brush border of microvilli to multiply the absorbing surface, and goblet cells sit among them secreting lubricating mucus. Where it mainly secretes and protects, as in the stomach, the surface is smooth and mucus-secreting. In some regions, such as parts of the uterine tube, the columnar cells are ciliated, beating to move the egg along.

Crucial insight: the neat basal row of nuclei is the visual key that separates true simple columnar from the pseudostratified type you meet next. In simple columnar the nuclei sit in a tidy line; the moment they scatter to several heights, you must think again.` },

    { q: "Pseudostratified columnar: the great impostor.",
      body: `Pseudostratified columnar epithelium is the one that catches students out, so slow down here.

Every cell in it rests on the basement membrane, which by definition makes it a simple epithelium - a single layer. But the cells are of different heights, not all reaching the surface, and their nuclei sit at many different levels. The eye reads those scattered nuclei as several layers, so the tissue looks stratified. It is not. It only pretends to be, which is exactly what pseudo means.

My Socratic question: how do you tell this impostor from a genuinely stratified epithelium on a slide?

The answer is two tells. First, follow the cells down - in pseudostratified, every cell touches the basement membrane, even the short ones. Second, and quicker, look for cilia. Stratified epithelia never bear cilia, so a ciliated, layered-looking columnar epithelium is pseudostratified by definition.

Its classic home is the respiratory tract - the lining of the nose, trachea and bronchi - where it is ciliated and packed with goblet cells. The goblet cells secrete mucus that traps inhaled dust and microbes; the cilia beat in waves to sweep that mucus up toward the throat. This is the mucociliary escalator, the airway's self-cleaning mechanism.

Crucial insight: this is why smoking is so damaging. Tobacco smoke paralyses and then destroys the cilia, so the escalator stops. Mucus and trapped particles pool in the airway, which is the smoker's cough - the lungs trying to clear by force what the cilia can no longer sweep.` },

    { q: "Stratified squamous: the body's armour.",
      body: `Now we cross into the stratified epithelia, many layers thick, built not for exchange but for defence. Stratified squamous is by far the most important and abundant.

It has many layers. The deepest, on the basement membrane, are cuboidal or columnar and divide constantly. As their daughters are pushed upward they flatten, so the surface layer is squamous - and remember the rule: a stratified epithelium is named for its apical shape, so despite the cuboidal base, this is stratified squamous.

My Socratic question: it comes in two forms, keratinized and non-keratinized. What environmental difference decides which you find?

The answer is wet versus dry. Keratinized stratified squamous has a surface of dead, flattened cells filled with the tough waterproof protein keratin. It forms the epidermis of the skin - dry, exposed, and needing to be sealed against water loss. Non-keratinized stratified squamous keeps living, moist surface cells and no keratin layer. It lines wet internal surfaces that still take abrasion: the mouth, the oesophagus, the vagina.

Crucial insight: the presence or absence of keratin lets you locate a stratified squamous sample instantly. A keratin layer means a dry external surface like skin. Living, nucleated surface cells with no keratin mean a moist internal lining like the oesophagus. One feature, and you know which surface of the body the biopsy came from.` },

    { q: "Transitional epithelium: built to stretch.",
      body: `Transitional epithelium, also called urothelium, is a specialist found in only one place, and its name is a trap.

My Socratic question: the name suggests it transitions between other types. That is wrong. What does it actually transition between?

The answer is shapes, not tissue types. It changes its own appearance depending on whether the organ is stretched or relaxed. When the bladder is empty and the tissue relaxed, the surface cells are large, rounded and dome-shaped - often called umbrella cells - and the epithelium looks several cells thick. When the bladder fills and the wall stretches, those cells flatten and slide over one another, and the epithelium thins to look almost squamous.

This is found only in the urinary tract - the bladder, the ureters and the upper urethra - wherever the wall must expand and contract greatly, and wherever the toxic urine must be held back from the tissue beneath.

Crucial insight: transitional epithelium solves two problems at once that no other epithelium faces together - it stretches without tearing, and it forms an impermeable barrier against urine, one of the most hostile fluids the body produces. Its ability to change shape without losing its seal is exactly why it exists only where those two demands coincide.` },

    { q: "The complete table, and how to read any slide.",
      body: `Here is the whole set of membranous epithelia, each as name, structure, location and function - the table to hold in your head.

Simple squamous: one flat layer; alveoli, glomerulus, vessel and cavity linings; diffusion, filtration, frictionless flow.

Simple cuboidal: one box-cell layer; kidney tubules, gland ducts, thyroid follicles, ovary surface; secretion and absorption.

Simple columnar: one tall-cell layer, often with microvilli or cilia and goblet cells; the digestive tract from stomach to rectum, uterine tubes; absorption and secretion.

Pseudostratified columnar: one layer that looks layered, ciliated with goblet cells; the airways; mucus secretion and the mucociliary escalator.

Stratified squamous: many layers, keratinized or not; skin when keratinized, mouth, oesophagus and vagina when not; protection against abrasion.

Transitional (urothelium): many layers of shape-changing cells; bladder, ureters, upper urethra; stretch plus an impermeable barrier to urine.

Crucial insight: to read any epithelial slide, ask the two questions in order and use the specialisations as shortcuts. Cilia point to airway - pseudostratified. A brush border points to gut or kidney tubule. Umbrella cells point to bladder - transitional. A keratin layer points to skin. Scattered nuclei with cilia mean pseudostratified, not stratified. The clues are on the slide; you only have to know what each one means.` },

    { q: "When the wrong epithelium grows: metaplasia.",
      body: `One clinical idea ties this whole topic together and shows why knowing the normal epithelium of each site matters so much.

My Socratic question: what does it mean, and what does it signify, when one mature epithelium is replaced by another type in a place it does not belong?

The answer is metaplasia - a reversible change in which one differentiated epithelium is replaced by another, usually because the tissue is adapting to a chronic stress.

The classic example is the airway of a long-term smoker. The normal lining, delicate ciliated pseudostratified columnar, is progressively replaced by tough stratified squamous. On the face of it this looks protective - a hardier epithelium against the constant chemical assault of smoke. But it is a bad bargain: the new squamous lining has no cilia and no goblet cells, so the mucociliary escalator is gone for good, and the airway can no longer clear itself.

A second example is the lower oesophagus in chronic acid reflux, where the normal stratified squamous lining is replaced by columnar epithelium - Barrett oesophagus - a change that carries a real risk of progressing to cancer.

Crucial insight: metaplasia is the body trading the right tool for a tougher but wrong one under chronic stress, and it is often a warning sign on the road to cancer. You can only recognise it because you know what epithelium belongs in each location - which is the entire reason this topic is worth learning properly rather than by rote.` },

    { q: "Consolidation and your final test.",
      body: `Your cognitive map for membranous epithelium, in three lines.

The simple epithelia - one layer each - go squamous for exchange, cuboidal for tubule secretion and absorption, columnar for gut absorption, and pseudostratified for the ciliated self-cleaning airway.

The stratified epithelia - many layers - go stratified squamous for abrasion-resistant protection, keratinized on dry skin and non-keratinized on wet internal surfaces, and transitional for the stretching, urine-tight urinary tract.

The reading method: two questions, then use specialisations - cilia, brush border, umbrella cells, keratin - as instant location clues; and know the normal so you can spot metaplasia, the wrong epithelium in the wrong place.

Now your final test. Three slides are placed before you.

Slide one shows tall cells in a single layer with a dense brush border on their free surface and scattered mucus-filled cells among them.
Slide two shows a layered-looking epithelium whose nuclei sit at many heights, bearing cilia on its surface, with goblet cells.
Slide three shows many layers of cells, cuboidal at the base and flattening toward a surface of dead, anucleate, keratin-filled cells.

For each: name the epithelium, give its likely location, and state its function.

Work them through before reading on.

My answers. Slide one is simple columnar with a brush border - the small intestine - specialised for absorption, with goblet cells lubricating the surface. Slide two is pseudostratified ciliated columnar - the trachea or airway - clearing inhaled particles by the mucociliary escalator; the cilia confirm it is pseudostratified and not truly stratified. Slide three is keratinized stratified squamous - the epidermis of the skin - protecting against abrasion and water loss, its dead keratinized surface the giveaway of a dry external site.

If those three came cleanly, you can now read the body's covering and lining epithelia on sight. Glandular epithelium - the secreting kind - is next.` },
  ],
  theory: [
    { q: "Distinguish membranous from glandular epithelium.", a: "Membranous (covering and lining) epithelium forms sheets that wrap surfaces and line cavities and tubes. Glandular epithelium is specialised for secretion and forms the glands. This topic concerns the membranous type." },
    { q: "Describe simple squamous epithelium and give three locations with the function of each.", a: "A single layer of flat, scale-like cells forming the thinnest possible barrier. It lines the alveoli of the lungs for gas exchange, forms the glomerular filtration membrane in the kidney, and lines blood vessels and the heart (as endothelium) and the body cavities (as mesothelium) to provide a frictionless surface." },
    { q: "Why is simple cuboidal epithelium suited to secretion and absorption rather than diffusion?", a: "Its box-shaped cells have internal volume for mitochondria, organelles and transport machinery needed for active secretion and absorption, which flat squamous cells lack. It lines kidney tubules, gland ducts and thyroid follicles." },
    { q: "What surface features may simple columnar epithelium bear, and what does each achieve?", a: "It may bear a brush border of microvilli to increase surface area for absorption (as in the small intestine), goblet cells that secrete lubricating mucus, and in some sites cilia that move material along (as in the uterine tube)." },
    { q: "Explain why pseudostratified columnar epithelium is classified as simple despite looking layered.", a: "Every cell rests on the basement membrane, so it is genuinely a single layer. The cells are of different heights and their nuclei sit at several levels, creating a false appearance of stratification - hence pseudo, meaning false." },
    { q: "Give two reliable ways to distinguish pseudostratified from truly stratified epithelium.", a: "First, in pseudostratified epithelium every cell contacts the basement membrane, whereas in stratified epithelium only the basal layer does. Second, stratified epithelia never bear cilia, so a ciliated, layered-looking columnar epithelium must be pseudostratified." },
    { q: "Describe the mucociliary escalator and explain the effect of smoking on it.", a: "In the ciliated pseudostratified epithelium of the airways, goblet cells secrete mucus that traps inhaled particles, and cilia beat in waves to sweep the mucus toward the throat. Smoking paralyses and destroys the cilia, halting the escalator, so mucus and particles accumulate - producing the smoker's cough." },
    { q: "Differentiate keratinized from non-keratinized stratified squamous epithelium, with a location for each.", a: "Keratinized stratified squamous has a surface of dead cells filled with waterproof keratin and forms the epidermis of dry, exposed skin. Non-keratinized stratified squamous keeps living, moist surface cells without keratin and lines wet internal surfaces such as the mouth, oesophagus and vagina." },
    { q: "Why is transitional epithelium found only in the urinary tract?", a: "It uniquely combines two abilities needed there - it changes cell shape to stretch as the bladder fills and recoil as it empties without tearing, and it forms an impermeable barrier protecting the underlying tissue from toxic urine. Its surface umbrella cells flatten on stretching." },
    { q: "Define metaplasia and give one example, noting its clinical significance.", a: "Metaplasia is the reversible replacement of one mature epithelium by another, usually in response to chronic stress. For example, a smoker's ciliated pseudostratified airway epithelium is replaced by stratified squamous, losing the mucociliary escalator; in Barrett oesophagus, acid reflux replaces oesophageal stratified squamous with columnar epithelium, carrying a risk of progression to cancer." },
  ],
  videos: [
    { channel: "Kenhub", title: "Types of Simple Epithelia", note: "Labelled tour of simple squamous, cuboidal, columnar and pseudostratified with locations.", url: "https://www.youtube.com/watch?v=-koWOLMd904" },
    { channel: "Dr. G Bhanu Prakash", title: "Epithelial Tissue: Simple, Stratified, Pseudostratified, Transitional", note: "Covers the full set including transitional and stratified in one animated pass.", url: "https://www.youtube.com/watch?v=chl91a2Cm-Y" },
    { channel: "Histology Guide", title: "Pseudostratified Columnar Epithelium of the Trachea", note: "Real trachea slide - see the scattered nuclei, cilia and goblet cells for yourself.", url: "https://histologyguide.com/slideview/MHS-222-trachea/02-slide-1.html" },
  ],
  mcqs: [
    { q: "Membranous epithelium refers to epithelium that:", o: ["Secretes hormones", "Covers surfaces and lines cavities and tubes", "Forms glands only", "Is always stratified"], a: 1, w: "Membranous means the covering and lining epithelia, as opposed to glandular." },
    { q: "Simple squamous epithelium consists of:", o: ["A single layer of tall cells", "A single layer of flat cells", "Many layers of flat cells", "Box-shaped cells in one layer"], a: 1, w: "It is one layer of flat, scale-like cells - the thinnest barrier." },
    { q: "Gas exchange in the lung occurs across which epithelium?", o: ["Stratified squamous", "Simple squamous", "Simple cuboidal", "Transitional"], a: 1, w: "The alveoli are lined by simple squamous epithelium for rapid diffusion." },
    { q: "The simple squamous epithelium lining blood vessels is specifically called:", o: ["Endothelium", "Mesothelium", "Urothelium", "Mesentery"], a: 0, w: "Endothelium lines vessels and the heart." },
    { q: "Simple squamous epithelium is found only in protected internal sites because it is:", o: ["Impermeable", "Ciliated", "Too delicate to survive friction", "Too thick"], a: 2, w: "A single flat layer cannot withstand abrasion." },
    { q: "Simple cuboidal epithelium is best suited to:", o: ["Stretching", "Secretion and absorption", "Protection against wear", "Rapid diffusion"], a: 1, w: "Its cell volume houses machinery for active secretion and absorption." },
    { q: "Which is a typical location of simple cuboidal epithelium?", o: ["Epidermis", "Urinary bladder", "Alveoli", "Kidney tubules"], a: 3, w: "It lines kidney tubules, gland ducts, thyroid follicles and the ovary surface." },
    { q: "Simple columnar epithelium is characterised by:", o: ["A single layer of tall cells", "Shape-changing cells", "Many layers", "Flat cells"], a: 0, w: "It is one layer of tall cells, taller than they are wide." },
    { q: "The brush border seen on intestinal simple columnar cells is made of:", o: ["Goblet cells", "Cilia", "Keratin", "Microvilli"], a: 3, w: "Microvilli form the brush border that increases absorptive area." },
    { q: "Goblet cells scattered in an epithelium secrete:", o: ["Hormones", "Keratin", "Enzymes", "Mucus"], a: 3, w: "Goblet cells secrete lubricating and protective mucus." },
    { q: "Pseudostratified columnar epithelium is truly classified as:", o: ["Glandular", "Transitional", "Simple", "Stratified"], a: 2, w: "Every cell touches the basement membrane, so it is a single layer." },
    { q: "The false layered appearance of pseudostratified epithelium is due to:", o: ["A keratin surface", "Several true layers", "Nuclei sitting at different heights", "Umbrella cells"], a: 2, w: "Scattered nuclei create the illusion of stratification." },
    { q: "A quick way to confirm an epithelium is pseudostratified rather than stratified is the presence of:", o: ["Cilia", "Keratin", "Several nuclei per cell", "A brush border"], a: 0, w: "Stratified epithelia never bear cilia, so cilia indicate pseudostratified." },
    { q: "The classic location of ciliated pseudostratified columnar epithelium is the:", o: ["Respiratory tract (trachea)", "Urinary bladder", "Small intestine", "Epidermis"], a: 0, w: "It lines the nose, trachea and bronchi." },
    { q: "The mucociliary escalator functions to:", o: ["Absorb nutrients", "Sweep trapped particles out of the airways", "Stretch the bladder", "Filter blood"], a: 1, w: "Cilia move goblet-cell mucus and trapped debris toward the throat." },
    { q: "Smoking damages the airway primarily by:", o: ["Adding goblet cells", "Thickening the basement membrane", "Paralysing and destroying cilia", "Keratinizing the alveoli"], a: 2, w: "Loss of cilia halts the escalator, causing mucus to accumulate." },
    { q: "A stratified epithelium is named according to the shape of cells in its:", o: ["Basement membrane", "Basal layer", "Middle layer", "Apical layer"], a: 3, w: "Naming follows the most superficial (apical) layer." },
    { q: "Keratinized stratified squamous epithelium is found in the:", o: ["Bladder", "Trachea", "Epidermis of skin", "Oesophagus"], a: 2, w: "The dry, exposed skin surface is sealed by keratin." },
    { q: "Non-keratinized stratified squamous epithelium lines the:", o: ["Kidney tubule", "Skin surface", "Oesophagus and mouth", "Alveoli"], a: 2, w: "Wet internal surfaces that take abrasion keep a moist, non-keratinized surface." },
    { q: "The presence of a surface keratin layer on stratified squamous epithelium indicates a:", o: ["Wet internal lining", "Secretory duct", "Filtration surface", "Dry external surface"], a: 3, w: "Keratin waterproofs dry, exposed surfaces such as skin." },
    { q: "Transitional epithelium is found in the:", o: ["Urinary tract", "Digestive tract", "Circulatory system", "Respiratory tract"], a: 0, w: "It lines the bladder, ureters and upper urethra." },
    { q: "The name transitional epithelium refers to its ability to:", o: ["Move between organs", "Change cell shape as the organ stretches", "Change between tissue types", "Transition into cancer"], a: 1, w: "Its cells change shape as the bladder fills and empties." },
    { q: "The rounded surface cells of relaxed transitional epithelium are called:", o: ["Umbrella (dome) cells", "Squames", "Basal cells", "Goblet cells"], a: 0, w: "Umbrella cells are the large dome-shaped apical cells when relaxed." },
    { q: "Two demands uniquely met together by transitional epithelium are:", o: ["Stretch and an impermeable barrier to urine", "Absorption and filtration", "Diffusion and secretion", "Protection and gas exchange"], a: 0, w: "It stretches without tearing while sealing the tissue from toxic urine." },
    { q: "Which epithelium lines most of the digestive tract from stomach to rectum?", o: ["Simple squamous", "Stratified squamous", "Transitional", "Simple columnar"], a: 3, w: "Simple columnar, often with microvilli, cilia or goblet cells." },
    { q: "The neat basal row of nuclei helps identify:", o: ["Transitional", "True simple columnar", "Stratified squamous", "Pseudostratified columnar"], a: 1, w: "In simple columnar the nuclei form a tidy basal line, unlike pseudostratified." },
    { q: "The glomerular filtration membrane of the kidney is lined by:", o: ["Simple squamous", "Transitional", "Stratified squamous", "Simple cuboidal"], a: 0, w: "Filtration requires the thin barrier of simple squamous epithelium." },
    { q: "Metaplasia is best defined as:", o: ["Death of an epithelium", "Irreversible cancer", "Reversible replacement of one mature epithelium by another", "Thickening of the basement membrane"], a: 2, w: "It is an adaptive, reversible switch from one epithelial type to another." },
    { q: "In a long-term smoker, airway pseudostratified epithelium is often replaced by:", o: ["Transitional", "Simple squamous", "Simple cuboidal", "Stratified squamous"], a: 3, w: "Squamous metaplasia gives a tougher lining but loses the cilia." },
    { q: "Replacement of lower oesophageal stratified squamous epithelium by columnar epithelium is called:", o: ["Endothelium", "Barrett oesophagus", "Mesothelium", "Urothelium"], a: 1, w: "Barrett oesophagus results from chronic acid reflux and risks progression to cancer." },
  ],
};

/* --------------------------- bch:0 --------------------------- */
const T_BCH_INTRO = {
  courseId: "bch",
  topicIndex: 0,
  title: "Introduction to Biochemistry",
  minutes: 20,
  note: [
    { q: "Why does a lab scientist begin with chemistry, not cells?",
      body: `You have learned the body's structures in anatomy, its tissues in histology, and how those tissues function in physiology. Biochemistry goes one level deeper still - to the molecules those functions are actually made of. It is the chemistry of life.

My Socratic question: every process you have studied so far - a nerve firing, a muscle contracting, a kidney filtering - is at bottom a set of chemical reactions. So what is the one substance that every single one of those reactions happens inside?

The answer is water. Life is a chemical process, and that chemistry runs in water. Roughly sixty percent of your body mass is water, and every reaction in every cell takes place dissolved in it. You cannot understand a single metabolic pathway without first understanding the medium it runs in.

Crucial insight: biochemistry is not memorising molecules. It is understanding how the properties of water, and the behaviour of acids and bases within it, make life's reactions possible and keep them controlled. Master water and pH first, and every pathway you meet later has a stable foundation to stand on. This is why almost every biochemistry course, and almost every biochemistry exam, opens here.` },

    { q: "What makes water so special? Start with its shape.",
      body: `Water is the most abundant molecule in the body, and its extraordinary behaviour all flows from one structural fact.

My Socratic question: a water molecule is just two hydrogen atoms bonded to one oxygen. Why does such a simple molecule behave so unusually?

(Hint: the atoms do not share their electrons fairly.)

The answer is polarity. Oxygen pulls the shared electrons far more strongly than hydrogen does, so the oxygen end of the molecule carries a slight negative charge and the hydrogen ends carry a slight positive charge. The molecule is electrically lopsided - a dipole. Add to this that the molecule is bent, not straight, so the two positive ends sit on the same side, and the lopsidedness cannot cancel out.

A water molecule is therefore a tiny magnet with a negative pole and a positive pole.

Crucial insight: every remarkable property of water - why it dissolves salts, why it climbs up plants, why it resists temperature change, why oil will not mix with it - traces back to this single fact of polarity. Do not memorise the properties as a list; derive them from the dipole, and they become obvious.` },

    { q: "Hydrogen bonds: the weak force that runs your body.",
      body: `Because each water molecule is a dipole, the positive hydrogen end of one molecule is attracted to the negative oxygen end of its neighbour. This attraction is the hydrogen bond.

A single hydrogen bond is weak - far weaker than the covalent bonds holding a molecule together. But water molecules form them constantly, each molecule bonding to several neighbours, breaking and reforming billions of times a second.

My Socratic question: if each hydrogen bond is so weak, why does it matter so much?

The answer is that collectively they are immensely strong, and their weakness individually is exactly what makes them useful. Because they break and reform easily, they let water flow while still holding it together, and they let biological structures assemble and come apart as needed.

Hydrogen bonds are not confined to water. They hold the two strands of DNA together - weakly enough that enzymes can unzip them to copy the code, yet collectively strongly enough to keep the genome intact. They fold proteins into their working shapes. They give water almost all its life-supporting properties.

Crucial insight: the hydrogen bond is arguably the most important weak interaction in all of biology. Life depends on bonds strong enough to build structure but weak enough to be undone on demand, and the hydrogen bond is exactly that compromise.` },

    { q: "Why water dissolves the molecules of life - and why some it refuses.",
      body: `Water is called the universal solvent, and understanding what it dissolves - and what it does not - explains the architecture of every cell.

My Socratic question: table salt, sodium chloride, dissolves instantly in water. Cooking oil will not dissolve at all. Why the difference?

The answer, again, is polarity - like dissolves like. Water, being polar, surrounds and pulls apart other charged or polar substances. When salt enters water, the negative oxygen ends cluster around the positive sodium ions and the positive hydrogen ends cluster around the negative chloride ions, prising the crystal apart. Substances that dissolve in water this way are hydrophilic, meaning water-loving - ions, sugars, and most small biological molecules.

Oil is non-polar, so water has nothing to grip. The water molecules would rather hydrogen-bond with each other than surround the oil, so the oil is pushed together and excluded. Such substances are hydrophobic, water-fearing - fats and oils above all.

Crucial insight: this single divide builds the cell. Recall the cell membrane from physiology - its phospholipids have a hydrophilic head that faces the watery inside and outside, and hydrophobic tails that hide from water in the middle. The membrane assembles itself purely because water pushes the oily tails together. The hydrophobic effect, water excluding non-polar molecules, is one of the great organising forces of biology.` },

    { q: "Water splits itself: the origin of pH.",
      body: `Water is not chemically silent. Occasionally, a water molecule breaks apart, or ionises, into two charged particles.

One molecule donates a hydrogen ion to become a hydroxide ion, and the hydrogen ion, which is essentially a bare proton, attaches to another water molecule. In shorthand we simply say water dissociates into a hydrogen ion, written H plus, and a hydroxide ion, written OH minus.

In pure water this happens to a tiny, fixed extent, and crucially the two ions are produced in exactly equal numbers. Pure water is therefore neutral - equal hydrogen and hydroxide.

My Socratic question: if we now add a substance that releases extra hydrogen ions, or one that mops them up, what have we created?

The answer is acids and bases. An acid is a substance that increases the hydrogen ion concentration of a solution. A base is a substance that decreases it, either by removing hydrogen ions or by adding hydroxide ions.

Crucial insight: the entire concept of pH is nothing more than a way of tracking one number - the concentration of hydrogen ions in a solution. Everything about acids, bases and buffers is bookkeeping on that single quantity, because hydrogen ion concentration controls the shape and function of nearly every protein in the body.` },

    { q: "The pH scale: why the numbers run backwards.",
      body: `Hydrogen ion concentrations in the body are tiny numbers with many decimal places, awkward to write and compare. The pH scale is a mathematical trick to make them manageable.

The pH scale runs from 0 to 14. A pH of 7 is neutral, equal hydrogen and hydroxide, as in pure water. Below 7 is acidic - more hydrogen ions. Above 7 is basic, or alkaline - fewer hydrogen ions.

Two features trap students, so hold them deliberately. First, the scale is inverted: a low pH means a high hydrogen ion concentration. The more acidic a solution, the lower its number. This feels backwards because pH is defined as the negative logarithm of the hydrogen ion concentration - the negative sign flips the direction.

Second, the scale is logarithmic, not linear. Each whole step of one pH unit is a tenfold change in hydrogen ion concentration. A solution of pH 4 is not slightly more acidic than pH 5 - it is ten times more acidic. From pH 4 to pH 6 is a hundredfold difference.

Crucial insight: the logarithmic nature is why small pH changes are medical emergencies. Human blood is held at pH 7.4. A drop to 7.0 sounds minor - it is only four tenths of a unit - but it represents more than a doubling of hydrogen ions, and it is fatal. This is why the body guards blood pH so fiercely, which brings us to buffers.` },

    { q: "Buffers: how the body refuses to let pH move.",
      body: `The reactions of metabolism constantly produce acids. Your muscles pour lactic acid into the blood; your cells produce carbon dioxide, which forms an acid in water. Left unchecked, this would crash the blood pH and kill you within minutes. Something must hold the line.

My Socratic question: what kind of system could absorb both added acid and added base, soaking up hydrogen ions when there are too many and releasing them when there are too few, keeping pH almost constant?

The answer is a buffer. A buffer is a solution that resists changes in pH. It is made of a weak acid paired with its conjugate base - the weak acid ready to release hydrogen ions if pH rises, and the conjugate base ready to absorb hydrogen ions if pH falls. The pair works in both directions, like a chemical shock absorber.

When acid is added, the conjugate base mops up the extra hydrogen ions. When base is added, the weak acid releases hydrogen ions to replace those removed. Either way, the free hydrogen ion concentration barely changes, so the pH barely moves.

Crucial insight: a buffer does not stop pH changing entirely - it blunts the change, turning what would be a lethal swing into a survivable nudge. It works best when the weak acid and its conjugate base are present in similar amounts, which is precisely how the body arranges its buffers.` },

    { q: "The body's own buffers: bicarbonate and beyond.",
      body: `The most important buffer in your blood is the bicarbonate system, and it is a favourite of examiners because it links biochemistry directly to physiology.

It works as a pairing of carbonic acid, the weak acid, and bicarbonate, its conjugate base. Carbon dioxide from respiring cells dissolves in blood and combines with water to form carbonic acid, which readily gives up a hydrogen ion to become bicarbonate. The whole chain is reversible, so it can run either way depending on what the blood needs.

Here is its genius: the system is open at both ends. If acid builds up, the reaction shifts to form carbon dioxide, which you simply breathe out through the lungs. If the blood becomes too alkaline, the kidneys retain acid and adjust bicarbonate. The buffer is regulated by two whole organ systems at once - the lungs handling it fast, the kidneys slowly.

Other buffers support it. The phosphate system buffers inside cells and in urine, and proteins themselves, including haemoglobin, act as buffers because their amino acids can accept or donate hydrogen ions.

Crucial insight: this is biochemistry meeting physiology in a single mechanism. When you learn respiratory and renal control of acid-base balance in later topics, remember it all rests on this one buffer pair. Fast breathing blows off acid as carbon dioxide; the kidney is the slow, precise backstop. The chemistry you are learning now is the machinery behind those clinical facts.` },

    { q: "Why all of this decides whether you live: acidosis and alkalosis.",
      body: `Let us make the stakes concrete, because this is where the chemistry becomes clinical.

Blood pH is held in an extraordinarily narrow window, roughly 7.35 to 7.45. Step outside it and the body is in crisis.

Acidosis is a blood pH below 7.35 - too many hydrogen ions. It can come from lung failure, when carbon dioxide is not exhaled and builds up as acid, or from metabolic causes such as uncontrolled diabetes, which floods the blood with acidic ketones. Alkalosis is a blood pH above 7.45 - too few hydrogen ions - from causes such as excessive vomiting, which loses stomach acid, or over-breathing, which blows off too much carbon dioxide.

My Socratic question: why is a shift of just a few tenths of a pH unit so dangerous?

The answer returns to proteins. Every enzyme and every structural protein has a shape that depends on the precise balance of charges around it, and that balance is set by pH. Move the pH and you alter those charges, distorting the protein's shape and destroying its function. At the wrong pH, enzymes stop working, and metabolism grinds to a halt. Because the scale is logarithmic, a small pH number hides a large change in hydrogen ions.

Crucial insight: this is the payoff of the whole topic. The body defends its pH so fiercely not out of fussiness but because its entire molecular machinery - every enzyme you will study for the rest of this course - only works within a razor-thin pH range. Water, dissociation, pH and buffers are not abstract chemistry; they are the conditions under which life's molecules are able to function at all.` },

    { q: "Consolidation and your final test.",
      body: `Your cognitive map for the foundations of biochemistry, in five lines.

The medium: life's chemistry runs in water, which fills roughly sixty percent of the body.

The reason water works: it is a polar molecule, a dipole, and this polarity gives it hydrogen bonding, its power as a solvent for hydrophilic substances, and its exclusion of hydrophobic ones - the force that builds membranes.

The origin of pH: water dissociates slightly into hydrogen and hydroxide ions; an acid raises hydrogen ions, a base lowers them.

The scale: pH is the negative logarithm of hydrogen ion concentration, so it runs backwards and moves in tenfold steps - neutral at 7, acidic below, basic above.

The defence: buffers, a weak acid paired with its conjugate base, resist pH change; the bicarbonate buffer, regulated by lungs and kidneys, guards blood at pH 7.4, because every protein in the body needs that narrow range to hold its shape.

Now your final test. A patient with uncontrolled diabetes is producing large amounts of acidic ketone molecules, which are pouring into the blood.

Question one: what will happen to the patient's blood pH, and what is this condition called?
Question two: the bicarbonate buffer immediately begins to resist the change. In simple terms, which half of the buffer pair is being used up, and why?
Question three: the patient begins breathing rapidly and deeply without realising it. How does that help, and which organ is acting as the fast line of defence?

Work them through before reading on.

My answers. One: the extra acid raises the blood hydrogen ion concentration, so the pH falls below 7.35 - this is acidosis, specifically a metabolic acidosis. Two: the bicarbonate, the conjugate base half of the pair, is consumed as it mops up the flood of hydrogen ions from the ketones, which is why a low blood bicarbonate is a classic sign of this condition. Three: rapid deep breathing blows off carbon dioxide from the lungs; because carbon dioxide forms acid in the blood, removing it shifts the buffer reaction to reduce hydrogen ions and pushes the pH back up. The lungs are the fast line of defence, buying time for the slower kidneys.

If those three came cleanly, you understand why biochemistry begins with water and pH - and every enzyme and pathway ahead now has solid ground to stand on. Enzymes are next.` },
  ],
  theory: [
    { q: "Why is water central to biochemistry, and roughly what fraction of body mass is it?", a: "All the chemical reactions of life take place dissolved in water, so no metabolic process can be understood without it. Water makes up roughly sixty percent of body mass." },
    { q: "Explain what makes water a polar molecule.", a: "Oxygen attracts the shared bonding electrons more strongly than hydrogen, so the oxygen end carries a slight negative charge and the hydrogen ends a slight positive charge. Because the molecule is bent, this lopsidedness does not cancel, making water a dipole with distinct positive and negative poles." },
    { q: "What is a hydrogen bond and why is its weakness biologically valuable?", a: "It is the attraction between the positive hydrogen end of one polar molecule and the negative end of another. Individually weak, hydrogen bonds form and break easily, allowing structures like DNA strands and folded proteins to be held together yet separated on demand, while collectively providing real strength." },
    { q: "Differentiate hydrophilic from hydrophobic substances and give an example of each.", a: "Hydrophilic (water-loving) substances are charged or polar and dissolve in water, such as sodium chloride or glucose. Hydrophobic (water-fearing) substances are non-polar and are excluded by water, such as fats and oils. Like dissolves like." },
    { q: "How does the hydrophobic effect help build the cell membrane?", a: "Phospholipids have hydrophilic heads and hydrophobic tails. Water surrounds the heads but excludes the tails, pushing the tails together into the membrane interior. The membrane therefore assembles itself because water forces the non-polar tails away from it." },
    { q: "Describe the ionisation of water and define an acid and a base in these terms.", a: "Water dissociates slightly into a hydrogen ion (H plus) and a hydroxide ion (OH minus), in equal numbers in pure water, making it neutral. An acid is a substance that increases the hydrogen ion concentration; a base decreases it, by removing hydrogen ions or adding hydroxide." },
    { q: "State two features of the pH scale that commonly confuse students.", a: "First, it is inverted: pH is the negative logarithm of hydrogen ion concentration, so a lower pH means a higher hydrogen ion concentration and greater acidity. Second, it is logarithmic: each one-unit change represents a tenfold change in hydrogen ion concentration." },
    { q: "What is a buffer and what two components make one?", a: "A buffer is a solution that resists changes in pH. It consists of a weak acid paired with its conjugate base: the weak acid releases hydrogen ions when pH rises, and the conjugate base absorbs hydrogen ions when pH falls, resisting change in both directions." },
    { q: "Explain how the bicarbonate buffer system is regulated by two organ systems.", a: "The system pairs carbonic acid with bicarbonate. Excess acid shifts the reaction toward carbon dioxide, which the lungs exhale quickly; the kidneys adjust bicarbonate and acid excretion slowly and precisely. Thus the lungs provide fast control and the kidneys slow, fine control of blood pH." },
    { q: "Define acidosis and alkalosis and explain why small pH changes are dangerous.", a: "Acidosis is a blood pH below about 7.35 (too many hydrogen ions); alkalosis is above about 7.45 (too few). Small shifts are dangerous because protein shape depends on the charge balance set by pH; altering pH distorts enzymes and structural proteins, halting their function, and because the scale is logarithmic a small pH change means a large change in hydrogen ions." },
  ],
  videos: [
    { channel: "AK Lectures", title: "Water, pH and Buffers", note: "Clear lecture on water's properties, pH, weak acids and buffers - the whole foundation in one place.", url: "https://www.youtube.com/watch?v=i1LyWQ_lPik" },
    { channel: "Khan Academy", title: "Introduction to pH, Acids and Bases / Buffers", note: "Worked pH examples and the buffer concept, at a gentle pace.", url: "https://www.youtube.com/watch?v=gjKmQ501sAg" },
    { channel: "ZC OCW", title: "Water, pH and Buffers: Biochemistry", note: "Second lecture going deeper into ionisation and buffering for medical courses.", url: "https://www.youtube.com/watch?v=crTmeIkUIbw" },
  ],
  mcqs: [
    { q: "Approximately what fraction of body mass is water?", o: ["Ten percent", "Ninety percent", "Twenty percent", "Sixty percent"], a: 3, w: "Water is roughly sixty percent of body mass." },
    { q: "All metabolic reactions in the body take place:", o: ["Dissolved in water", "In the absence of water", "Only in lipids", "In dry conditions"], a: 0, w: "Life's chemistry runs in water, the universal biological solvent." },
    { q: "Water is a polar molecule because:", o: ["It is a straight molecule", "Oxygen attracts the shared electrons more than hydrogen", "Hydrogen is negative", "It contains carbon"], a: 1, w: "Unequal electron sharing gives oxygen a negative and hydrogen a positive end." },
    { q: "The slight charges on a water molecule make it a:", o: ["Salt", "Gas at body temperature", "Non-polar molecule", "Dipole"], a: 3, w: "Water has separated positive and negative poles - a dipole." },
    { q: "A hydrogen bond forms between:", o: ["Two non-polar molecules", "Two oil droplets", "The positive end of one polar molecule and the negative end of another", "Two carbon atoms"], a: 2, w: "It is an attraction between opposite partial charges on polar molecules." },
    { q: "A single hydrogen bond is:", o: ["Weak individually but strong collectively", "Found only in DNA", "Impossible to break", "Stronger than a covalent bond"], a: 0, w: "Each is weak, but many together are strong and easily reformed." },
    { q: "Hydrogen bonds hold the two strands of DNA together in a way that is:", o: ["Non-polar", "Permanent and unbreakable", "Weak enough to unzip yet collectively stable", "Ionic"], a: 2, w: "Their weakness lets enzymes separate the strands for copying." },
    { q: "A substance that dissolves readily in water is described as:", o: ["Non-polar", "Hydrophobic", "Lipid-soluble", "Hydrophilic"], a: 3, w: "Hydrophilic means water-loving - charged or polar substances." },
    { q: "Oil does not dissolve in water because oil is:", o: ["Non-polar (hydrophobic)", "Charged", "Polar", "Acidic"], a: 0, w: "Water excludes non-polar, hydrophobic substances." },
    { q: "The principle governing what water dissolves is:", o: ["Heavy dissolves light", "Opposites dissolve", "Acids dissolve bases", "Like dissolves like"], a: 3, w: "Polar water dissolves polar and charged substances." },
    { q: "The hydrophobic effect helps assemble the cell membrane by:", o: ["Dissolving the tails", "Breaking hydrogen bonds", "Pushing the non-polar tails together away from water", "Charging the heads"], a: 2, w: "Water excludes the oily tails, driving them into the membrane interior." },
    { q: "When water ionises, it forms:", o: ["Two hydroxide ions", "Oxygen gas", "Two hydrogen ions", "A hydrogen ion and a hydroxide ion"], a: 3, w: "Water dissociates into H plus and OH minus." },
    { q: "In pure water, hydrogen and hydroxide ions are present in:", o: ["No amount at all", "Equal amounts, making it neutral", "Unequal amounts", "Only trace hydroxide"], a: 1, w: "Equal H plus and OH minus makes pure water neutral." },
    { q: "An acid is a substance that:", o: ["Has no effect on pH", "Decreases hydrogen ion concentration", "Increases hydrogen ion concentration", "Adds hydroxide only"], a: 2, w: "An acid raises the hydrogen ion concentration of a solution." },
    { q: "A neutral solution such as pure water has a pH of:", o: ["7", "0", "14", "1"], a: 0, w: "pH 7 is neutral, with equal hydrogen and hydroxide ions." },
    { q: "A solution with a pH of 4 is:", o: ["Alkaline", "Acidic", "Basic", "Neutral"], a: 1, w: "Below 7 is acidic; pH 4 has a high hydrogen ion concentration." },
    { q: "On the pH scale, a lower pH means:", o: ["No hydrogen ions", "More hydroxide ions", "Fewer hydrogen ions", "More hydrogen ions"], a: 3, w: "The scale is inverted: low pH means high hydrogen ion concentration." },
    { q: "A change of one pH unit represents a change in hydrogen ion concentration of:", o: ["Ten times", "One hundred times", "No change", "Two times"], a: 0, w: "The scale is logarithmic - each unit is a tenfold change." },
    { q: "A solution at pH 4 compared to pH 6 is:", o: ["One hundred times as acidic", "Twice as acidic", "Equally acidic", "Half as acidic"], a: 0, w: "Two units means ten times ten, a hundredfold difference." },
    { q: "pH is mathematically defined as:", o: ["The hydrogen ion concentration", "The negative logarithm of hydrogen ion concentration", "The number of water molecules", "The hydroxide concentration"], a: 1, w: "pH equals minus the logarithm of the hydrogen ion concentration." },
    { q: "A buffer is a solution that:", o: ["Resists changes in pH", "Removes all acid", "Raises pH sharply", "Has no acid or base"], a: 0, w: "A buffer resists pH change in both directions." },
    { q: "A buffer is composed of:", o: ["Two strong bases", "A weak acid and its conjugate base", "Only water", "A strong acid and strong base"], a: 1, w: "The weak-acid and conjugate-base pair absorbs or releases hydrogen ions." },
    { q: "When acid is added to a buffer, the extra hydrogen ions are absorbed by the:", o: ["Hydroxide", "Conjugate base", "Weak acid", "Water only"], a: 1, w: "The conjugate base mops up the added hydrogen ions." },
    { q: "The most important buffer in blood is the:", o: ["Ammonia system", "Sulphate system", "Bicarbonate system", "Phosphate system"], a: 2, w: "The bicarbonate buffer is the major blood buffer." },
    { q: "In the bicarbonate buffer, the lungs help by:", o: ["Producing bicarbonate", "Retaining carbon dioxide", "Exhaling carbon dioxide to remove acid", "Adding hydrogen ions"], a: 2, w: "Breathing off carbon dioxide reduces acid quickly." },
    { q: "In acid-base balance, the kidneys act as the:", o: ["Only buffer", "Slow, precise line of defence", "Fast line of defence", "Main source of acid"], a: 1, w: "Kidneys adjust bicarbonate and acid slowly and precisely." },
    { q: "Normal blood pH is maintained at approximately:", o: ["6.8", "7.4", "7.0", "8.0"], a: 1, w: "Blood is held near pH 7.4, in a very narrow range." },
    { q: "A blood pH below 7.35 is called:", o: ["Buffered", "Alkalosis", "Neutral", "Acidosis"], a: 3, w: "Acidosis is an abnormally low blood pH." },
    { q: "Small changes in pH are dangerous mainly because they:", o: ["Change body temperature", "Add water to cells", "Alter protein shape and stop enzymes working", "Remove all hydrogen ions"], a: 2, w: "Protein shape depends on pH; wrong pH halts enzyme function." },
    { q: "Uncontrolled diabetes can cause acidosis by producing:", o: ["Acidic ketone molecules", "Extra hydroxide", "Excess bicarbonate", "Pure water"], a: 0, w: "Ketones are acidic and lower the blood pH, causing metabolic acidosis." },
  ],
};

/* --------------------------- bio:0 --------------------------- */
const T_BIO_AMINO = {
  courseId: "bio",
  topicIndex: 3,
  title: "Amino Acids",
  minutes: 20,
  note: [
    { q: "You learned water and pH. Why do amino acids come next?",
      body: `In your biochemistry foundation you mastered water, ionisation and pH. Now we meet the first great family of biological molecules whose behaviour depends entirely on that pH understanding: the amino acids, the building blocks of proteins.

My Socratic question: proteins do almost all the work in the body - enzymes, antibodies, transporters, structure. What are proteins actually made of, and why must a lab scientist understand these units before the proteins themselves?

The answer is that proteins are long chains of amino acids, and a protein's entire three-dimensional shape and function are dictated by the sequence and properties of the amino acids in it. You cannot understand why an enzyme works, why it denatures with heat or pH change, or why a single genetic mutation causes sickle cell disease, without first understanding the twenty amino acids and their individual personalities.

Crucial insight: there are only about twenty standard amino acids, yet they combine to build every one of the tens of thousands of different proteins in your body - the way twenty-six letters build every word in a language. Master these twenty units and their chemistry, and the whole of protein science opens up. This is why biochemistry courses turn here immediately after the water and pH foundation.` },

    { q: "The universal blueprint: what every amino acid shares.",
      body: `Every one of the twenty standard amino acids is built on the same central plan. Learn this one template and you have learned the skeleton of all twenty.

At the centre sits a single carbon atom called the alpha carbon. Bonded to that one carbon are four things: an amino group, which is basic; a carboxyl group, which is acidic; a hydrogen atom; and a variable side chain, called the R group.

My Socratic question: three of those four attachments are identical in every amino acid. So what single part makes glycine different from tryptophan, or makes one amino acid water-loving and another water-fearing?

The answer is the R group, the side chain. The amino group, carboxyl group and hydrogen are the same in all twenty; only the R group changes. That side chain is the amino acid's fingerprint - it determines its size, its charge, its chemistry, whether it loves or fears water, and ultimately how it behaves inside a protein.

Crucial insight: this is the key that unlocks the entire topic. Since only the R group varies, classifying and understanding amino acids means classifying and understanding their side chains. Everything that follows - the classes, the charges, the behaviour - is really about the R group. Focus your learning there.` },

    { q: "Chirality: why the body builds with only left-handed units.",
      body: `Look again at the alpha carbon with its four different attachments. That arrangement has a subtle but important consequence.

Because the alpha carbon is bonded to four different groups, it is a chiral centre - meaning the molecule can exist in two mirror-image forms that cannot be superimposed, like your left and right hands. These two forms are called the L-form and the D-form.

My Socratic question: both forms exist in nature, so which does the body use to build its proteins - and does it use both?

The answer is that proteins are built almost exclusively from L-amino acids. The body's protein-making machinery is stereospecific: it recognises and uses only the L-form. There is one exception to the whole chirality rule worth noting - glycine, whose R group is just a single hydrogen atom. Because glycine's alpha carbon then has two identical hydrogens, it is not chiral at all; it has no L or D form.

Crucial insight: this handedness is not a technicality - it is fundamental to life. Enzymes, which are themselves made of L-amino acids, have precisely shaped active sites that fit only correctly-shaped molecules. The exclusive use of one handedness is part of why biological molecules are so specific, and why glycine, the one non-chiral amino acid, is also the smallest and most flexible.` },

    { q: "Amino acids as acids and bases: the zwitterion.",
      body: `Here is where your pH knowledge pays off directly. Every amino acid carries both an acidic group and a basic group on the same molecule, which gives it remarkable behaviour in water.

The carboxyl group is acidic - it tends to lose a hydrogen ion and become negatively charged. The amino group is basic - it tends to gain a hydrogen ion and become positively charged.

My Socratic question: at the near-neutral pH of the body, both of these happen at once on the same molecule. What is the overall charge of an amino acid then?

The answer is zero, but not because it is uncharged - because it carries both a positive and a negative charge simultaneously that cancel out. This double-charged but net-neutral form is called a zwitterion, from the German for hybrid ion. At physiological pH the carboxyl group is deprotonated and negative, while the amino group is protonated and positive.

Because an amino acid has both an acid and a base group, it can act as either - it is amphoteric - and this lets amino acids act as buffers, resisting pH change, exactly the buffer behaviour you learned with the bicarbonate system.

Crucial insight: the zwitterion is the form amino acids actually take in your blood and cells. This dual-charge nature is why amino acids are so soluble in water, why they buffer body fluids, and why their behaviour shifts with pH - a direct, living application of the acid-base chemistry you have already learned.` },

    { q: "The isoelectric point: the pH of zero net charge.",
      body: `Since an amino acid's charge depends on pH, there must be one specific pH at which it is exactly balanced. This idea is a favourite of examiners and a key laboratory tool.

My Socratic question: at very low pH, an amino acid is fully protonated and carries a net positive charge; at very high pH it is fully deprotonated and net negative. Somewhere in between there must be a crossover. What is that pH called?

The answer is the isoelectric point, written pI. It is the specific pH at which the amino acid carries no net charge - existing purely as the zwitterion, with positive and negative exactly balanced.

Above the pI, the amino acid is net negative; below the pI, it is net positive. For a simple amino acid, the pI is simply the average of the two pKa values, the one for the carboxyl group and the one for the amino group.

Crucial insight: the isoelectric point is not just theory - it is the basis of real laboratory techniques you will use, such as electrophoresis, where proteins and amino acids are separated by placing them in an electric field. At a given pH, a molecule below its pI carries positive charge and moves one way; one above its pI carries negative charge and moves the other. The pI predicts which way each will travel, which is how the lab separates them.` },

    { q: "Classifying the twenty: it all comes down to the R group.",
      body: `With twenty amino acids to know, you need a system - and since only the R group varies, the R group is what we classify by. Following Dr Amoah's scheme, the twenty are sorted into four groups based on the nature of their side chains.

The first group is the non-polar amino acids. Their R groups are hydrophobic - water-fearing, made largely of carbon and hydrogen with no charge. In a folded protein these tuck away from water into the protein's oily core.

The second group is the polar, uncharged amino acids. Their R groups are hydrophilic - water-loving - but carry no full charge; they contain groups that can form hydrogen bonds with water and sit comfortably on a protein's watery surface.

The third group is the acidic amino acids. Their R groups carry a negative charge at body pH, because the side chain itself contains an extra carboxyl group.

The fourth group is the basic amino acids. Their R groups carry a positive charge at body pH, because the side chain contains an extra amino or nitrogen-containing group.

Crucial insight: do not try to memorise twenty structures cold. Instead learn the four categories and what each does, then place each amino acid into its group. The behaviour follows the group: non-polar hides from water, polar and charged face the water. This is the mechanism-first way to hold all twenty in your head - by personality, not by rote.` },

    { q: "Why the classes matter: R groups fold the protein.",
      body: `The four classes are not just tidy bookkeeping - they are the reason a protein folds into its precise working shape, which connects straight back to the hydrophobic effect you learned with water.

My Socratic question: when a long chain of amino acids folds up into a compact protein in the watery cell, which side chains will end up buried inside, and which will end up on the surface?

The answer follows directly from water's behaviour. The non-polar, hydrophobic side chains are driven away from water and bury themselves in the protein's interior core. The polar and charged side chains are drawn to water and arrange themselves on the protein's outer surface. The protein folds itself, driven largely by the amino acids sorting themselves according to their relationship with water.

Charged side chains do more: an acidic (negative) side chain can form a strong attraction with a basic (positive) side chain elsewhere in the chain, forming a salt bridge that locks the fold in place.

Crucial insight: this is the whole point of learning the classes. A protein's final shape - and therefore its function - is determined by how its amino acid side chains interact with water and with each other. Change one amino acid from hydrophobic to charged, and the protein may fold wrongly and fail. That single idea is the bridge from amino acids to protein structure, disease, and diagnosis.` },

    { q: "Joining amino acids: the peptide bond.",
      body: `To build a protein, amino acids must link together, and they do so through one specific, important type of bond.

The carboxyl group of one amino acid reacts with the amino group of the next. As they join, a molecule of water is removed - this is a condensation or dehydration reaction - and the link formed between them is called a peptide bond.

Two joined amino acids make a dipeptide; a few make an oligopeptide; many make a polypeptide, which folds into a protein. A chain always has an amino end, the N-terminus, and a carboxyl end, the C-terminus, and by convention sequences are written and read from N to C.

My Socratic question: the peptide bond has one unusual physical property that shapes every protein - it does not rotate freely, but is rigid and flat. Why should that matter?

The answer is that the peptide bond has partial double-bond character from resonance, which locks the six atoms around it into a single rigid plane. Because the backbone is a series of rigid planes joined at the alpha carbons, the protein can only fold in certain ways - which is exactly what makes consistent, predictable folding into helices and sheets possible.

Crucial insight: the peptide bond is the seam that turns a set of individual amino acids into a protein, and its rigid, planar nature is the structural constraint that makes protein folding orderly rather than random. Remember too that forming it releases water, and breaking it - digestion of protein in the gut - consumes water.` },

    { q: "Why this matters clinically: one amino acid can change everything.",
      body: `Let us make the stakes concrete with the disease that proves why every single amino acid counts.

My Socratic question: sickle cell disease is caused by a change to just one amino acid out of the roughly 146 in one haemoglobin chain. How can changing one unit out of nearly 150 cause a serious, sometimes fatal disease?

The answer lies in what the change is. In sickle cell disease, a single amino acid, glutamate - which is acidic, charged and water-loving - is replaced by valine, which is non-polar and hydrophobic, water-fearing. A charged, surface-loving residue is swapped for an oily, water-avoiding one, at a spot on the outside of the molecule.

That one wrong side chain creates a sticky hydrophobic patch on the haemoglobin surface. Under low-oxygen conditions, these patches make haemoglobin molecules clump and stack into long fibres, which distort the red cell into the rigid sickle shape that blocks blood vessels.

Crucial insight: this single example justifies the whole topic. A protein's function depends on the exact identity of each amino acid, because each side chain's chemistry - hydrophobic or hydrophilic, charged or neutral - determines how the protein folds and behaves. Swap one for another of the wrong class and you can destroy the protein and cause disease. When you identify sickle cells down a microscope, you are seeing the consequence of one amino acid in the wrong place.` },

    { q: "Consolidation and your final test.",
      body: `Your cognitive map for amino acids, in five lines.

The universal structure: an alpha carbon bonded to an amino group, a carboxyl group, a hydrogen, and a variable R group side chain - and only the R group differs between the twenty.

The handedness: the alpha carbon is chiral, and proteins use only L-amino acids; glycine, with an R group of just hydrogen, is the non-chiral exception.

The acid-base nature: with both an acidic carboxyl and a basic amino group, an amino acid is a zwitterion at body pH - net neutral but doubly charged - amphoteric, and able to buffer; its isoelectric point (pI) is the pH of zero net charge.

The four classes, all defined by the R group: non-polar (hydrophobic), polar uncharged (hydrophilic), acidic (negative), and basic (positive) - and these drive protein folding, hydrophobic side chains burying inside, charged ones facing the water.

The linkage: amino acids join by peptide bonds, formed by removing water, rigid and planar, running from N-terminus to C-terminus.

Now your final test. A student is studying a mutation in which a hydrophobic, non-polar amino acid buried deep in the water-fearing core of an enzyme is replaced by a basic, positively charged amino acid.

Question one: based on the two amino acids' classes, why is placing a charged residue in the protein's core a problem?
Question two: what is likely to happen to the enzyme's folded shape and its function?
Question three: name the general principle this illustrates about the relationship between an amino acid's side chain and a protein's structure.

Work them through before reading on.

My answers. One: the core of a folded protein is hydrophobic, built from non-polar side chains hiding from water; a basic, charged, water-loving residue does not belong there - it is strongly attracted to water and repelled by the oily interior, so it cannot sit stably in the core. Two: the misplaced charged residue destabilises the fold, likely pulling that part of the chain out toward the surface or preventing correct folding altogether, so the enzyme misfolds and loses its precise active-site shape and therefore its function. Three: the principle that a protein's structure, and hence its function, is determined by the chemical nature of its amino acid side chains and their correct relationship with water - the same principle that makes the single glutamate-to-valine swap cause sickle cell disease.

If those came cleanly, you understand amino acids as the foundation of all protein science - structure, function, and disease. Proteins and their folding are the natural next step.` },
  ],
  theory: [
    { q: "Draw in words the general structure common to all amino acids.", a: "A central alpha carbon bonded to four groups: an amino group (-NH2, basic), a carboxyl group (-COOH, acidic), a hydrogen atom, and a variable side chain called the R group. Only the R group differs between the twenty standard amino acids." },
    { q: "Why is the R group the most important part of an amino acid?", a: "Because the amino group, carboxyl group and hydrogen are identical in all twenty amino acids, only the R group varies. It therefore determines each amino acid's size, charge, chemistry, and whether it is hydrophobic or hydrophilic - in short, its identity and behaviour." },
    { q: "What is chirality in an amino acid, and which form do proteins use?", a: "The alpha carbon is bonded to four different groups, making it a chiral centre that exists as two non-superimposable mirror images, the L-form and the D-form. Proteins are built almost exclusively from L-amino acids." },
    { q: "Why is glycine not chiral?", a: "Glycine's R group is a single hydrogen atom, so its alpha carbon is bonded to two identical hydrogens rather than four different groups. It therefore has no mirror-image forms and is the one non-chiral standard amino acid." },
    { q: "Define a zwitterion and describe the state of an amino acid at physiological pH.", a: "A zwitterion is a molecule carrying both a positive and a negative charge simultaneously, with a net charge of zero. At physiological pH an amino acid's carboxyl group is deprotonated and negative while its amino group is protonated and positive, so it exists as a net-neutral zwitterion." },
    { q: "What does it mean that amino acids are amphoteric, and what useful property follows?", a: "Amphoteric means they can act as both an acid and a base, because they possess both an acidic carboxyl group and a basic amino group. This allows amino acids to act as buffers, resisting changes in pH." },
    { q: "Define the isoelectric point (pI).", a: "The isoelectric point is the specific pH at which an amino acid carries no net charge, existing purely as the zwitterion. Below the pI it is net positive; above the pI it is net negative. For a simple amino acid, pI is the average of its two pKa values." },
    { q: "State the four classes of amino acids based on their R groups.", a: "Non-polar (hydrophobic side chains), polar uncharged (hydrophilic but no full charge), acidic (negatively charged side chains at body pH), and basic (positively charged side chains at body pH)." },
    { q: "How do the amino acid classes drive protein folding?", a: "Non-polar, hydrophobic side chains are driven away from water and bury themselves in the protein's interior core, while polar and charged side chains are drawn to water and sit on the surface. Charged side chains can also form salt bridges. Thus the side chains sort themselves relative to water, folding the protein into its functional shape." },
    { q: "Describe the peptide bond and one key physical property.", a: "A peptide bond links the carboxyl group of one amino acid to the amino group of the next, formed by a condensation reaction that removes a water molecule. It has partial double-bond character from resonance, making it rigid and planar, which constrains and orders protein folding. Chains run from the N-terminus to the C-terminus." },
  ],
  videos: [
    { channel: "Ninja Nerd", title: "Amino Acids: Structure and Classification", note: "Thorough walk-through of the general structure, the R-group classes and their properties.", url: "https://www.youtube.com/watch?v=8qpEwjJvNfM" },
    { channel: "AK Lectures", title: "Amino Acids and Zwitterions", note: "Focuses on the acid-base behaviour, zwitterion and isoelectric point - the pH-linked core of this topic.", url: "https://www.youtube.com/watch?v=rp2brZFcCUk" },
    { channel: "Osmosis", title: "Amino Acids and Protein Structure", note: "Clear animation linking amino acid classes to how proteins fold, with clinical relevance.", url: "https://www.youtube.com/watch?v=2Sp9UFHYaBE" },
  ],
  mcqs: [
    { q: "The central carbon of an amino acid, bonded to four groups, is called the:", o: ["Chiral hydrogen", "Carboxyl carbon", "Beta carbon", "Alpha carbon"], a: 3, w: "The alpha carbon bears the amino group, carboxyl group, hydrogen and R group." },
    { q: "Which part of an amino acid varies between the twenty standard types?", o: ["The amino group", "The R group (side chain)", "The carboxyl group", "The alpha hydrogen"], a: 1, w: "Only the R group differs; the other three attachments are identical." },
    { q: "The R group of an amino acid determines all of the following EXCEPT:", o: ["Its charge", "Its hydrophobicity", "Its chemical behaviour", "The presence of the carboxyl group"], a: 3, w: "The carboxyl group is part of the common backbone, not the variable R group." },
    { q: "The amino group of an amino acid is:", o: ["Basic", "Neutral", "Acidic", "Non-polar"], a: 0, w: "The amino group is basic and tends to gain a hydrogen ion." },
    { q: "The carboxyl group of an amino acid is:", o: ["Neutral", "Hydrophobic", "Acidic", "Basic"], a: 2, w: "The carboxyl group is acidic and tends to lose a hydrogen ion." },
    { q: "An amino acid's alpha carbon is a chiral centre because it is bonded to:", o: ["A double bond", "Four different groups", "Only carbon atoms", "Two identical groups"], a: 1, w: "Four different attachments make it chiral, giving L and D forms." },
    { q: "Proteins are built almost exclusively from:", o: ["L-amino acids", "Non-chiral amino acids", "Both equally", "D-amino acids"], a: 0, w: "The body's machinery is stereospecific for the L-form." },
    { q: "The one standard amino acid that is NOT chiral is:", o: ["Alanine", "Valine", "Glycine", "Leucine"], a: 2, w: "Glycine's R group is a single hydrogen, so its alpha carbon is not chiral." },
    { q: "A molecule carrying both a positive and negative charge with a net charge of zero is a:", o: ["Cation", "Zwitterion", "Anion", "Radical"], a: 1, w: "The zwitterion is doubly charged but net neutral." },
    { q: "At physiological pH, the amino group of an amino acid is:", o: ["Uncharged", "Protonated and positive", "Absent", "Deprotonated and negative"], a: 1, w: "The amino group gains a hydrogen ion, becoming positively charged." },
    { q: "At physiological pH, the carboxyl group of an amino acid is:", o: ["Protonated and positive", "Uncharged", "Deprotonated and negative", "Doubly bonded"], a: 2, w: "The carboxyl group loses a hydrogen ion, becoming negatively charged." },
    { q: "That an amino acid can act as both an acid and a base means it is:", o: ["Chiral", "Non-polar", "Hydrophobic", "Amphoteric"], a: 3, w: "Amphoteric substances act as both acid and base." },
    { q: "Because they are amphoteric, amino acids can act as:", o: ["Lipids", "Enzymes", "Nucleotides", "Buffers"], a: 3, w: "They resist pH change, acting as buffers." },
    { q: "The isoelectric point (pI) is the pH at which an amino acid:", o: ["Carries no net charge", "Is fully positive", "Cannot dissolve", "Is fully negative"], a: 0, w: "At the pI the amino acid is a net-neutral zwitterion." },
    { q: "Below its isoelectric point, an amino acid carries a net charge that is:", o: ["Negative", "Positive", "Zero", "Undefined"], a: 1, w: "At low pH it is protonated and net positive." },
    { q: "For a simple amino acid, the pI is calculated as:", o: ["The lower pKa value", "The higher pKa value", "The sum of the two pKa values", "The average of the two pKa values"], a: 3, w: "pI is the average of the carboxyl and amino pKa values." },
    { q: "Non-polar amino acids have side chains that are:", o: ["Hydrophobic", "Positively charged", "Hydrophilic", "Negatively charged"], a: 0, w: "Non-polar R groups are water-fearing." },
    { q: "Acidic amino acids have side chains that at body pH are:", o: ["Positively charged", "Non-polar", "Uncharged", "Negatively charged"], a: 3, w: "Their side chains carry an extra carboxyl group, negative at body pH." },
    { q: "Basic amino acids have side chains that at body pH are:", o: ["Negatively charged", "Positively charged", "Hydrophobic", "Uncharged"], a: 1, w: "Their nitrogen-containing side chains are positively charged." },
    { q: "In a folded protein in water, hydrophobic side chains tend to be:", o: ["Buried in the interior core", "Removed", "On the surface", "Bonded to water"], a: 0, w: "Non-polar side chains hide from water in the protein's core." },
    { q: "In a folded protein, polar and charged side chains tend to be:", o: ["On the water-facing surface", "Non-existent", "Buried in the core", "Always hidden"], a: 0, w: "Hydrophilic side chains face the surrounding water." },
    { q: "A strong attraction between an acidic and a basic side chain within a protein is a:", o: ["Salt bridge", "Disulfide only", "Peptide bond", "Hydrophobic core"], a: 0, w: "Opposite charges attract, forming a stabilising salt bridge." },
    { q: "The bond linking two amino acids together is the:", o: ["Peptide bond", "Hydrogen bond", "Glycosidic bond", "Ionic bond"], a: 0, w: "The peptide bond joins the carboxyl of one to the amino of the next." },
    { q: "Forming a peptide bond involves:", o: ["Breaking the alpha carbon", "Adding a water molecule", "Removing a water molecule", "Adding oxygen"], a: 2, w: "It is a condensation reaction that removes water." },
    { q: "The peptide bond is rigid and planar because it has:", o: ["A hydrogen bond", "No electrons", "Partial double-bond character from resonance", "A full negative charge"], a: 2, w: "Resonance gives partial double-bond character, preventing rotation." },
    { q: "By convention, a peptide sequence is written from the:", o: ["Middle outward", "Longest side chain first", "N-terminus to C-terminus", "C-terminus to N-terminus"], a: 2, w: "Sequences run from the amino (N) end to the carboxyl (C) end." },
    { q: "In sickle cell disease, glutamate is replaced by valine, meaning a residue changes from:", o: ["Chiral to non-chiral", "Acidic and charged to non-polar and hydrophobic", "Non-polar to polar", "Basic to acidic"], a: 1, w: "A charged, water-loving residue becomes an oily, water-fearing one." },
    { q: "The number of standard amino acids that build human proteins is about:", o: ["Ten", "Twenty", "Fifty", "One hundred"], a: 1, w: "Around twenty standard amino acids build all proteins." },
    { q: "The single most useful question for classifying an amino acid is:", o: ["How heavy is it", "What colour is it", "What is the nature of its R group", "How old is the sample"], a: 2, w: "Classification and behaviour follow entirely from the R group." },
    { q: "The chain of two amino acids joined by a peptide bond is called a:", o: ["Triglyceride", "Protein", "Polypeptide", "Dipeptide"], a: 3, w: "Two joined amino acids form a dipeptide." },
  ],
};

/* --------------------------- psy:0 --------------------------- */
const T_PSY_OVERVIEW = {
  courseId: "psy",
  topicIndex: 0,
  title: "Overview of Psychology",
  minutes: 18,
  note: [
    { q: "Why does a laboratory scientist study psychology at all?",
      body: `You might reasonably ask why a medical laboratory science student, who will spend a career with samples and instruments, needs psychology. The answer reframes what medicine actually is.

My Socratic question: a patient is more than the tube of blood you receive. When a frightened patient comes for a test, or a diagnosis of a serious illness is delivered, what is being treated - a disease, or a person?

The answer is a person, and that distinction is the whole reason medical psychology exists. Medicine does not treat diseases floating in isolation; it treats people who have thoughts, fears, families, jobs and beliefs, all of which shape whether they fall ill, how they experience illness, whether they follow treatment, and whether they recover. Even in the laboratory, understanding the anxious patient, the reason someone delays a test, or how a result will land on a human being makes you a better professional.

Crucial insight: medical psychology is the scientific study of how psychological and behavioural factors affect health, illness and healthcare. It exists because the purely biological view of medicine - bodies as broken machines to be fixed - is incomplete. People are not machines, and treating them as such produces worse care and worse outcomes. This is the foundation on which the whole course is built.` },

    { q: "What exactly is psychology?",
      body: `Before medical psychology, we need the parent discipline clearly defined.

Psychology is the scientific study of behaviour and mental processes. Unpack that definition, because each part matters. Scientific means it relies on systematic observation and evidence, not opinion or intuition - psychology is a science, not common sense. Behaviour means anything a person does that can be observed, from speaking to a facial expression to avoiding a hospital. Mental processes means the internal events that cannot be directly seen - thoughts, emotions, memories, perceptions, motivations.

My Socratic question: if mental processes like thoughts and feelings cannot be directly observed, how can psychology claim to study them scientifically?

The answer is that psychology studies them indirectly, through their observable effects - what people say, how they behave, how their bodies respond. A racing heart and sweating palms are measurable signs of the unseen emotion of fear. This is how psychology remains a science while studying the invisible inner world.

Crucial insight: hold onto the two halves - observable behaviour and unobservable mental processes - because much of psychology is the effort to understand the hidden mental processes by carefully studying the visible behaviour they produce. In medicine, reading a patient's behaviour to understand their inner state is a daily clinical skill.` },

    { q: "The biomedical model and its limits.",
      body: `For most of modern medical history, one view dominated: the biomedical model. Understanding it, and its limitations, is the key to the whole topic.

The biomedical model holds that illness is caused purely by biological factors - a pathogen, a genetic fault, a biochemical imbalance, a damaged organ. Treatment therefore targets only the body: the drug, the surgery, the corrected chemistry. On this view, the patient's mind, emotions and social world are irrelevant to their disease.

My Socratic question: this model gave us antibiotics, vaccines and surgery, saving countless lives. So what is wrong with it?

The answer is that it is incomplete, not wrong. It cannot explain why two people with the same infection have very different outcomes, why stress makes people physically ill, why poverty predicts disease, or why some patients recover better with support. It reduces a person to a broken machine and ignores everything about them that is not biological - yet those non-biological factors demonstrably shape health.

Crucial insight: the biomedical model is powerful but partial. It answers what is physically wrong but not why this person, at this time, in this life, became ill and how they will cope. Medicine needed a fuller picture - which is exactly what the next model provides, and it is the single most important idea in this course.` },

    { q: "The biopsychosocial model: the heart of medical psychology.",
      body: `In 1977 the psychiatrist George Engel proposed a model that has since become the foundation of modern, humane medicine: the biopsychosocial model. If you remember one thing from this course, remember this.

My Socratic question: the name itself is three words fused together. What three kinds of factors does it insist we consider in every patient?

The answer is biological, psychological and social. The biopsychosocial model states that health and illness result from the dynamic interaction of all three. Biological factors are the body - genes, pathogens, biochemistry, organ function. Psychological factors are the mind - thoughts, emotions, beliefs, stress, coping style, behaviour. Social factors are the world around the person - family, relationships, culture, work, poverty, access to care.

None of these acts alone; they constantly influence one another. Stress (psychological) raises blood pressure (biological). Poverty (social) increases stress (psychological) and limits nutrition (biological). A supportive family (social) improves recovery (biological).

Crucial insight: the biopsychosocial model does not reject biology - it surrounds it with the psychological and social context that biology alone ignores. It is the difference between asking what disease the patient has and asking what is happening to this whole person. Every serious idea in medical psychology is an application of this one model, so make it automatic.` },

    { q: "Seeing the model in action: a worked example.",
      body: `An abstract model becomes powerful only when you can apply it. Let us run one patient through all three lenses.

Consider a man newly diagnosed with type 2 diabetes whose blood sugar remains poorly controlled despite medication. The biomedical model asks only: is he taking the right drug at the right dose? But the biopsychosocial model asks far more.

Biologically: his genetics, his pancreatic function, his weight, the medication itself. Psychologically: does he understand the disease, does he believe the treatment will help, is he depressed, does the fear of complications make him avoid thinking about it, has he the motivation to change his diet? Socially: can he afford healthy food and his medication, does his work allow regular meals, does his family support the changes, do his cultural food traditions clash with the diet?

My Socratic question: if his sugar stays high because he cannot afford both his medication and healthy food, will simply increasing the drug dose fix him?

The answer is no - and that is the lesson. A purely biological response misses the real cause, which is social and psychological. Effective care must address all three.

Crucial insight: the biopsychosocial model is not just theory to recite - it is a practical clinical tool that changes what questions you ask and what solutions you find. A poor lab result may have a psychological or social explanation, and understanding that makes every health worker, including you, more effective.` },

    { q: "The major perspectives in psychology.",
      body: `Psychology is not one single theory but several perspectives, each a different lens on why people think, feel and behave as they do. A brief map helps, because they recur throughout the course.

The biological perspective explains behaviour through the brain, nervous system, hormones and genes. The behavioural perspective focuses on how behaviour is learned through rewards and punishments from the environment. The cognitive perspective examines internal mental processes - how we perceive, think, remember and solve problems. The psychodynamic perspective, originating with Freud, emphasises unconscious drives and early experiences. The humanistic perspective stresses personal growth, free will and each person's drive to fulfil their potential. The sociocultural perspective looks at how society, culture and other people shape the individual.

My Socratic question: with so many competing perspectives, which one is correct?

The answer is that they are not rivals to be chosen between but complementary lenses - each captures part of a complex truth. This is exactly why the biopsychosocial model is so valuable: it deliberately combines the biological, psychological and social perspectives rather than forcing a choice.

Crucial insight: no single perspective explains everything about a person. Mature understanding, in psychology and in medicine, means holding several lenses at once. A patient's behaviour might be shaped by their brain chemistry, their learning history, their beliefs, and their culture all together.` },

    { q: "How psychology stays a science: its methods.",
      body: `Psychology insists on being scientific, which means it cannot rely on opinion or anecdote. It uses systematic research methods, and knowing them protects you from believing false claims about the mind.

The main methods include: experiments, which manipulate one factor and measure its effect while controlling others, allowing conclusions about cause and effect; observational studies, which watch and record behaviour without interfering; surveys and questionnaires, which gather self-reported data from many people; and case studies, which examine one individual in great depth.

My Socratic question: why does psychology insist on formal methods when we all feel we understand people already through common sense?

The answer is that common sense is unreliable and often contradictory - it tells us both that opposites attract and that birds of a feather flock together. Intuition is riddled with bias. Only systematic, evidence-based study can distinguish what is actually true about human behaviour from what merely feels true.

Crucial insight: this scientific commitment is what separates psychology from folk wisdom, astrology or opinion. As a laboratory scientist you already respect evidence over intuition; psychology applies that same standard to behaviour and the mind. When you evaluate a claim about patients or health behaviour, ask what the evidence is, just as you would for any lab result.` },

    { q: "Stress: where mind and body meet.",
      body: `One theme sits at the very centre of medical psychology because it visibly links the psychological and the biological: stress. It is the clearest proof that the mind affects the body.

Stress is the response that arises when the demands on a person exceed their perceived ability to cope. Note the word perceived - it is not the situation alone but the person's appraisal of it that matters, which is why the same event stresses one person and not another.

My Socratic question: how can a purely psychological experience - feeling overwhelmed - produce real, measurable physical disease?

The answer lies in the body's stress response. Perceived threat triggers the release of stress hormones like cortisol and adrenaline, raising heart rate and blood pressure and mobilising energy - useful in short bursts. But when stress is chronic, this same response damages the body: it raises blood pressure, suppresses the immune system, worsens conditions from heart disease to diabetes, and impairs healing. A psychological state produces biological harm.

Crucial insight: stress is the living demonstration of the biopsychosocial model. A social pressure or psychological worry becomes, through the stress response, a biological effect measurable in the very samples you will analyse - raised cortisol, altered immune markers, higher glucose. Mind and body are not separate; stress is where you see them meet.` },

    { q: "Why this matters for you, the laboratory scientist.",
      body: `It is fair to ask how this applies specifically to a career at the bench, away from the bedside. The connections are real and practical.

First, patient interaction: you will sometimes draw samples, and an anxious patient handled with understanding gives a better sample and a better experience - fear of needles, or of a bad result, is psychology you can ease. Second, health behaviour: understanding why people delay tests, avoid screening or ignore results helps you appreciate the human story behind a specimen. Third, your own wellbeing: laboratory and healthcare work is demanding, and understanding stress, burnout and coping protects your own mental health across a career. Fourth, teamwork and communication: healthcare is collaborative, and psychology underpins working well with colleagues and communicating results clearly.

My Socratic question: a sample arrives late because the patient was too frightened to come in for weeks. Is that a biological problem or a psychological one, and does it affect your work?

The answer is that it is psychological, and it absolutely affects your work - the delayed sample, the advanced disease it may reveal, the anxious patient behind it, are all consequences of psychology, and understanding them makes you a more complete professional.

Crucial insight: even the most technical, bench-based role in medicine sits inside a human system. Every sample comes from a person, goes to a person, and affects a person. Medical psychology is what keeps that human reality in view, and it makes you better at your job and kinder in it.` },

    { q: "Consolidation and your final test.",
      body: `Your cognitive map for the overview of medical psychology, in five lines.

What it is: medical psychology is the scientific study of how psychological and behavioural factors affect health, illness and healthcare; psychology itself is the scientific study of behaviour and mental processes.

The old view: the biomedical model, which explains illness purely by biological causes - powerful but incomplete, treating the person as a broken machine.

The central idea: the biopsychosocial model (Engel, 1977), in which health and illness arise from the dynamic interaction of biological, psychological and social factors - the foundation of modern, humane medicine.

The lenses: several psychological perspectives - biological, behavioural, cognitive, psychodynamic, humanistic, sociocultural - are complementary, not rivals, and psychology remains a science through systematic research methods.

The key theme: stress, where a psychological appraisal of threat produces real biological harm through stress hormones - the clearest proof that mind and body interact.

Now your final test. A young woman avoids going to the hospital for a breast lump for several months. When she finally attends, she is highly anxious, and it emerges she could not easily take time off her market job, feared what the result might mean, and had heard frightening stories in her community about the disease.

Question one: identify the biological, psychological and social factors at play in this single case.
Question two: how would a purely biomedical approach fall short in understanding why she delayed?
Question three: name the model that best captures her situation and explain why understanding it matters even for the laboratory scientist who will test her sample.

Work them through before reading on.

My answers. One: biological - the lump itself and whatever underlying disease it represents; psychological - her anxiety, her fear of the result, her avoidance as a coping response; social - her inability to leave her market job, and the frightening community beliefs about the disease. Two: a purely biomedical approach would focus only on the lump and its pathology, missing entirely why she delayed for months - and that delay, driven by psychological and social factors, may be the single most important thing affecting her outcome. Three: the biopsychosocial model, because it alone captures all three dimensions of her situation; it matters to the laboratory scientist because the sample you receive carries a human story - the delay, the anxiety, the advanced disease it may now reveal - and understanding that makes you a more thoughtful and effective part of her care.

If those came cleanly, you understand what medical psychology is and why it belongs in your training. The specific topics - stress, health behaviour, communication, coping - all build on this foundation.` },
  ],
  theory: [
    { q: "Define medical psychology.", a: "Medical psychology is the scientific study of how psychological and behavioural factors affect health, illness and healthcare. It exists because the purely biological view of medicine is incomplete; people's thoughts, emotions and social circumstances shape their health and recovery." },
    { q: "Define psychology and explain each part of the definition.", a: "Psychology is the scientific study of behaviour and mental processes. 'Scientific' means it relies on systematic evidence rather than opinion; 'behaviour' means observable actions; 'mental processes' means internal, unobservable events such as thoughts, emotions and memories, studied indirectly through their observable effects." },
    { q: "Describe the biomedical model and its main limitation.", a: "The biomedical model holds that illness is caused purely by biological factors (pathogens, genes, biochemical faults) and treats only the body. Its limitation is that it is incomplete: it ignores the psychological and social factors that demonstrably influence who becomes ill, how they cope and whether they recover, reducing the person to a broken machine." },
    { q: "State the biopsychosocial model and who proposed it.", a: "Proposed by George Engel in 1977, the biopsychosocial model states that health and illness result from the dynamic interaction of biological, psychological and social factors, rather than biological factors alone. It is the foundation of modern, humane, patient-centred medicine." },
    { q: "Give one example of how biological, psychological and social factors interact.", a: "For example, poverty (social) increases stress (psychological), which raises blood pressure and suppresses immunity (biological); or a supportive family (social) reduces stress (psychological) and improves recovery (biological). The three domains constantly influence one another." },
    { q: "Name four major perspectives in psychology and what each emphasises.", a: "The biological perspective (brain, hormones, genes), the behavioural perspective (learning through reward and punishment), the cognitive perspective (internal mental processes like thinking and memory), and the psychodynamic perspective (unconscious drives and early experience). Others include the humanistic and sociocultural perspectives. They are complementary lenses, not rivals." },
    { q: "Why does psychology use systematic research methods rather than common sense?", a: "Because common sense and intuition are unreliable, biased and often contradictory. Only systematic, evidence-based methods such as experiments, observation, surveys and case studies can distinguish what is actually true about behaviour from what merely feels true." },
    { q: "Define stress and explain the importance of the word 'perceived' in its definition.", a: "Stress is the response that arises when the demands on a person exceed their perceived ability to cope. 'Perceived' is crucial because it is the person's appraisal of the situation, not the situation itself, that determines the stress response - which is why the same event stresses one person but not another." },
    { q: "Explain how a psychological state such as stress can cause physical illness.", a: "Perceived threat triggers release of stress hormones like cortisol and adrenaline, raising heart rate and blood pressure and mobilising energy. When stress becomes chronic, this response damages the body: raising blood pressure, suppressing immunity, worsening conditions like heart disease and diabetes, and impairing healing." },
    { q: "Give two reasons medical psychology is relevant to a laboratory scientist.", a: "First, understanding anxious patients during sample collection gives better samples and experiences; second, understanding health behaviour explains why people delay tests or ignore results. It also protects the scientist's own wellbeing against stress and burnout, and improves teamwork and communication of results." },
  ],
  videos: [
    { channel: "CrashCourse", title: "Intro to Psychology", note: "Lively introduction to what psychology is and how it became a science.", url: "https://www.youtube.com/watch?v=vo4pMVb0R6M" },
    { channel: "Osmosis", title: "The Biopsychosocial Model", note: "Clear medical explanation of the biological, psychological and social framework.", url: "https://www.youtube.com/watch?v=FKtWr2xvRpQ" },
    { channel: "CrashCourse", title: "The Perspectives of Psychology", note: "Walks through the major perspectives - biological, cognitive, behavioural and more.", url: "https://www.youtube.com/watch?v=eYK_29Oj3Fg" },
  ],
  mcqs: [
    { q: "Medical psychology is best defined as the study of how:", o: ["Drugs cure disease", "Samples are analysed", "Organs fail", "Psychological and behavioural factors affect health and illness"], a: 3, w: "It studies how psychological and behavioural factors affect health, illness and care." },
    { q: "Psychology is the scientific study of:", o: ["The brain only", "Behaviour and mental processes", "Diseases", "Society only"], a: 1, w: "Psychology studies both observable behaviour and internal mental processes." },
    { q: "In the definition of psychology, 'mental processes' refers to:", o: ["Internal events like thoughts and emotions", "Social class", "Blood tests", "Observable actions"], a: 0, w: "Mental processes are the unobservable inner events studied indirectly." },
    { q: "Psychology studies unobservable mental processes by:", o: ["Examining their observable effects on behaviour and the body", "Reading minds", "Guessing", "Ignoring them"], a: 0, w: "It infers inner states from measurable behaviour and physical responses." },
    { q: "The biomedical model explains illness as caused by:", o: ["Purely biological factors", "Bad luck", "Psychological factors only", "Social factors only"], a: 0, w: "The biomedical model attributes illness solely to biological causes." },
    { q: "The main limitation of the biomedical model is that it:", o: ["Is always wrong", "Is too new", "Cannot treat infection", "Ignores psychological and social factors"], a: 3, w: "It is incomplete, omitting the psychological and social dimensions of health." },
    { q: "The biopsychosocial model was proposed by:", o: ["Ivan Pavlov", "George Engel", "B.F. Skinner", "Sigmund Freud"], a: 1, w: "George Engel proposed the biopsychosocial model in 1977." },
    { q: "The biopsychosocial model states that health results from the interaction of:", o: ["Diet and exercise", "Biological, psychological and social factors", "Genes and drugs", "Biological factors only"], a: 1, w: "It integrates all three domains as dynamically interacting." },
    { q: "In the biopsychosocial model, a person's beliefs and emotions are which kind of factor?", o: ["Biological", "Social", "Psychological", "Chemical"], a: 2, w: "Thoughts, emotions and beliefs are psychological factors." },
    { q: "In the biopsychosocial model, poverty and family support are which kind of factor?", o: ["Genetic", "Social", "Psychological", "Biological"], a: 1, w: "Family, culture, work and poverty are social factors." },
    { q: "A patient's blood sugar stays high because he cannot afford both medication and healthy food. This is primarily a:", o: ["Problem of drug dose only", "Purely biological problem", "Social and psychological problem", "Non-problem"], a: 2, w: "The cause is social and psychological, missed by a biological-only view." },
    { q: "The perspective that explains behaviour through the brain, hormones and genes is the:", o: ["Humanistic perspective", "Biological perspective", "Sociocultural perspective", "Behavioural perspective"], a: 1, w: "The biological perspective focuses on physical bases of behaviour." },
    { q: "The perspective focusing on learning through rewards and punishments is the:", o: ["Behavioural perspective", "Psychodynamic perspective", "Biological perspective", "Cognitive perspective"], a: 0, w: "The behavioural perspective studies learned behaviour." },
    { q: "The perspective examining internal processes like thinking and memory is the:", o: ["Biological perspective", "Humanistic perspective", "Cognitive perspective", "Behavioural perspective"], a: 2, w: "The cognitive perspective studies mental processing." },
    { q: "The psychodynamic perspective, originating with Freud, emphasises:", o: ["Rewards and punishments", "Free will and growth", "Brain chemistry", "Unconscious drives and early experience"], a: 3, w: "Psychodynamic theory stresses unconscious forces and early life." },
    { q: "The major perspectives in psychology are best regarded as:", o: ["Complementary lenses on a complex truth", "Identical", "Rivals, only one correct", "Outdated"], a: 0, w: "Each captures part of the truth; together they give a fuller picture." },
    { q: "Psychology insists on systematic research methods because:", o: ["It dislikes evidence", "Intuition is biased and often contradictory", "Methods are traditional", "Common sense is reliable"], a: 1, w: "Only systematic evidence separates what is true from what merely feels true." },
    { q: "A research method that manipulates one factor to establish cause and effect is a(n):", o: ["Observation", "Experiment", "Survey", "Case study"], a: 1, w: "Experiments manipulate variables under control to show causation." },
    { q: "Examining a single individual in great depth is a(n):", o: ["Case study", "Survey", "Observation", "Experiment"], a: 0, w: "A case study is an in-depth study of one individual." },
    { q: "Stress is defined as the response when demands:", o: ["Are always physical", "Are pleasant", "Exceed a person's perceived ability to cope", "Come from genes"], a: 2, w: "Stress arises when demands exceed perceived coping ability." },
    { q: "The word 'perceived' in the definition of stress matters because:", o: ["Stress is imaginary", "Only doctors feel stress", "Perception is irrelevant", "It is the appraisal, not the event alone, that produces stress"], a: 3, w: "The same event stresses one person and not another due to appraisal." },
    { q: "Chronic stress harms the body mainly through prolonged release of:", o: ["Digestive enzymes", "Stress hormones like cortisol and adrenaline", "Insulin", "Antibodies"], a: 1, w: "Sustained cortisol and adrenaline damage the body over time." },
    { q: "Which is a documented physical effect of chronic stress?", o: ["Suppressed immune system and raised blood pressure", "Lower glucose", "Stronger immunity", "Faster healing"], a: 0, w: "Chronic stress suppresses immunity and raises blood pressure." },
    { q: "Stress is often used to illustrate the biopsychosocial model because it shows:", o: ["Biology is irrelevant", "Society does not matter", "The mind and body are separate", "A psychological state producing biological effects"], a: 3, w: "Stress demonstrates mind-body interaction directly." },
    { q: "For a laboratory scientist, understanding an anxious patient during sample collection leads to:", o: ["Slower results only", "A worse sample", "A better sample and experience", "No difference"], a: 2, w: "Easing fear improves both the sample and the patient's experience." },
    { q: "A patient delaying a test for weeks out of fear is primarily an example of a:", o: ["Psychological factor affecting health behaviour", "Social class only", "Biological factor", "Instrument error"], a: 0, w: "Fear-driven delay is a psychological factor shaping health behaviour." },
    { q: "The biopsychosocial model differs from the biomedical model chiefly by:", o: ["Rejecting biology entirely", "Ignoring disease", "Adding psychological and social context to biology", "Using no evidence"], a: 2, w: "It surrounds biology with psychological and social context, not rejecting it." },
    { q: "Which question reflects biopsychosocial rather than purely biomedical thinking?", o: ["What is the cell count", "What is the drug dose", "What is happening to this whole person", "What pathogen is present"], a: 2, w: "Considering the whole person is the biopsychosocial approach." },
    { q: "Medical psychology exists fundamentally because:", o: ["Tests are unreliable", "Biology is unimportant", "People are machines", "The purely biological view of medicine is incomplete"], a: 3, w: "It addresses the human factors the biomedical model omits." },
    { q: "The best summary of the biopsychosocial model is that health arises from:", o: ["Medication only", "Genes alone", "Luck", "The dynamic interaction of body, mind and social world"], a: 3, w: "Health emerges from interacting biological, psychological and social factors." },
  ],
};

/* --------------------------- com:0 --------------------------- */
const T_COM_PROCESS = {
  courseId: "com",
  topicIndex: 0,
  title: "Communication",
  minutes: 18,
  note: [
    { q: "Why does a scientist need a course on communication?",
      body: `You may see communication as a soft subject beside your science courses, but consider what a laboratory result actually is: information that must travel accurately from you to a doctor, and from a doctor to a patient. If that information is distorted anywhere along the way, the science is wasted.

My Socratic question: you correctly identify a dangerous infection in a sample, but the report is unclear and the doctor misreads it. Whose skill failed - the science, or the communication - and what happens to the patient?

The answer is that the communication failed, and the patient may be harmed just as surely as if the test itself were wrong. A brilliant result that is poorly communicated is a useless result. In healthcare, communication failures are among the leading causes of preventable harm.

Crucial insight: communication is not separate from your science - it is how your science reaches the people it is meant to help. A laboratory scientist who cannot communicate clearly is a danger, however skilled at the bench. This course treats communication as a technical skill to be understood and improved, exactly as you would any laboratory technique - and it begins with understanding the process itself.` },

    { q: "What is communication, really?",
      body: `We use the word constantly, so let us pin it down precisely, because the definition contains the whole secret.

Communication is the process of exchanging information, ideas or feelings between a sender and a receiver, resulting in shared understanding.

My Socratic question: focus on the last two words - shared understanding. If you speak clearly but the other person does not understand you, has communication happened?

The answer is no. This is the single most important idea in the whole topic. Communication is not merely sending a message - it is achieving shared meaning. If the message is sent but not understood, or understood differently from what you intended, communication has failed no matter how well you spoke. The responsibility is not just to transmit but to be understood.

Crucial insight: shift your mental model from communication as sending to communication as sharing meaning. A message only succeeds when the idea in your mind is accurately recreated in the other person's mind. This reframing changes everything - it makes you responsible for the receiver's understanding, not just your own words. Every element of the process that follows exists to serve that one goal: shared understanding.` },

    { q: "The communication process: the sender and encoding.",
      body: `Communication is a process with distinct stages, and understanding each lets you find exactly where it breaks. It begins in the mind of one person.

The sender, sometimes called the source, is the person who originates the message - who has an idea, thought or feeling they wish to share. But an idea in the mind cannot travel directly to another mind. It must first be turned into a form that can be sent.

This translation is called encoding: the sender converts their idea into words, symbols, gestures or images that can be transmitted. When you decide how to phrase a lab report, choosing your words and terminology, you are encoding.

My Socratic question: a scientist explaining a result to a fellow scientist and to a frightened patient must encode the same idea very differently. Why?

The answer is that effective encoding must match the receiver. The expert can decode technical terms; the patient cannot. Choosing symbols the receiver can actually understand - simple words for the patient, precise terms for the colleague - is the skill of encoding. Encode for your audience, not for yourself.

Crucial insight: many communication failures begin right here, at encoding, before the message is even sent. If you choose words your receiver cannot understand, you have doomed the message from the start. Good communication starts by considering who will receive it and encoding accordingly.` },

    { q: "The message and the channel.",
      body: `Once encoded, the idea has become a message, and that message needs a route to travel.

The message is the actual encoded information - the words spoken, the report written, the gesture made. It is the content, verbal or non-verbal, that carries the sender's meaning.

The channel is the medium through which the message travels from sender to receiver. Speech travels through sound waves in the air; a written report travels through paper or a screen; a phone call, an email, a text, a face-to-face conversation - each is a different channel.

My Socratic question: a critically abnormal, urgent lab result could be sent by email, or communicated by an immediate phone call. Which channel is right, and why does the choice matter?

The answer is that the urgent result demands a phone call - a channel that is immediate and confirms receipt - not an email that might sit unread for hours. Choosing the wrong channel can be as damaging as a wrong message. Critical results in the laboratory have formal rules requiring direct, confirmed communication precisely because the channel matters.

Crucial insight: matching the channel to the message is a real professional skill. Routine information suits routine channels; urgent or sensitive information demands direct, confirmed ones. The best-worded message fails if sent by a channel that does not reach the receiver in time.` },

    { q: "The receiver and decoding.",
      body: `The message arrives, but the journey is not over - it must be understood, and this happens through a process that mirrors encoding in reverse.

The receiver is the person for whom the message is intended, who takes in the message. But just as the sender's idea had to be encoded into symbols, the receiver must now translate those symbols back into meaning. This is decoding: the receiver interprets the words, symbols or gestures to extract the idea.

My Socratic question: here lies the central danger of all communication. The sender encodes from their own knowledge and perspective; the receiver decodes from theirs. What happens when the two perspectives differ?

The answer is misunderstanding - the gap between encoding and decoding is where most communication fails. The sender means one thing; the receiver, decoding through their own knowledge, culture and emotional state, understands another. A word clear to you may mean something different, or nothing, to them. The idea recreated in the receiver's mind is not the idea you sent.

Crucial insight: because encoding and decoding happen in two different minds, perfect transmission is never guaranteed. This is why checking understanding matters so much - you cannot assume the receiver decoded your message as you intended. The whole art of communication is narrowing the gap between what you meant and what they understood.` },

    { q: "Feedback: how you know it worked.",
      body: `If communication is about shared understanding, there must be a way to check whether that understanding was actually achieved. That mechanism is feedback, and it is what turns communication from a hopeful broadcast into a reliable exchange.

Feedback is the receiver's response back to the sender, which shows whether and how the message was understood. It can be a spoken reply, a question, a nod, a puzzled frown, or an action taken. Through feedback, the sender learns whether the message landed as intended and can correct it if not.

My Socratic question: a purely one-way message - a sender transmitting with no feedback - is like the radio announcer who never knows if anyone heard. Why is a two-way process with feedback so much more reliable?

The answer is that feedback closes the loop. Without it, the sender is guessing. With it, the sender can confirm understanding, clarify what was missed, and correct errors before they cause harm. This is exactly why, in healthcare, critical instructions are read back - the nurse repeats the order, giving feedback that confirms correct decoding.

Crucial insight: feedback transforms communication from one-way sending into a genuine two-way exchange, and it is the safeguard against misunderstanding. Never assume you were understood - seek the feedback that proves it. In the laboratory, confirming that an urgent result was received and understood is feedback that can save a life.` },

    { q: "Noise: everything that gets in the way.",
      body: `The process would work perfectly in an ideal world, but reality constantly interferes. Everything that disrupts communication is grouped under one term: noise.

Noise is anything that interferes with the message and distorts or blocks shared understanding. It can enter at any stage, and it comes in several kinds.

Physical noise is external interference - literal background sound, a bad phone line, poor handwriting, interruptions. Physiological noise comes from the body - pain, deafness, tiredness, hunger that stops someone attending. Psychological noise comes from the mind - stress, fear, prejudice, distraction, strong emotion that colours how a message is received. Semantic noise comes from the language itself - jargon, ambiguous words, or terms the sender and receiver understand differently.

My Socratic question: a frightened patient is given complex results in technical jargon in a noisy corridor. Identify the noise, and predict the outcome.

The answer is that several kinds of noise pile up: psychological noise from the patient's fear, semantic noise from the jargon, physical noise from the corridor. The message has almost no chance of being understood. The outcome is a patient who leaves confused and anxious.

Crucial insight: noise is not just literal sound - it is any barrier, external or internal, physical, psychological or semantic, that degrades understanding. The skilled communicator actively works to reduce noise: choosing a quiet setting, plain language, and a calm moment. Recognising the kinds of noise lets you remove them.` },

    { q: "Putting the whole process together.",
      body: `Now assemble the complete model, because seeing it whole lets you diagnose any breakdown.

An idea begins in the sender's mind. The sender encodes it into a message. The message travels through a channel to the receiver. The receiver decodes it back into an idea. The receiver sends feedback confirming their understanding. And throughout, noise threatens to distort the message at every stage.

My Socratic question: this whole process exists to achieve one thing we defined at the start. What is it?

The answer is shared understanding - the idea in the sender's mind accurately recreated in the receiver's mind. Every element serves that goal: encoding and decoding to translate, the channel to carry, feedback to confirm, and the constant effort to overcome noise.

The power of this model is diagnostic. When communication fails, you can locate exactly where: Was the encoding poor (wrong words)? The channel wrong (unread email)? The decoding mistaken (receiver misunderstood)? Was there no feedback to catch the error? Was noise the culprit (jargon, fear, a noisy room)?

Crucial insight: the communication process is not just a diagram to memorise - it is a fault-finding tool. Whenever a message fails, run through the stages and you will find the break. This turns communication from a mysterious art into a systematic skill you can analyse and fix, exactly as you would troubleshoot a failed laboratory procedure.` },

    { q: "Verbal and non-verbal communication.",
      body: `One more essential distinction shapes every message: not all communication happens through words, and the wordless part is often the more powerful.

Verbal communication is the use of words, spoken or written, to convey the message. Non-verbal communication is everything else that carries meaning - facial expression, eye contact, posture, gestures, tone of voice, touch, and the physical distance between people.

My Socratic question: a health worker says "There's nothing to worry about" while frowning, avoiding eye contact and edging toward the door. Which message does the patient believe - the words or the body language?

The answer is the body language, almost always. When verbal and non-verbal messages conflict, people trust the non-verbal, because it is harder to fake and feels more honest. The reassuring words are cancelled out by the anxious body.

Crucial insight: your non-verbal communication is constantly sending messages, whether you intend it or not, and it can support or completely undermine your words. In healthcare this is vital - a warm tone and attentive posture reassure a frightened patient more than the words alone, while a distracted, cold manner frightens them regardless of what you say. Making your non-verbal signals match and reinforce your words is a core professional communication skill.` },

    { q: "Consolidation and your final test.",
      body: `Your cognitive map for the communication process, in five lines.

The goal: communication is the exchange of information resulting in shared understanding - not merely sending a message, but ensuring the idea in one mind is accurately recreated in another.

The process: an idea is encoded by the sender into a message, carried by a channel to the receiver, who decodes it, and returns feedback confirming understanding.

The obstacle: noise - physical, physiological, psychological or semantic - threatens the message at every stage and must be actively reduced.

The diagnostic power: when communication fails, the model lets you locate the break - in encoding, channel, decoding, missing feedback, or noise.

The wordless channel: non-verbal communication - expression, tone, posture, eye contact - constantly carries meaning and, when it conflicts with words, is what people believe.

Now your final test. A laboratory scientist phones a busy ward to report a critical potassium result. The ward is noisy, the scientist uses rapid technical shorthand, the nurse who answers is distracted mid-task, and the scientist hangs up without asking the nurse to confirm. The result is never acted upon and the patient deteriorates.

Question one: identify the sender, message, channel and receiver in this scenario.
Question two: name at least two types of noise present and one element of the process that was skipped.
Question three: state what single change would most likely have prevented the harm, and link it to the definition of communication.

Work them through before reading on.

My answers. One: the sender is the laboratory scientist, the message is the critical potassium result, the channel is the phone call, and the receiver is the nurse. Two: physical noise from the noisy ward, semantic noise from the rapid technical shorthand, and psychological or physiological noise from the distracted nurse - and the element skipped was feedback, since the scientist never confirmed the nurse understood. Three: the single most important change would be to seek feedback - asking the nurse to read back the result and confirm the action - because communication is defined as achieving shared understanding, and without that confirmation the scientist only sent a message but never established that it was understood. Adding plain language and choosing a calmer moment would further reduce the noise.

If those came cleanly, you understand communication as a process you can analyse, diagnose and improve - a technical skill as real as any at the bench, and one that keeps patients safe.` },
  ],
  theory: [
    { q: "Define communication, and explain why 'shared understanding' is the key part of the definition.", a: "Communication is the process of exchanging information, ideas or feelings between a sender and receiver, resulting in shared understanding. 'Shared understanding' is key because communication is not merely sending a message - it succeeds only when the idea in the sender's mind is accurately recreated in the receiver's mind. A message sent but not understood is a communication failure." },
    { q: "What is encoding, and why must it match the receiver?", a: "Encoding is the process by which the sender translates their idea into words, symbols, gestures or images that can be transmitted. It must match the receiver because they can only understand symbols they can decode - technical terms for a colleague, plain words for a patient. Encoding for the wrong audience dooms the message from the start." },
    { q: "Distinguish the message from the channel.", a: "The message is the actual encoded information - the words, report or gesture carrying the meaning. The channel is the medium through which the message travels, such as speech, a written report, a phone call, an email or a face-to-face conversation." },
    { q: "Why does the choice of channel matter? Give a laboratory example.", a: "Because the channel must suit the message's urgency and sensitivity. A critical, urgent lab result demands an immediate phone call that confirms receipt, not an email that may sit unread. The wrong channel can cause harm even when the message itself is correct, which is why critical results have rules requiring direct, confirmed communication." },
    { q: "What is decoding, and why is the gap between encoding and decoding the main source of misunderstanding?", a: "Decoding is the receiver's translation of the received symbols back into meaning. The sender encodes from their own knowledge and perspective while the receiver decodes from theirs; when the two differ, the idea recreated in the receiver's mind is not the one sent. This gap between two different minds is where most communication fails." },
    { q: "Define feedback and explain its importance.", a: "Feedback is the receiver's response back to the sender that shows whether and how the message was understood - a reply, question, nod or action. It closes the loop, letting the sender confirm understanding and correct errors, turning one-way sending into a reliable two-way exchange. Reading back a critical instruction is feedback that prevents harm." },
    { q: "Define noise and list its four main types.", a: "Noise is anything that interferes with the message and distorts or blocks shared understanding. The four main types are physical (external interference like background sound or poor handwriting), physiological (from the body, such as pain, deafness or tiredness), psychological (from the mind, such as fear, stress or prejudice), and semantic (from language, such as jargon or ambiguous terms)." },
    { q: "Explain how the communication process model helps diagnose a communication failure.", a: "Because the process has distinct stages, a failure can be located precisely: was the encoding poor (wrong words), the channel wrong (unread email), the decoding mistaken, was feedback missing to catch the error, or was noise the cause? Running through the stages finds the break, making communication a systematic skill to troubleshoot rather than a mysterious art." },
    { q: "Distinguish verbal from non-verbal communication and explain what happens when they conflict.", a: "Verbal communication uses words, spoken or written. Non-verbal communication is everything else that conveys meaning - facial expression, eye contact, posture, gesture, tone of voice, touch and distance. When the two conflict, people almost always believe the non-verbal message, because it is harder to fake and feels more honest." },
    { q: "Why is communication a critical skill specifically for a laboratory scientist?", a: "Because a laboratory result is information that must travel accurately from the scientist to the doctor and on to the patient; if it is distorted anywhere, the science is wasted and the patient may be harmed. A result that is poorly communicated is useless, and communication failures are among the leading causes of preventable harm in healthcare." },
  ],
  videos: [
    { channel: "Communication Coach Alexander Lyon", title: "The Communication Process", note: "Clear walk-through of sender, encoding, channel, decoding, feedback and noise.", url: "https://www.youtube.com/watch?v=-flP_rQtIvA" },
    { channel: "GreggU", title: "The Communication Process Model", note: "Concise breakdown of each element with simple examples.", url: "https://www.youtube.com/watch?v=urTfoNCJ4Ho" },
    { channel: "Communication Coach Alexander Lyon", title: "Nonverbal Communication", note: "Explores how body language, tone and expression carry meaning alongside words.", url: "https://www.youtube.com/watch?v=8f4wBFEwaTk" },
  ],
  mcqs: [
    { q: "Communication is best defined as the exchange of information that results in:", o: ["A loud voice", "A written report", "A sent message", "Shared understanding"], a: 3, w: "Communication succeeds only when shared understanding is achieved." },
    { q: "If a message is sent clearly but the receiver does not understand it, communication has:", o: ["Failed", "Not started", "Succeeded", "Been perfect"], a: 0, w: "Without shared understanding, communication has failed." },
    { q: "The person who originates the message is the:", o: ["Channel", "Sender", "Receiver", "Decoder"], a: 1, w: "The sender (source) originates the idea to be shared." },
    { q: "Converting an idea into words, symbols or gestures is called:", o: ["Decoding", "Channelling", "Encoding", "Feedback"], a: 2, w: "Encoding is translating the idea into a transmittable form." },
    { q: "Effective encoding requires that the sender:", o: ["Ignore the audience", "Speak quickly", "Match the symbols to what the receiver can understand", "Use complex terms always"], a: 2, w: "Encode for the receiver - plain words for a patient, precise terms for a colleague." },
    { q: "The actual encoded information being conveyed is the:", o: ["Noise", "Channel", "Message", "Feedback"], a: 2, w: "The message is the encoded content carrying the meaning." },
    { q: "The medium through which a message travels is the:", o: ["Message", "Sender", "Decoder", "Channel"], a: 3, w: "The channel is the route, such as speech, email or a phone call." },
    { q: "An urgent critical lab result is best communicated by:", o: ["A note left on a desk", "An immediate phone call confirming receipt", "A text next week", "An email that may sit unread"], a: 1, w: "Urgent results need a direct, confirmed channel." },
    { q: "The person for whom the message is intended is the:", o: ["Receiver", "Sender", "Encoder", "Source"], a: 0, w: "The receiver takes in and interprets the message." },
    { q: "Interpreting the received symbols back into meaning is called:", o: ["Feedback", "Decoding", "Encoding", "Channelling"], a: 1, w: "Decoding is the receiver's translation of symbols into an idea." },
    { q: "Most misunderstanding arises from the gap between:", o: ["Sender and channel", "Encoding and decoding", "Feedback and reply", "Message and noise"], a: 1, w: "Sender and receiver interpret from different perspectives, causing the gap." },
    { q: "The receiver's response that shows whether the message was understood is:", o: ["Feedback", "Noise", "Encoding", "The channel"], a: 0, w: "Feedback closes the loop and confirms understanding." },
    { q: "Feedback is important because it:", o: ["Ends communication", "Adds noise", "Replaces the message", "Confirms understanding and allows correction"], a: 3, w: "It turns one-way sending into a reliable two-way exchange." },
    { q: "In healthcare, a nurse reading back a critical instruction is an example of:", o: ["Feedback", "A channel", "Encoding", "Noise"], a: 0, w: "The read-back is feedback confirming correct decoding." },
    { q: "Anything that interferes with a message and distorts understanding is called:", o: ["Feedback", "Noise", "The channel", "Encoding"], a: 1, w: "Noise is any barrier that degrades shared understanding." },
    { q: "Background sound, a bad phone line and poor handwriting are examples of:", o: ["Semantic noise", "Psychological noise", "Feedback", "Physical noise"], a: 3, w: "Physical noise is external interference." },
    { q: "Fear, stress and prejudice that colour how a message is received are:", o: ["Physical noise", "Semantic noise", "Psychological noise", "Channels"], a: 2, w: "Psychological noise comes from the receiver's mind and emotions." },
    { q: "Jargon and ambiguous words that are understood differently are:", o: ["Semantic noise", "Feedback", "Physical noise", "Physiological noise"], a: 0, w: "Semantic noise arises from language itself." },
    { q: "Pain, deafness and tiredness that stop someone attending are:", o: ["Physical noise", "Semantic noise", "Encoding", "Physiological noise"], a: 3, w: "Physiological noise comes from the body's state." },
    { q: "The main value of the communication process model is that it:", o: ["Removes all noise", "Lets you locate exactly where communication fails", "Looks impressive", "Replaces speaking"], a: 1, w: "It is a diagnostic tool for finding the break in a failed message." },
    { q: "Communication using words, spoken or written, is:", o: ["Feedback", "Noise", "Non-verbal communication", "Verbal communication"], a: 3, w: "Verbal communication is the use of words." },
    { q: "Facial expression, posture, tone and eye contact are:", o: ["Encoding", "Non-verbal communication", "Channels", "Verbal communication"], a: 1, w: "Non-verbal communication is meaning carried without words." },
    { q: "When verbal and non-verbal messages conflict, people usually believe the:", o: ["Loudest one", "Neither", "Non-verbal message", "Verbal message"], a: 2, w: "Non-verbal signals are harder to fake and are trusted more." },
    { q: "A worker says 'nothing to worry about' while frowning and backing away. The patient will likely feel:", o: ["Nothing", "Worried, trusting the body language", "Reassured", "Bored"], a: 1, w: "The non-verbal message overrides the reassuring words." },
    { q: "The idea that the sender is responsible for the receiver's understanding reflects communication as:", o: ["Achieving shared meaning", "Writing reports", "One-way sending", "Speaking loudly"], a: 0, w: "Responsibility extends to being understood, not just transmitting." },
    { q: "A message poorly encoded in terms the receiver cannot understand fails at the stage of:", o: ["Encoding", "Feedback", "Decoding only", "The channel"], a: 0, w: "Choosing symbols the receiver cannot decode dooms the message at encoding." },
    { q: "Choosing a quiet room and plain language for a nervous patient is an effort to reduce:", o: ["Feedback", "The channel", "Noise", "Encoding"], a: 2, w: "It removes physical, semantic and psychological noise." },
    { q: "For a laboratory scientist, a brilliant result that is poorly communicated is:", o: ["Effectively useless", "Better than none", "Still fully useful", "Automatically understood"], a: 0, w: "If the information does not reach and inform correctly, the result is wasted." },
    { q: "The complete communication process, in order, is:", o: ["Channel, feedback, encode, decode", "Feedback, noise, encode, decode", "Encode, channel, decode, feedback", "Decode, channel, encode, feedback"], a: 2, w: "The sender encodes, the channel carries, the receiver decodes, then gives feedback." },
    { q: "Every element of the communication process ultimately serves to achieve:", o: ["More noise", "A longer report", "A louder message", "Shared understanding"], a: 3, w: "Shared understanding is the goal the whole process serves." },
  ],
};

/* --------------------------- mls:0 --------------------------- */
const T_MLS_SAFETY = {
  courseId: "lab",
  topicIndex: 1,
  title: "Lab Safety",
  minutes: 20,
  note: [
    { q: "Why is safety the very first thing a lab scientist learns?",
      body: `Before you run a single test, before you touch a single sample, you learn safety. This is not bureaucratic caution - it is because the medical laboratory is one of the most hazardous workplaces in healthcare.

My Socratic question: a sample of blood arrives at your bench. It looks harmless - a small tube of red liquid. Why should you treat it as potentially deadly?

The answer is that any sample may carry invisible, lethal pathogens - HIV, hepatitis B, tuberculosis - and you cannot tell by looking. The laboratory concentrates the very dangers medicine exists to fight: infectious agents, corrosive chemicals, sharp instruments, flammable reagents, electrical equipment. A single careless moment can cause a laboratory-acquired infection, a chemical burn, or a fire.

Crucial insight: laboratory safety is the discipline of preventing harm to yourself, your colleagues, your patients and the environment while working with hazardous materials. It is the foundation of everything else, because a scientist who is injured, infected, or dead cannot help anyone. Safety is not the enemy of good work - it is the precondition for it. This is why every laboratory course, and every laboratory career, begins here.` },

    { q: "The kinds of hazards you will face.",
      body: `To control danger you must first recognise it. Laboratory hazards fall into several clear categories, and naming them is the first step to managing them.

Biological hazards are infectious agents - bacteria, viruses, fungi, parasites - present in patient samples and cultures, capable of causing infection. Chemical hazards are the reagents, acids, bases, solvents and stains that can burn, poison, or react dangerously. Physical hazards include sharp objects, or "sharps" - needles, broken glass, blades - as well as heat, and moving equipment. Electrical hazards come from the many powered instruments. Fire hazards arise from flammable solvents and open flames. Ergonomic hazards come from repetitive work and poor posture over long shifts.

My Socratic question: of all these, which single category is most characteristic of the medical laboratory and most feared?

The answer is the biological hazard - the risk of infection from patient samples - because it is invisible, ever-present, and can be fatal. This is why so much of laboratory safety centres on containing and neutralising biological threats.

Crucial insight: every hazard has its own controls, but the mindset is universal - identify the hazard, assess the risk, and apply the right protection. You cannot protect against a danger you have not recognised, so learning to see the hazards in every task is the first safety skill.` },

    { q: "The hierarchy of controls: the smartest way to stay safe.",
      body: `Here is a principle that separates real safety thinking from simply wearing gloves. Not all protections are equal, and there is a proper order to them called the hierarchy of controls.

The hierarchy ranks safety measures from most effective to least. At the top is elimination - removing the hazard entirely, the best option of all. Next is substitution - replacing a dangerous material with a safer one, such as a less toxic stain. Then engineering controls - physical devices that contain the hazard, like a biosafety cabinet or a fume hood. Then administrative controls - rules, training, and procedures that change how people work. And only at the very bottom, as the last line of defence, is personal protective equipment, or PPE.

My Socratic question: most people think of gloves and lab coats as the front line of safety. Why does the hierarchy place PPE at the very bottom?

The answer is that PPE only protects the individual wearing it, and only if used perfectly - it fails if forgotten, torn, or removed. The higher controls protect everyone by removing or containing the hazard itself, before it ever reaches a person. PPE is the last resort, not the first.

Crucial insight: good safety works from the top of the hierarchy down. Ask first whether a hazard can be eliminated, substituted, or engineered away, and rely on PPE only for what remains. A laboratory that depends on gloves alone is a laboratory waiting for an accident.` },

    { q: "Personal Protective Equipment: your last line of defence.",
      body: `Though it sits at the bottom of the hierarchy, PPE is what you wear every day, and using it correctly is essential.

PPE is the protective clothing and equipment that shields you from hazards that could not be otherwise removed. The core items are: the laboratory coat, buttoned and worn over your clothes, protecting skin and clothing from splashes; gloves, protecting the hands from biological and chemical contact; eye protection - safety glasses or goggles - guarding against splashes to the eyes; and face protection or masks when there is a risk of aerosols or splashes to the face.

My Socratic question: PPE only works if used correctly. When, in the sequence of a task, must PPE go on, and what is the most dangerous moment in its use?

The answer is that PPE must be put on - donned - before you begin work with the hazard, and the most dangerous moment is taking it off - doffing - because contaminated gloves or a coat can spread the very material they caught. There is a correct order to remove PPE to avoid contaminating yourself, and hands must always be washed afterward.

Crucial insight: PPE is only as good as its use. Wearing it after exposure is useless; removing it carelessly spreads contamination; a torn glove offers no protection. Treat PPE as a discipline, not a costume - the right equipment, worn at the right time, removed in the right order, every single time.` },

    { q: "Biosafety levels: matching containment to danger.",
      body: `Not all biological hazards are equal, so laboratories are graded by how much containment they provide. This grading is the system of biosafety levels, and it is a favourite of examiners.

There are four biosafety levels, BSL-1 to BSL-4, rising with the danger of the agents handled. BSL-1 is for agents not known to cause disease in healthy adults, worked on an open bench with basic practices - a teaching lab. BSL-2 is for agents causing human disease that is rarely serious and usually treatable, such as much routine clinical work with blood and body fluids; it adds limited access, biohazard signs, sharps precautions, and a biosafety cabinet for aerosol-generating steps. BSL-3 is for serious or lethal agents that can spread by air, such as tuberculosis, requiring special ventilation and strict controls. BSL-4 is for the most dangerous agents - frequently fatal, with no treatment or vaccine, such as Ebola - requiring maximum containment, full-body suits, and the small number of specialised labs worldwide.

My Socratic question: most routine clinical laboratory work, handling everyday blood and urine samples, takes place at which level?

The answer is BSL-2, because clinical samples may contain bloodborne pathogens like HIV and hepatitis B - serious but treatable, transmitted by percutaneous or mucous-membrane exposure rather than air.

Crucial insight: the biosafety level rises with the danger of the agent, matching the strength of containment to the threat. Knowing that routine clinical work is BSL-2 tells you the daily precautions your career demands: gloves, coat, eye protection, sharps care, and a biosafety cabinet for anything that splashes or aerosolises.` },

    { q: "Universal precautions: the rule that keeps you alive.",
      body: `Here is perhaps the single most important safety principle in the clinical laboratory, and it flows from one hard truth: you cannot tell an infectious sample from a safe one by looking.

Universal precautions is the practice of treating every patient sample - all blood, body fluids, tissues and cells - as if it were infectious, regardless of the patient or the request. You never assume a sample is safe. Every tube of blood is handled as though it carries HIV, hepatitis B, and every other bloodborne pathogen.

My Socratic question: why treat a sample from an apparently healthy young patient with the same caution as one from a known HIV case?

The answer is that infection is invisible - a patient may be infected without knowing it, may be in a window period before tests turn positive, or the request may simply not mention it. If you only took precautions for samples labelled dangerous, you would be exposed by all the ones that were not labelled. Treating everything as infectious closes that gap entirely.

Crucial insight: universal precautions - sometimes extended as "standard precautions" - is the safety net that does not depend on knowing which samples are dangerous. It removes the fatal assumption of safety. This one principle, applied without exception, prevents the majority of laboratory-acquired infections, and it must become second nature.` },

    { q: "Sharps and the greatest daily danger.",
      body: `Among all the hazards, one causes more laboratory-acquired infections than any other, and it deserves its own focus: the sharp.

A sharp is any object that can pierce the skin - needles above all, but also lancets, blades, and broken glass. The danger is the needlestick injury: a contaminated needle piercing the skin injects pathogens directly into the bloodstream, bypassing every other defence. This is the classic route by which laboratory and healthcare workers acquire HIV and hepatitis B and C.

My Socratic question: a used needle must be made safe. Recapping it by hand seems tidy - why is it in fact one of the most dangerous things you can do?

The answer is that recapping brings your hand and the contaminated needle together, and most needlestick injuries happen exactly then, as the needle misses the cap and enters the hand. The rule is: never recap a needle by hand. Used sharps go immediately, uncapped, into a rigid, puncture-proof sharps container.

Crucial insight: sharps demand a specific discipline - never recap, never overfill the sharps bin, dispose immediately into the proper puncture-proof container, and never reach into it. Because the needlestick delivers infection past all your PPE straight into your blood, sharps safety is not one rule among many - it is the rule that most directly stands between you and a life-changing infection.` },

    { q: "When things go wrong: spills, exposures and emergencies.",
      body: `Even with perfect precautions, accidents happen, and knowing how to respond turns a crisis into a manageable event.

For a biological spill, the principle is contain and decontaminate: alert others, cover the spill to stop aerosols, and disinfect with an appropriate agent such as sodium hypochlorite (bleach) after allowing droplets to settle. For an exposure - a needlestick, or a splash to eyes or mucous membranes - immediate first aid comes first: wash the wound with soap and water, or flush the eyes at the eyewash station for many minutes, then report the incident at once so that post-exposure evaluation and, where needed, prophylaxis can begin quickly.

My Socratic question: after a needlestick from a patient sample, why does the speed of reporting matter so much - why not simply wash it and carry on?

The answer is that for some infections, such as HIV, post-exposure prophylaxis - preventive medication - is far more effective the sooner it is started, ideally within hours. Delaying to avoid embarrassment or paperwork can cost you that protection. Reporting is not blame; it is your own safety.

Crucial insight: every laboratory has defined emergency procedures - spill kits, eyewash stations, safety showers, fire extinguishers, and reporting systems - and knowing them before you need them is essential. In an emergency there is no time to learn; the response must already be known. First aid, then report, always and immediately.` },

    { q: "Waste, housekeeping and the culture of safety.",
      body: `Safety does not end when the test is done. What you do with waste, and how you keep your space, protects the next person and the world outside the laboratory.

Laboratory waste must be segregated by type: infectious or biohazardous waste - anything contaminated with blood or body fluids - goes into designated, often colour-coded biohazard bags and is decontaminated, typically by autoclaving, before disposal; sharps go into puncture-proof containers; chemical waste is collected separately according to its hazard. General housekeeping matters too: clean, uncluttered benches, no food or drink in the laboratory, no mouth-pipetting, tied-back hair, and closed shoes.

My Socratic question: why is the simple rule "no eating or drinking in the laboratory" a genuine safety measure and not mere fussiness?

The answer is that eating, drinking, or touching your face provides a direct route for pathogens and chemicals from contaminated surfaces or hands into your body by ingestion or mucous membrane. The rule closes an entire pathway of exposure.

Crucial insight: beyond any single rule, laboratory safety is ultimately a culture - a shared, constant attention to doing things the safe way, every time, because everyone's safety depends on it. Proper waste disposal protects colleagues, waste handlers, and the community; good housekeeping prevents accidents before they start. Safety is not a set of chores but a professional habit of mind that defines a good laboratory scientist.` },

    { q: "Consolidation and your final test.",
      body: `Your cognitive map for laboratory safety, in five lines.

The hazards: biological (infectious samples, the most feared), chemical, physical including sharps, electrical, and fire - identify the hazard before you can control it.

The hierarchy of controls: from most to least effective - elimination, substitution, engineering controls, administrative controls, and last of all PPE; good safety works from the top down.

The daily armour: PPE - lab coat, gloves, eye and face protection - donned before work, doffed carefully afterward, the last line of defence.

The core principles: biosafety levels (routine clinical work is BSL-2) match containment to danger; and universal precautions treat every sample as infectious, closing the fatal assumption of safety.

The greatest danger and the response: the needlestick injects infection past all defences, so never recap and dispose of sharps immediately; and when accidents happen, first aid then immediate reporting, especially for exposures where prophylaxis is time-critical.

Now your final test. A laboratory scientist is about to process a routine blood sample from a patient whose infection status is unknown. Midway, they suffer a needlestick injury from the used needle.

Question one: before the accident, what biosafety level and what overarching precaution principle should have governed how they handled this "routine" sample, and why?
Question two: identify the specific unsafe act most likely to have caused the needlestick, and state the rule that forbids it.
Question three: list, in order, the immediate steps the scientist should take after the injury, and explain why speed matters.

Work them through before reading on.

My answers. One: routine clinical blood work is handled at BSL-2, and under universal precautions the sample must be treated as infectious despite the unknown status - precisely because an unknown status could hide HIV or hepatitis, and assuming safety is the fatal error. Two: the most likely cause is recapping the needle by hand, which is forbidden by the rule never to recap - used sharps go straight, uncapped, into a puncture-proof container. Three: immediately wash the wound with soap and water, then report the incident at once so that post-exposure evaluation and, if indicated, prophylaxis can begin - speed matters because prophylaxis for infections like HIV is far more effective the sooner it starts, ideally within hours.

If those came cleanly, you have the foundation that keeps you alive and effective at the bench. Every technique you learn from here rests on this safety base.` },
  ],
  theory: [
    { q: "Define laboratory safety and explain why it is the foundation of laboratory work.", a: "Laboratory safety is the discipline of preventing harm to oneself, colleagues, patients and the environment while working with hazardous materials. It is foundational because the laboratory concentrates infectious, chemical, physical, electrical and fire hazards, and a scientist who is injured, infected or killed cannot help anyone - safety is the precondition for all good work." },
    { q: "List the main categories of laboratory hazards and identify the most characteristic one.", a: "Biological (infectious agents in samples), chemical (reagents, acids, solvents), physical (sharps, heat, moving equipment), electrical, fire (flammable solvents), and ergonomic hazards. The biological hazard - infection from patient samples - is the most characteristic and feared, because it is invisible, ever-present and potentially fatal." },
    { q: "State the hierarchy of controls in order and explain why PPE is placed last.", a: "From most to least effective: elimination, substitution, engineering controls, administrative controls, and personal protective equipment (PPE). PPE is last because it protects only the individual wearing it and only if used perfectly, whereas higher controls remove or contain the hazard itself before it reaches anyone." },
    { q: "Name the core items of PPE and their functions.", a: "The lab coat (protects skin and clothing from splashes), gloves (protect hands from biological and chemical contact), eye protection such as safety glasses or goggles (guard against eye splashes), and face protection or masks (against aerosols and facial splashes)." },
    { q: "Why is doffing (removing) PPE considered the most dangerous moment in its use?", a: "Because contaminated gloves or coat can spread the hazardous material they caught onto the wearer or surfaces. PPE must be removed in a correct order to avoid self-contamination, and hands must always be washed afterward." },
    { q: "Describe the four biosafety levels and which one covers routine clinical work.", a: "BSL-1: agents not causing disease in healthy adults, open bench (teaching labs). BSL-2: agents causing usually treatable human disease, adding limited access, sharps precautions and a biosafety cabinet - this covers routine clinical work with blood and body fluids. BSL-3: serious or lethal airborne agents like TB, needing special ventilation. BSL-4: frequently fatal agents with no treatment like Ebola, needing maximum containment." },
    { q: "Define universal precautions and explain the reasoning behind it.", a: "Universal precautions is the practice of treating every patient sample - all blood, body fluids and tissues - as if it were infectious, regardless of the patient. The reasoning is that infection is invisible: a patient may be infected unknowingly or be in a window period, so only by treating everything as infectious can the gap left by unlabelled dangerous samples be closed." },
    { q: "What is a needlestick injury and why is it so dangerous?", a: "A needlestick injury is the piercing of the skin by a contaminated needle or sharp, injecting pathogens directly into the bloodstream and bypassing all other defences including PPE. It is the classic route by which laboratory workers acquire HIV and hepatitis B and C, making it the single greatest cause of laboratory-acquired infections." },
    { q: "State the key rules for safe sharps handling.", a: "Never recap a needle by hand (most needlesticks occur during recapping); dispose of used sharps immediately and uncapped into a rigid, puncture-proof sharps container; never overfill the container; and never reach into it." },
    { q: "Outline the immediate response to a needlestick exposure and explain why speed matters.", a: "Immediately wash the wound with soap and water (or flush a splashed eye at the eyewash station), then report the incident at once so post-exposure evaluation and prophylaxis can begin. Speed matters because post-exposure prophylaxis, for example against HIV, is far more effective the sooner it is started, ideally within hours." },
  ],
  videos: [
    { channel: "Ninja Nerd / Microbiology", title: "Biosafety Levels BSL 1 to 4 Explained", note: "Clear overview of the four biosafety levels and what each requires.", url: "" },
    { channel: "Lab Safety", title: "Personal Protective Equipment PPE in the Laboratory", note: "How to don and doff PPE correctly and in the right order.", url: "" },
    { channel: "Microbiology", title: "Universal Standard Precautions and Sharps Safety", note: "Why every sample is treated as infectious, and safe needle handling.", url: "" },
  ],
  mcqs: [
    { q: "Laboratory safety is best described as the discipline of:", o: ["Making work slower", "Filing paperwork", "Preventing harm while working with hazardous materials", "Cleaning glassware"], a: 2, w: "Safety prevents harm to people and environment from lab hazards." },
    { q: "The most characteristic and feared hazard of the medical laboratory is the:", o: ["Biological hazard", "Ergonomic hazard", "Noise hazard", "Lighting hazard"], a: 0, w: "Infection from patient samples is invisible, ever-present and potentially fatal." },
    { q: "Needles, broken glass and blades are examples of:", o: ["Sharps (physical hazards)", "Chemical hazards", "Electrical hazards", "Biological agents"], a: 0, w: "Sharps are physical hazards that can pierce the skin." },
    { q: "In the hierarchy of controls, the MOST effective measure is:", o: ["PPE", "Administrative controls", "Warning signs", "Elimination of the hazard"], a: 3, w: "Removing the hazard entirely is the most effective control." },
    { q: "In the hierarchy of controls, the LEAST effective measure is:", o: ["Engineering controls", "Elimination", "Substitution", "Personal protective equipment"], a: 3, w: "PPE protects only the individual and only if used perfectly." },
    { q: "A biosafety cabinet or fume hood is an example of a(n):", o: ["Administrative control", "PPE", "Engineering control", "Elimination"], a: 2, w: "Physical devices that contain hazards are engineering controls." },
    { q: "Replacing a toxic stain with a safer one is an example of:", o: ["Elimination", "Administrative control", "PPE", "Substitution"], a: 3, w: "Substitution swaps a dangerous material for a safer one." },
    { q: "PPE is placed at the bottom of the hierarchy because it:", o: ["Is uncomfortable", "Protects only the wearer and only if used perfectly", "Is optional", "Is expensive"], a: 1, w: "Higher controls remove or contain the hazard for everyone." },
    { q: "The core items of PPE include all EXCEPT:", o: ["Gloves", "A mobile phone", "Eye protection", "Lab coat"], a: 1, w: "Lab coat, gloves and eye protection are PPE; a phone is not." },
    { q: "PPE should be put on (donned):", o: ["Before beginning work with the hazard", "After exposure", "Only if a splash occurs", "At the end of the day"], a: 0, w: "PPE must be worn before contact with the hazard to protect you." },
    { q: "The most dangerous moment in PPE use is:", o: ["Storing it", "Taking it off (doffing)", "Putting it on", "Buying it"], a: 1, w: "Removing contaminated PPE can spread the material if done carelessly." },
    { q: "There are how many biosafety levels?", o: ["Two", "Six", "Four", "Ten"], a: 2, w: "Biosafety levels run from BSL-1 to BSL-4." },
    { q: "Biosafety levels rise with:", o: ["The danger of the agents handled", "The age of the equipment", "The number of staff", "The size of the lab"], a: 0, w: "Higher BSL means more dangerous agents and more containment." },
    { q: "Routine clinical work with blood and body fluids is done at:", o: ["BSL-4", "BSL-3", "BSL-1", "BSL-2"], a: 3, w: "Clinical samples may carry bloodborne pathogens, requiring BSL-2." },
    { q: "An open-bench teaching lab with harmless agents is:", o: ["BSL-1", "BSL-3", "BSL-4", "BSL-2"], a: 0, w: "BSL-1 handles agents not known to cause disease in healthy adults." },
    { q: "Airborne lethal agents like tuberculosis require at least:", o: ["BSL-1", "None", "BSL-3", "BSL-2"], a: 2, w: "BSL-3 is for serious airborne agents needing special ventilation." },
    { q: "The highest containment, for agents like Ebola, is:", o: ["BSL-4", "BSL-3", "BSL-2", "BSL-5"], a: 0, w: "BSL-4 is maximum containment for frequently fatal, untreatable agents." },
    { q: "Universal precautions means treating every sample as:", o: ["Chemical waste", "Safe unless labelled", "Infectious regardless of the patient", "Requiring no gloves"], a: 2, w: "All samples are handled as potentially infectious." },
    { q: "The reasoning behind universal precautions is that:", o: ["Labels are always wrong", "It saves money", "All patients are sick", "Infection is invisible and samples may be unknowingly infectious"], a: 3, w: "You cannot tell an infectious sample by looking, so treat all as infectious." },
    { q: "A contaminated needle piercing the skin is a:", o: ["Chemical burn", "Splash exposure", "Spill", "Needlestick injury"], a: 3, w: "A needlestick injects pathogens directly into the bloodstream." },
    { q: "Needlestick injuries are dangerous because they:", o: ["Damage the needle", "Inject pathogens past all other defences into the blood", "Are always harmless", "Cause only minor pain"], a: 1, w: "They bypass PPE and deliver infection straight into the bloodstream." },
    { q: "The rule about recapping used needles by hand is:", o: ["Never recap by hand", "Always recap tightly", "Recap twice", "Recap only if busy"], a: 0, w: "Most needlesticks happen during hand recapping - never do it." },
    { q: "Used sharps should be disposed of into a:", o: ["Rigid, puncture-proof sharps container", "Sink", "Normal bin", "Biohazard bag"], a: 0, w: "Sharps go immediately, uncapped, into a puncture-proof container." },
    { q: "The first action after a needlestick injury is to:", o: ["Recap the needle", "Wash the wound with soap and water", "Go home", "Finish the test"], a: 1, w: "Immediate first aid - washing the wound - comes first." },
    { q: "After first aid for a needlestick, the scientist must:", o: ["Say nothing", "Continue working", "Report the incident immediately", "Wait a week"], a: 2, w: "Prompt reporting enables timely post-exposure evaluation and prophylaxis." },
    { q: "Speed of reporting an exposure matters because:", o: ["It is a formality", "Post-exposure prophylaxis is more effective the sooner it starts", "The lab closes", "Paperwork closes early"], a: 1, w: "Prophylaxis, e.g. for HIV, works best started within hours." },
    { q: "A recommended disinfectant for a biological spill is:", o: ["Plain water", "Cooking oil", "Sodium hypochlorite (bleach)", "Alcohol only"], a: 2, w: "Bleach is an appropriate agent to decontaminate biological spills." },
    { q: "Infectious (biohazardous) waste is typically decontaminated by:", o: ["Freezing", "Autoclaving", "Air drying", "Burying raw"], a: 1, w: "Autoclaving decontaminates biohazardous waste before disposal." },
    { q: "Eating and drinking are forbidden in the laboratory because they:", o: ["Distract others", "Provide a route for pathogens and chemicals to enter the body", "Are messy", "Waste time"], a: 1, w: "Ingestion is a direct exposure pathway the rule closes." },
    { q: "Ultimately, laboratory safety is best understood as:", o: ["Only the supervisor's job", "A one-time training", "A set of forms", "A constant shared culture of working safely"], a: 3, w: "Safety is an ongoing professional habit shared by everyone." },
  ],
};

/* --------------------------- phy:1 --------------------------- */
const T_PHY_HOMEO = {
  courseId: "phy",
  topicIndex: 1,
  title: "Homeostasis",
  minutes: 18,
  note: [
    { q: "The one idea that unifies all of physiology.",
      body: `In General Physiology you met the body as a system of cooperating parts. Now we meet the single principle that ties every one of those parts together - the idea a great physiologist called the central concept of the whole subject: homeostasis.

My Socratic question: your body temperature stays near 37 degrees whether you are in the hot sun or a cold room; your blood glucose stays controlled whether you have just eaten or fasted all day. How does the body hold its internal conditions steady while the outside world changes wildly?

The answer is homeostasis - and it does not happen by accident but by constant, active regulation. Homeostasis is the maintenance of a relatively stable internal environment despite changes in the external environment. The key word is relatively - conditions are not frozen rigidly, but held fluctuating within a narrow normal range around a target value.

Crucial insight: homeostasis is arguably the most important concept in physiology, because every organ system exists, in part, to help maintain it. The lungs, kidneys, heart, and hormones all work to keep the internal environment stable, because our cells - recall from the water and pH topic - can only function within narrow limits of temperature, pH, glucose and more. Understand homeostasis and you have the thread that runs through every topic in the course.` },

    { q: "The internal environment and why it must be defended.",
      body: `To grasp homeostasis, you must first appreciate what is being kept stable: the internal environment.

Your cells do not touch the outside world. They are bathed in extracellular fluid - the internal environment - and it is the conditions of this fluid that must be kept constant: its temperature, its pH, its glucose concentration, its ion levels, its oxygen and carbon dioxide.

My Socratic question: why can the body tolerate large swings in the outside world but not in this internal fluid?

The answer returns to your biochemistry. Cells run on enzymes, and enzymes work only within narrow ranges of temperature and pH; too hot, too cold, too acidic, and they fail. The internal environment is where the cells actually live, so it is that environment - not the outside world - that must be held stable for life to continue. The body buffers its cells from the chaos outside by keeping their immediate surroundings constant.

Crucial insight: homeostasis is fundamentally about protecting the cells by controlling the fluid around them. Every homeostatic mechanism you will study - temperature regulation, blood glucose control, acid-base balance, fluid balance - is defending some property of this internal environment so that the cells within it can keep working. This is the why behind the whole topic.` },

    { q: "The set point and the normal range.",
      body: `Homeostasis works by holding each variable near a target, and two precise terms describe this.

The set point is the ideal target value for a physiological variable - for example, a body temperature set point of about 37 degrees Celsius. The normal range is the narrow band around the set point within which the variable is allowed to fluctuate - a few tenths of a degree either side of 37.

My Socratic question: if the body has a fixed set point, why does it allow any fluctuation at all - why a range rather than a single exact value?

The answer is that perfect constancy is impossible and unnecessary; conditions naturally drift slightly with activity, meals and time of day. What matters is that the variable is kept close - within the normal range - and pulled back whenever it strays too far. Homeostasis is dynamic, a constant small correcting, not a rigid freezing.

Crucial insight: think of the set point as the target and the normal range as the acceptable zone around it. The body's job is to detect when a variable leaves that zone and act to bring it back. This immediately raises the question of how the body detects and corrects such deviations - which is the machinery of the feedback loop, the heart of homeostasis.` },

    { q: "The three components of every control system.",
      body: `Every homeostatic mechanism in the body, without exception, is built from the same three components. Learn this trio once and you can analyse any regulatory system you meet.

The receptor, also called the sensor, detects changes in the variable - it monitors the condition and reports any deviation. The control centre, also called the integrating centre, receives the information, compares it to the set point, and decides on the response. The effector carries out the response, producing the change that corrects the deviation.

My Socratic question: information must flow through these three in a particular direction. Trace the path a signal takes from a detected change to a correction.

The answer: the receptor detects the change and sends the information to the control centre; the control centre compares it to the set point and, if needed, sends a command to the effector; the effector acts to reverse the change. Receptor to control centre to effector - detect, decide, do.

Crucial insight: this three-part structure - receptor, control centre, effector - is the universal blueprint of physiological regulation. Whenever you study the control of temperature, glucose, blood pressure or anything else, identify these three parts and the mechanism becomes clear. The nervous and endocrine systems provide the communication that links them.` },

    { q: "Negative feedback: the master mechanism.",
      body: `Now we reach the single most important mechanism in physiology, the one that carries out the vast majority of homeostatic control: negative feedback.

Negative feedback is a mechanism in which a deviation from the set point triggers a response that reverses the deviation, returning the variable toward normal. The word negative means opposing - the response opposes and cancels the original change.

My Socratic question: a variable rises above its set point; negative feedback brings it back down. A variable falls below; negative feedback pushes it back up. Why does this opposing action produce stability?

The answer is that any response which always opposes the change automatically holds the variable near its set point - if it rises, it is lowered; if it falls, it is raised. The system self-corrects in both directions, so the variable oscillates gently around the target rather than drifting away. This is exactly how a thermostat holds a room's temperature.

Crucial insight: negative feedback is the master mechanism of homeostasis, operating throughout the body at all times. The overwhelming majority of the body's control systems are negative feedback loops - temperature, glucose, blood pressure, ion levels, and more. Grasp this one principle deeply and most of physiology's regulation falls into place. It is the mechanism behind stability itself.` },

    { q: "A worked example: temperature regulation.",
      body: `Let us run negative feedback through a real, examinable example so the abstract structure becomes concrete: the control of body temperature, or thermoregulation.

Suppose you exercise and your body temperature rises above the 37-degree set point. The receptors - thermoreceptors in the skin and, crucially, in the hypothalamus - detect the rise. They report to the control centre, the hypothalamus, which compares the temperature to the set point and finds it too high. The hypothalamus activates effectors: the sweat glands begin to sweat, cooling the body by evaporation, and blood vessels in the skin dilate (vasodilation), releasing heat. Temperature falls back toward 37.

My Socratic question: now imagine you step into the cold and your temperature drops below set point. Predict the effectors the hypothalamus will activate, and their effect.

The answer: the hypothalamus activates different effectors to raise temperature - shivering, the rapid contraction of skeletal muscles, generates heat, and vasoconstriction narrows skin blood vessels to conserve heat. Temperature rises back toward 37.

Crucial insight: notice the same three-part loop and the same opposing logic in both directions - too hot triggers cooling, too cold triggers warming, always returning to set point. The hypothalamus is the body's thermostat. This one example is the template for every negative feedback system, so learn it thoroughly; blood glucose control by insulin and glucagon works in exactly the same way.` },

    { q: "Positive feedback: the useful exception.",
      body: `Almost all homeostatic control is negative feedback, but the body uses a second, opposite mechanism for special situations: positive feedback.

Positive feedback is a mechanism in which a deviation triggers a response that amplifies the deviation, pushing the variable further from where it started, rather than reversing it. Instead of opposing the change, the response enhances it.

My Socratic question: if positive feedback pushes a variable further from normal - the opposite of stability - why would the body ever use something so seemingly dangerous?

The answer is that positive feedback is used to drive a process rapidly to completion, when an all-or-nothing event is needed. The classic example is childbirth: contractions push the baby against the cervix, stretch receptors trigger release of oxytocin, which causes stronger contractions, which stretch the cervix more - an escalating cycle that intensifies until delivery, then stops. Blood clotting is another example, where each step accelerates the next until the clot is complete.

Crucial insight: positive feedback is the useful exception - rare, self-limiting, and reserved for processes that must be pushed decisively to an endpoint, such as childbirth, clotting, and the nerve action potential. It is not used for maintaining steady states, because it destabilises rather than stabilises. Knowing the difference - negative feedback maintains, positive feedback amplifies - is a classic exam distinction.` },

    { q: "When homeostasis fails: the basis of disease.",
      body: `Understanding homeostasis is not merely academic - it is the key to understanding illness itself, which makes it central to your future work in the laboratory.

My Socratic question: if the body's whole design is to maintain homeostasis, what, in a fundamental sense, is disease?

The answer is that many diseases are, at their core, a failure of homeostasis - the body losing its ability to keep a variable within its normal range. In diabetes mellitus, the glucose control loop fails and blood glucose rises out of range. In fever, the hypothalamic set point itself is reset higher by infection. In dehydration, fluid balance is disrupted. In each case, a homeostatic mechanism has been overwhelmed or broken.

This is precisely why laboratory tests exist and why your career matters. When you measure a patient's blood glucose, electrolytes, pH, or hormone levels, you are measuring whether their homeostatic mechanisms are holding the internal environment within its normal range. A result outside the reference range is a signal that homeostasis is failing somewhere.

Crucial insight: homeostasis links directly to your profession. The reference ranges on every laboratory report are the normal ranges of homeostasis; a value outside them flags a homeostatic failure and points toward diagnosis. Understanding this concept turns a list of test values into a picture of what is going wrong in the patient's body.` },

    { q: "Nervous and endocrine control: fast and slow.",
      body: `The feedback loops of homeostasis need communication to link receptor, control centre and effector, and the body has two great communication systems for this, differing in speed.

The nervous system provides fast control. It uses electrical impulses and neurotransmitters, acting in milliseconds, for rapid responses - like the near-instant adjustments of heart rate or the reflexes that protect you. Its effects are quick but generally short-lived. The endocrine system provides slow control. It uses hormones carried in the blood, acting over seconds to hours or longer, for sustained regulation - like the control of blood glucose, metabolism, and growth. Its effects are slower to start but longer-lasting.

My Socratic question: why is it an advantage for the body to have both a fast and a slow control system rather than just one?

The answer is that different homeostatic challenges need different timescales - a sudden drop in blood pressure needs correction in seconds (nervous), while keeping blood glucose steady across a day needs sustained adjustment (endocrine). Having both gives the body both rapid reflexes and enduring regulation.

Crucial insight: the nervous system is fast and brief, the endocrine system is slow and sustained, and together they run the body's homeostatic loops across every timescale. Many systems, like the hypothalamus, bridge both. As you study each organ system later, you will see these two communication networks carrying out the feedback control that keeps the internal environment stable.` },

    { q: "Consolidation and your final test.",
      body: `Your cognitive map for homeostasis, in five lines.

The concept: homeostasis is the maintenance of a relatively stable internal environment despite external change - the central principle of physiology, because cells (and their enzymes) survive only within narrow limits.

The target: each variable has a set point and a narrow normal range around it; homeostasis is dynamic correction, not rigid constancy.

The machinery: every control system has three parts - receptor (detects), control centre (compares to set point and decides), effector (acts to correct).

The master mechanism: negative feedback reverses any deviation, returning the variable to set point - the basis of nearly all regulation, as in temperature control by the hypothalamus. Positive feedback, the rare exception, amplifies a change to drive a process to completion, as in childbirth and clotting.

The relevance: disease is often a failure of homeostasis, and laboratory reference ranges are the normal ranges of homeostasis - a value outside them flags where regulation is breaking down; the nervous system (fast) and endocrine system (slow) provide the communication that runs the loops.

Now your final test. A patient with type 1 diabetes has a very high blood glucose because they produce no insulin.

Question one: name the three components of the blood glucose homeostatic loop that normally lowers glucose after a meal, and identify which is failing in this patient.
Question two: is the normal glucose-lowering mechanism an example of negative or positive feedback, and why?
Question three: explain how this patient's condition illustrates the general principle that links homeostasis, disease, and laboratory testing.

Work them through before reading on.

My answers. One: the receptors are the glucose-sensing beta cells of the pancreas, the control centre is also the pancreas comparing glucose to its set point, and the effector response is the release of insulin, which drives glucose into cells and lowers it; in type 1 diabetes the effector step fails, because the beta cells produce no insulin. Two: it is negative feedback, because a rise in glucose triggers a response - insulin - that opposes and reverses the rise, returning glucose toward set point. Three: the patient's disease is fundamentally a failure of the glucose homeostatic loop; their blood glucose leaves its normal range, and it is precisely by measuring that glucose in the laboratory and finding it above the reference range that the homeostatic failure is detected and the diagnosis made - homeostasis, disease and lab testing joined in one case.

If those came cleanly, you hold the thread that runs through the entire course. Every organ system you study from here is, in part, a homeostatic mechanism defending the internal environment.` },
  ],
  theory: [
    { q: "Define homeostasis and explain the significance of the word 'relatively'.", a: "Homeostasis is the maintenance of a relatively stable internal environment despite changes in the external environment. 'Relatively' is significant because conditions are not held perfectly constant but are allowed to fluctuate within a narrow normal range around a set point - homeostasis is dynamic correction, not rigid constancy." },
    { q: "What is the internal environment, and why must it be kept stable?", a: "The internal environment is the extracellular fluid that bathes the body's cells. It must be kept stable because cells run on enzymes that function only within narrow ranges of temperature, pH, and other conditions; keeping the fluid around the cells constant protects them from the changing external world." },
    { q: "Distinguish the set point from the normal range.", a: "The set point is the ideal target value for a physiological variable (for example, about 37 degrees Celsius for body temperature). The normal range is the narrow band around the set point within which the variable is allowed to fluctuate." },
    { q: "Name the three components of a homeostatic control system and state each one's role.", a: "The receptor (sensor) detects changes in the variable and reports them; the control centre (integrating centre) compares the value to the set point and decides on a response; the effector carries out the response that corrects the deviation." },
    { q: "Define negative feedback and explain why it produces stability.", a: "Negative feedback is a mechanism in which a deviation from the set point triggers a response that reverses the deviation, returning the variable toward normal. It produces stability because the response always opposes the change - raising the variable if it falls and lowering it if it rises - so the variable is continually pulled back toward the set point." },
    { q: "Using body temperature, describe the negative feedback response to overheating.", a: "When body temperature rises above set point, thermoreceptors in the skin and hypothalamus detect the rise and report to the control centre, the hypothalamus. It activates effectors: sweat glands produce sweat that cools by evaporation, and skin blood vessels dilate (vasodilation) to release heat, returning temperature toward 37 degrees." },
    { q: "Define positive feedback and give one physiological example.", a: "Positive feedback is a mechanism in which a deviation triggers a response that amplifies the deviation, pushing the variable further from its starting point. An example is childbirth: contractions stretch the cervix, triggering oxytocin release, which strengthens contractions in an escalating cycle until delivery. Blood clotting is another example." },
    { q: "Contrast the roles of negative and positive feedback in the body.", a: "Negative feedback maintains stability by reversing deviations and is used for nearly all homeostatic control. Positive feedback amplifies a change to drive a process rapidly to completion and is a rare, self-limiting exception used for events like childbirth, blood clotting and the nerve action potential." },
    { q: "Explain how disease relates to homeostasis, using an example.", a: "Many diseases are fundamentally a failure of homeostasis - the loss of the body's ability to keep a variable within its normal range. For example, in diabetes mellitus the blood glucose control loop fails and glucose rises out of range. Laboratory reference ranges are the normal ranges of homeostasis, so a value outside them flags a homeostatic failure." },
    { q: "Compare the nervous and endocrine systems as homeostatic control systems.", a: "The nervous system gives fast control using electrical impulses and neurotransmitters, acting in milliseconds with brief effects (e.g. heart rate reflexes). The endocrine system gives slow control using hormones in the blood, acting over seconds to hours with sustained effects (e.g. blood glucose regulation). Together they run the body's feedback loops across all timescales." },
  ],
  videos: [
    { channel: "Physiology", title: "Homeostasis and Negative Feedback Loops Explained", note: "The core concept, set point, and the receptor-control centre-effector loop.", url: "" },
    { channel: "Physiology", title: "Negative vs Positive Feedback Physiology", note: "Clear contrast of the two feedback types with childbirth and temperature examples.", url: "" },
    { channel: "Physiology", title: "Thermoregulation Negative Feedback Hypothalamus", note: "Body temperature control worked through as a full feedback loop.", url: "" },
  ],
  mcqs: [
    { q: "Homeostasis is best defined as the maintenance of a:", o: ["Stable external environment", "Relatively stable internal environment despite external change", "Changing internal environment", "Perfectly constant internal state"], a: 1, w: "Homeostasis keeps the internal environment relatively stable as the outside changes." },
    { q: "The word 'relatively' in the definition of homeostasis means conditions are:", o: ["Allowed to swing widely", "Held fluctuating within a narrow normal range", "Frozen exactly", "Never controlled"], a: 1, w: "Variables fluctuate within a narrow range, not held perfectly fixed." },
    { q: "The internal environment that homeostasis protects is the:", o: ["Extracellular fluid bathing the cells", "Outside air", "Cell nucleus", "Bloodstream only"], a: 0, w: "Cells live in extracellular fluid, whose conditions must stay stable." },
    { q: "The internal environment must be kept stable chiefly because:", o: ["The skin requires it", "Enzymes and cells work only within narrow limits", "It looks better", "Bones need it"], a: 1, w: "Cells depend on enzymes that function only within narrow ranges." },
    { q: "The ideal target value for a physiological variable is the:", o: ["Set point", "Normal range", "Effector", "Receptor"], a: 0, w: "The set point is the target value, e.g. 37 degrees for temperature." },
    { q: "The narrow band around the target within which a variable may fluctuate is the:", o: ["Stimulus", "Feedback loop", "Normal range", "Set point"], a: 2, w: "The normal range is the acceptable zone around the set point." },
    { q: "The component that detects a change in a variable is the:", o: ["Set point", "Control centre", "Receptor (sensor)", "Effector"], a: 2, w: "The receptor or sensor detects and reports changes." },
    { q: "The component that compares a value to the set point and decides the response is the:", o: ["Effector", "Receptor", "Stimulus", "Control centre"], a: 3, w: "The control centre integrates information and decides the response." },
    { q: "The component that carries out the corrective response is the:", o: ["Receptor", "Effector", "Control centre", "Sensor"], a: 1, w: "The effector produces the change that corrects the deviation." },
    { q: "The correct direction of information flow in a feedback loop is:", o: ["Receptor to control centre to effector", "Effector to control centre to receptor", "Effector to receptor to control centre", "Control centre to receptor to effector"], a: 0, w: "Detect, decide, do: receptor to control centre to effector." },
    { q: "Negative feedback responds to a deviation by:", o: ["Reversing it toward the set point", "Ignoring it", "Removing the set point", "Amplifying it"], a: 0, w: "Negative feedback opposes and reverses the deviation." },
    { q: "Negative feedback produces stability because the response:", o: ["Is random", "Always enhances the change", "Stops all change", "Always opposes the change"], a: 3, w: "Opposing the change in both directions holds the variable near set point." },
    { q: "Most homeostatic control in the body is carried out by:", o: ["No feedback", "Negative feedback", "Feedforward only", "Positive feedback"], a: 1, w: "Negative feedback is the master mechanism of homeostasis." },
    { q: "When body temperature rises, the hypothalamus activates effectors that cause:", o: ["Sweating and vasodilation", "Shivering and vasoconstriction", "No response", "More heat production"], a: 0, w: "Sweating and vasodilation cool the body back toward set point." },
    { q: "When body temperature falls, the effectors activated include:", o: ["Shivering and vasoconstriction", "Panting", "Vasodilation", "Sweating"], a: 0, w: "Shivering generates heat and vasoconstriction conserves it." },
    { q: "The control centre for body temperature is the:", o: ["Skin", "Hypothalamus", "Liver", "Heart"], a: 1, w: "The hypothalamus acts as the body's thermostat." },
    { q: "Positive feedback responds to a deviation by:", o: ["Reversing it", "Amplifying it further from the start", "Holding it steady", "Ignoring it"], a: 1, w: "Positive feedback enhances the change, pushing it further." },
    { q: "A classic physiological example of positive feedback is:", o: ["Blood glucose control", "Blood pressure control", "Childbirth (labour)", "Temperature control"], a: 2, w: "Childbirth uses an escalating oxytocin cycle - positive feedback." },
    { q: "Positive feedback is used by the body to:", o: ["Prevent all change", "Maintain steady states", "Cool the body", "Drive a process rapidly to completion"], a: 3, w: "It pushes all-or-nothing events like childbirth and clotting to an endpoint." },
    { q: "Which pairing is correct?", o: ["Negative feedback amplifies; positive feedback maintains", "Both maintain steady states", "Negative feedback maintains; positive feedback amplifies", "Both amplify deviations"], a: 2, w: "Negative feedback maintains stability; positive feedback amplifies." },
    { q: "Many diseases can be understood fundamentally as a:", o: ["Set point with no range", "Type of positive feedback", "Normal variation", "Failure of homeostasis"], a: 3, w: "Disease often reflects loss of homeostatic control of a variable." },
    { q: "In diabetes mellitus, the homeostatic variable that goes out of range is:", o: ["Body temperature", "Blood pH only", "Heart rate", "Blood glucose"], a: 3, w: "Diabetes is a failure of blood glucose homeostasis." },
    { q: "Laboratory reference ranges correspond to the:", o: ["Positive feedback loops", "Effector responses", "Set points only", "Normal ranges of homeostasis"], a: 3, w: "A value outside the reference range flags a homeostatic failure." },
    { q: "A blood result outside the reference range suggests that:", o: ["A homeostatic mechanism may be failing", "The lab erred always", "Nothing is wrong", "The patient is healthy"], a: 0, w: "Out-of-range values point to where regulation is breaking down." },
    { q: "The nervous system provides control that is:", o: ["Hormonal", "Permanent", "Fast and brief", "Slow and sustained"], a: 2, w: "Nervous control uses electrical impulses - fast and short-lived." },
    { q: "The endocrine system provides control that is:", o: ["Electrical", "Instant", "Slow and sustained", "Fast and brief"], a: 2, w: "Endocrine control uses hormones - slower to start, longer-lasting." },
    { q: "The nervous system communicates chiefly using:", o: ["Bile", "Electrical impulses and neurotransmitters", "Hormones in blood", "Enzymes"], a: 1, w: "Nerves use electrical impulses and neurotransmitters." },
    { q: "The endocrine system communicates chiefly using:", o: ["Hormones carried in the blood", "Light", "Nerve impulses", "Sweat"], a: 0, w: "Endocrine signalling uses blood-borne hormones." },
    { q: "The body benefits from having both nervous and endocrine control because:", o: ["One is useless", "Neither works alone", "They are identical", "Different challenges need different timescales"], a: 3, w: "Fast reflexes and sustained regulation cover all timescales." },
    { q: "The single principle described as the central concept of physiology is:", o: ["Digestion", "Respiration", "Homeostasis", "Circulation"], a: 2, w: "Homeostasis unifies all of physiology - every system helps maintain it." },
  ],
};

/* --------------------------- lab:1 --------------------------- */
const T_LAB_ELECTRICAL = {
  courseId: "lab",
  topicIndex: 2,
  title: "Lab Electricals and Safety",
  minutes: 16,
  note: [
    { q: "Why does electrical safety deserve its own topic?",
      body: `You have learned the broad hazards of the laboratory. Now we focus on one that is easy to overlook precisely because it is so familiar: electricity. Nearly every instrument you will use - the centrifuge, the spectrophotometer, the incubator, the analyser - runs on mains electricity, and electricity handled carelessly can injure or kill.

My Socratic question: a centrifuge and a kettle both plug into the same wall socket. Why is the laboratory a setting where electrical danger is actually higher than in an ordinary home?

The answer is the combination of factors unique to the lab: many powered instruments packed together, the frequent presence of water and conductive liquids, wet hands, flammable solvents near electrical sparks, and equipment running for long hours. Each of these raises the risk of electric shock, burns, or fire beyond that of a normal room.

Crucial insight: electrical safety is the set of practices that prevent electric shock, burns and electrical fires when working with powered equipment. It matters because electricity is invisible, silent, and instantly dangerous - and because the laboratory concentrates the exact conditions that make it more hazardous. Respecting electricity is not optional caution; it is a core professional discipline for anyone who works with instruments.` },

    { q: "How electricity harms the body.",
      body: `To respect a hazard you must understand how it injures. Electricity harms the body in several distinct ways.

The first is electric shock: current passing through the body disrupts the nerves and muscles. A large enough current across the chest can stop the heart - causing cardiac arrest - or paralyse the muscles of breathing. The second is burns: electricity generates heat as it passes through tissue or arcs across a gap, causing deep burns that may be far worse than they look on the surface. The third is the indirect injury: a shock may cause a fall, or a startle that leads to dropping hazardous material.

My Socratic question: two things determine how dangerous a shock is - how much current flows, and what path it takes. Why is the path through the body so critical?

The answer is that a current passing across the chest, through the heart, is far more dangerous than one passing through a single finger, because it can disrupt the heart's rhythm. This is why a shock from one hand to the other, or hand to foot - crossing the body - is especially deadly.

Crucial insight: it is the current, not the voltage alone, that harms, and the path it takes through the body determines the danger. Even ordinary mains electricity is enough to be fatal if the current crosses the heart. This is why the safety measures that follow all aim to stop current from ever flowing through you.` },

    { q: "Earthing (grounding): the invisible safeguard.",
      body: `The single most important protective feature built into laboratory equipment is one you never see working: earthing, also called grounding.

Most laboratory instruments have a metal casing. Earthing connects that metal casing, through the third pin of the plug, to the ground. Normally no current flows through this earth wire.

My Socratic question: if the earth wire normally carries no current, what is it for - why include a wire that does nothing?

The answer is that it is a safety escape route for fault conditions. If a live wire inside the instrument comes loose and touches the metal casing, the casing would become live and electrocute anyone who touched it. The earth wire gives that fault current a safe path straight to ground instead of through a person, and the sudden surge blows the fuse or trips the breaker, cutting the power. The earth wire does nothing - until the day it saves your life.

Crucial insight: earthing protects you from faults you cannot see inside the equipment. This is why you must never defeat the earth connection - never remove the third pin, never use an adapter that bypasses it, never use equipment with a damaged earth. A missing earth is an invisible time bomb: everything works normally until a fault makes the casing live with nothing to protect you.` },

    { q: "Fuses, circuit breakers and the RCD.",
      body: `Beyond earthing, several devices stand guard on the electrical supply, each cutting the power when something goes wrong.

A fuse is a deliberate weak link - a thin wire that melts and breaks the circuit if too much current flows, stopping overheating and fire. A circuit breaker does the same job but is a switch that trips and can be reset rather than replaced. Most important for personal safety is the residual current device, or RCD, sometimes called a ground fault interrupter. It constantly compares the current flowing out to the current flowing back; if even a small amount goes missing - because it is leaking through a person to earth - the RCD cuts the power in a fraction of a second.

My Socratic question: a fuse protects against a large fault current, but why is the RCD the device that most directly protects your life?

The answer is that the small current that flows through a person to earth during a shock may be far too small to blow a fuse but is still enough to kill; the RCD detects that tiny imbalance and disconnects fast enough to prevent a fatal shock. It protects the person, not just the equipment.

Crucial insight: fuses and breakers mainly protect equipment and prevent fires by cutting large currents; the RCD protects the human by detecting the small leakage current of a shock. Knowing which device does what tells you why a laboratory socket circuit should be RCD-protected, and why you should never bypass or ignore a device that keeps tripping - it is trying to tell you something is wrong.` },

    { q: "Safe practice: the everyday rules.",
      body: `Understanding the mechanisms leads directly to the practical rules you follow every day at the bench.

Keep electricity and water apart: never handle plugs, switches or equipment with wet hands, and keep liquids away from sockets and the tops of instruments. Inspect before use: check that cables are not frayed, plugs not cracked, and casings not damaged, and never use equipment that is faulty - report it and take it out of service. Do not overload sockets: avoid daisy-chaining many adapters into one outlet, which can overheat and cause fire. Handle by the plug: pull a plug out by its body, never by yanking the cable, which damages the wire. Keep cables safe: route them so they are not trip hazards, not trapped, and not run across wet areas.

My Socratic question: an instrument gives you a small tingle when you touch its casing. What does this tell you, and what must you do?

The answer is that a tingle means current is leaking to the casing - a fault, and a warning of possible electrocution. You must stop using it immediately, switch off and unplug it at the wall, label it as faulty, and report it. A tingle is never normal and never to be ignored.

Crucial insight: most electrical accidents come not from mysterious failures but from ignoring simple rules - wet hands, damaged cables, overloaded sockets, faulty equipment left in use. The everyday discipline of inspecting, keeping dry, not overloading, and removing faulty equipment prevents the great majority of electrical injuries before they can happen.` },

    { q: "When electricity meets the other hazards.",
      body: `Electricity in the laboratory is especially dangerous because it does not act alone - it combines with the other hazards you have learned, multiplying the danger.

Electricity plus flammable solvents equals fire and explosion: an electrical spark - from a switch, a motor, or static - can ignite the vapour of a flammable solvent like ether or alcohol, so such solvents must be kept away from electrical equipment and sparks. Electricity plus water equals shock: spilled liquid reaching a socket or a live instrument creates a shock path, which is why spills near equipment must be dealt with immediately and carefully, with the power off. Electricity plus heat equals burns and fire: overloaded or faulty wiring overheats, and hot instruments can start fires if flammable material is nearby.

My Socratic question: you need to clean up a liquid spill that has run underneath a plugged-in instrument. What is the first thing you must do, and why?

The answer is that you must switch off and unplug the instrument at the wall first, before touching the spill - because the liquid may have created a live path, and reaching into it while the power is on risks electrocution. Isolate the electricity before dealing with the liquid.

Crucial insight: the real danger of electricity in the laboratory lies in its combination with solvents, water and heat. Thinking about these interactions - keeping sparks from vapours, power off before touching spills, not overloading circuits near heat - is what separates a safe laboratory scientist from one who treats each hazard in isolation and is caught out by their combination.` },

    { q: "Responding to an electrical accident.",
      body: `Despite precautions, someone may suffer an electric shock, and your response in those first seconds can save a life - or cost your own if done wrongly.

My Socratic question: you see a colleague collapsed and still gripping a live instrument, being shocked. Your instinct is to grab and pull them free. Why would that be a potentially fatal mistake?

The answer is that if you touch a person who is still in contact with the electricity, the current will pass into you too, and you become a second victim. You must never touch a person who is still connected to a live source. Instead, the first action is to cut the power: switch off at the wall, or pull the plug, or trip the breaker - break the circuit before touching them.

Only once the power is off is it safe to help: check the person, call for emergency help, and if trained, begin resuscitation, because a shock across the heart can cause cardiac arrest. Electrical burns should be treated and the incident reported.

Crucial insight: the golden rule of electrical rescue is switch off first, touch second - never touch a live casualty. This single principle, counter to the instinct to grab, prevents the rescuer from becoming the next casualty. Knowing it before an emergency, when there is no time to think, is what makes the difference between one victim and two.` },

    { q: "The basics: voltage, current, and the three-pin plug.",
      body: `A little understanding of what electricity actually is makes every safety rule sensible rather than arbitrary. Three simple ideas suffice.

Voltage is the electrical pressure that pushes current along - like the pressure in a water pipe. Current is the actual flow of electric charge - like the water flowing - and it is the current through the body that causes harm. Resistance is how much a material opposes the flow; dry skin has high resistance and resists current, but wet skin has much lower resistance, which is exactly why water makes shocks so much worse.

The standard three-pin plug puts these ideas to work. It has a live pin, which carries the incoming current; a neutral pin, which carries it back; and the earth pin, the third one, connected to the casing for safety. The plug also contains a fuse.

My Socratic question: knowing that wet skin has low resistance, explain in one line why the rule "never touch equipment with wet hands" is really a rule about current.

The answer is that low resistance lets far more current flow through you for the same voltage, turning a harmless contact into a dangerous or fatal one - so keeping dry keeps your resistance high and the current low.

Crucial insight: harm comes from current flowing through the body, voltage is the pressure that drives it, and resistance - raised by dry skin, lowered by water - controls how much flows. The three-pin plug carries current in on live, back on neutral, and safeguards you through earth. These basics turn the safety rules from things to memorise into things you understand.` },

    { q: "Static electricity and sensitive instruments.",
      body: `Not all electrical hazards come from the mains. A subtler form - static electricity - matters both for safety and for the delicate instruments you will use.

Static electricity is a build-up of electric charge on a surface, produced by friction - the same effect that makes a balloon cling after rubbing. In everyday life it is a harmless spark, but in the laboratory it has two consequences. First, a static spark near flammable solvent vapour can ignite it, just as a mains spark can - a real fire and explosion risk when handling large volumes of volatile solvents. Second, a static discharge can damage sensitive electronic components inside modern analytical instruments and computers.

My Socratic question: why is static a particular concern precisely when pouring or transferring flammable solvents in quantity?

The answer is that the flow and friction of the liquid can build up static charge, and if that discharges as a spark in the presence of solvent vapour, it can ignite it - which is why bulk solvent containers are often earthed to bleed the charge safely away before it can spark.

Crucial insight: static electricity links back to two hazards you know - fire, through igniting solvent vapour, and equipment damage, through discharge into delicate electronics. Being aware of it means handling volatile solvents with earthing and care, and respecting the sensitivity of modern instruments. It is a reminder that electrical safety is not only about the mains supply but about charge in all its forms.` },

    { q: "Consolidation and your final test.",
      body: `Your cognitive map for laboratory electrical safety, in five lines.

The danger: laboratory instruments run on mains electricity, and the lab concentrates the risk with water, solvents, wet hands and long hours; electricity injures by shock (which can stop the heart), by burns, and by causing secondary accidents - and it is the current and its path through the body, especially across the heart, that determine the danger.

The built-in safeguards: earthing gives fault current a safe path to ground and must never be defeated; fuses and breakers cut large currents to protect equipment and prevent fire; the RCD detects the small leakage current of a shock and protects the person.

The everyday rules: keep electricity and water apart, inspect cables and casings before use, never use faulty equipment, do not overload sockets, and handle by the plug.

The combinations: electricity with solvents causes fire, with water causes shock, with heat causes burns - isolate the power before touching a spill near equipment.

The emergency rule: in a shock, switch off first, touch second - never touch a casualty still connected to a live source.

Now your final test. A laboratory scientist notices that a centrifuge occasionally gives a faint tingle when touched, but it still runs, so they keep using it. One day a colleague, with slightly damp hands, touches the same centrifuge and receives a serious shock, collapsing while still holding the machine.

Question one: what did the initial tingle indicate, and what should have been done when it was first noticed?
Question two: name the two safety features that, if working and not defeated, should have prevented this shock, and explain what each does.
Question three: state exactly what a bystander must do first on finding the colleague collapsed and still holding the live centrifuge, and why the instinctive response is dangerous.

Work them through before reading on.

My answers. One: the tingle indicated that current was leaking to the metal casing - an earth fault making the casing partly live; the moment it was noticed, the centrifuge should have been switched off, unplugged, labelled faulty, taken out of service, and reported, never kept in use. Two: proper earthing should have carried the fault current safely to ground and blown the fuse or tripped the breaker instead of letting the casing stay live; and an RCD should have detected the small current leaking through the person to earth and cut the power in a fraction of a second - together they protect against exactly this fault. Three: the bystander must first cut the power - switch off at the wall, pull the plug, or trip the breaker - before touching the colleague, because touching a person still connected to a live source would pass the current into the rescuer too, creating a second casualty; only after the power is off is it safe to help and call for emergency aid.

If those came cleanly, you understand electrical safety not as a list of rules but as a chain of protection - built-in safeguards, daily discipline, and a life-saving emergency response - that keeps you and your colleagues alive among the powered instruments you will use every day.` },
  ],
  theory: [
    { q: "Why is the laboratory a higher-risk setting for electrical hazards than an ordinary room?", a: "Because it combines many powered instruments packed together, the frequent presence of water and conductive liquids, wet hands, flammable solvents near possible sparks, and equipment running for long hours - each of which raises the risk of shock, burns or fire above that of a normal room." },
    { q: "Describe the main ways electricity harms the body.", a: "By electric shock, where current disrupts nerves and muscles and can stop the heart or paralyse breathing; by burns, from heat as current passes through tissue or arcs across a gap; and by indirect injury, such as a fall or dropped hazardous material caused by the shock or startle." },
    { q: "Why is the path of current through the body important in determining danger?", a: "Because a current passing across the chest and through the heart is far more dangerous than one through a single finger, as it can disrupt the heart's rhythm and cause cardiac arrest. Hand-to-hand or hand-to-foot paths that cross the heart are especially deadly." },
    { q: "Explain how earthing (grounding) protects the user of an instrument.", a: "Earthing connects the metal casing of an instrument, via the plug's third pin, to the ground. If a live wire touches the casing, the earth wire gives the fault current a safe path to ground rather than through a person, and the resulting surge blows the fuse or trips the breaker, cutting the power. It must never be defeated." },
    { q: "Distinguish a fuse from a circuit breaker.", a: "A fuse is a thin wire that melts and permanently breaks the circuit when too much current flows, and must be replaced. A circuit breaker performs the same protective function but is a switch that trips and can be reset rather than replaced." },
    { q: "What is an RCD and why does it most directly protect life?", a: "A residual current device (RCD) compares the current flowing out with that flowing back; if a small amount goes missing because it is leaking through a person to earth, it cuts the power within a fraction of a second. It protects life because that small leakage current can kill but may be too small to blow a fuse - the RCD detects it and disconnects fast enough to prevent a fatal shock." },
    { q: "List four everyday rules for electrical safety in the laboratory.", a: "Keep electricity and water apart (never handle equipment with wet hands); inspect cables, plugs and casings before use and never use faulty equipment; do not overload sockets by daisy-chaining adapters; and handle plugs by the body, not by pulling the cable. Cables should also be routed to avoid trip hazards and wet areas." },
    { q: "What does a tingle from an instrument's casing indicate, and what must be done?", a: "It indicates that current is leaking to the casing - an earth fault making the casing partly live and a warning of possible electrocution. The equipment must be switched off, unplugged, labelled as faulty, taken out of service, and reported immediately; it must never be kept in use." },
    { q: "Explain why isolating the power is essential before cleaning a spill under a plugged-in instrument.", a: "Because the spilled liquid may have created a live electrical path from the instrument, and reaching into it while the power is on risks electrocution. The instrument must be switched off and unplugged at the wall before the spill is touched." },
    { q: "State the golden rule for rescuing someone receiving an electric shock and explain it.", a: "Switch off first, touch second - never touch a casualty still connected to a live source. Touching a person still in contact with the electricity would pass the current into the rescuer, creating a second victim; the power must be cut (switch off, unplug, or trip the breaker) before the casualty is touched or helped." },
  ],
  videos: [
    { channel: "Electrical Safety", title: "How Electricity Affects the Human Body Shock", note: "Explains current, path through the body, and why shock stops the heart.", url: "" },
    { channel: "Electrical Safety", title: "Earthing Grounding and RCD Explained", note: "How the earth wire and residual current device protect against shock.", url: "" },
    { channel: "Lab Safety", title: "Electrical Safety in the Laboratory", note: "Practical rules for using powered instruments safely at the bench.", url: "" },
  ],
  mcqs: [
    { q: "Laboratory electrical risk is higher than in a normal room mainly because of:", o: ["Many instruments plus water, solvents and long running hours", "Cooler temperatures", "Fewer sockets", "Brighter lighting"], a: 0, w: "The lab concentrates instruments, liquids, solvents and long use." },
    { q: "Electric shock harms the body by:", o: ["Cooling the tissues", "Strengthening muscles", "Improving circulation", "Disrupting nerves and muscles, and possibly stopping the heart"], a: 3, w: "Current disrupts nerve and muscle function and can cause cardiac arrest." },
    { q: "A current path that is especially dangerous is one that crosses the:", o: ["Hair", "Chest and heart", "Fingernail", "Single finger"], a: 1, w: "Current across the heart can disrupt its rhythm and be fatal." },
    { q: "The factor that most directly determines how harmful a shock is:", o: ["The brand of plug", "The time of day", "The current and its path through the body", "The colour of the wire"], a: 2, w: "It is the current and its path, not voltage alone, that harm." },
    { q: "Earthing (grounding) connects the instrument's metal casing to:", o: ["The neutral only", "Nothing", "The live wire", "The ground, via the plug's third pin"], a: 3, w: "The earth wire links the casing to ground as a fault escape route." },
    { q: "Under normal operation, the earth wire carries:", o: ["Most of the current", "No current", "Half the current", "Only heat"], a: 1, w: "It normally carries no current; it acts only during a fault." },
    { q: "If a live wire touches the metal casing of an earthed instrument, the earth wire:", o: ["Stores the current", "Does nothing", "Makes the casing more live", "Gives the fault current a safe path to ground and trips protection"], a: 3, w: "It safely diverts fault current and blows the fuse or trips the breaker." },
    { q: "You should NEVER:", o: ["Inspect a cable", "Defeat or remove the earth connection", "Unplug faulty equipment", "Report a fault"], a: 1, w: "Removing the earth leaves you unprotected against a live-casing fault." },
    { q: "A fuse protects a circuit by:", o: ["Cooling wires", "Increasing current", "Melting and breaking the circuit when current is too high", "Storing charge"], a: 2, w: "The fuse is a weak link that breaks on excess current." },
    { q: "A circuit breaker differs from a fuse in that it:", o: ["Is a switch that trips and can be reset", "Melts permanently", "Adds current", "Cannot break a circuit"], a: 0, w: "A breaker trips and resets rather than needing replacement." },
    { q: "The device that most directly protects a person from a fatal shock is the:", o: ["Light switch", "Extension lead", "Fuse", "RCD (residual current device)"], a: 3, w: "The RCD detects small leakage current through a person and cuts power fast." },
    { q: "An RCD works by:", o: ["Storing charge", "Comparing outgoing and returning current for an imbalance", "Heating a wire", "Measuring voltage only"], a: 1, w: "A missing amount of returning current signals leakage and trips the RCD." },
    { q: "A fuse may fail to protect a person from a shock because:", o: ["It protects only lights", "The small current through a person may be too low to blow it", "It only works at night", "It is too fast"], a: 1, w: "Lethal leakage current can be too small to blow a fuse - hence the RCD." },
    { q: "You should never handle plugs or equipment with:", o: ["Gloved hands", "Both hands", "Dry hands", "Wet hands"], a: 3, w: "Water conducts electricity, so wet hands greatly raise shock risk." },
    { q: "Before using any powered instrument, you should:", o: ["Ignore its cable", "Inspect for frayed cables, cracked plugs and damaged casing", "Overload the socket", "Pull it by the cable"], a: 1, w: "Inspecting for damage catches faults before they cause harm." },
    { q: "Plugging many adapters into one socket (daisy-chaining) is dangerous because it can:", o: ["Reduce current", "Save power", "Overheat and cause fire", "Improve earthing"], a: 2, w: "Overloading a socket causes overheating and fire risk." },
    { q: "A plug should be removed from a socket by:", o: ["Cutting the cord", "Twisting the wire", "Yanking the cable", "Pulling the plug body"], a: 3, w: "Pulling the cable damages the wire; grip the plug itself." },
    { q: "A faint tingle when touching an instrument's casing means:", o: ["It needs more power", "Current is leaking to the casing - a fault", "It is working perfectly", "The room is cold"], a: 1, w: "A tingle signals a leakage fault and possible electrocution." },
    { q: "On feeling a tingle from an instrument, you should:", o: ["Switch off, unplug, label faulty and report it", "Add water", "Touch it again", "Keep using it"], a: 0, w: "Take it out of service immediately and report the fault." },
    { q: "An electrical spark near flammable solvent vapour can cause:", o: ["Nothing", "Better results", "Fire or explosion", "Cooling"], a: 2, w: "Sparks ignite flammable vapours - keep solvents from electricals." },
    { q: "Before cleaning a liquid spill under a plugged-in instrument, you must first:", o: ["Turn up the power", "Wipe with bare hands", "Switch off and unplug the instrument", "Add more liquid"], a: 2, w: "Isolate the electricity first; the liquid may be a live path." },
    { q: "The combination of electricity and water creates a risk of:", o: ["Electric shock", "Cooling", "Better conduction of light", "Nothing"], a: 0, w: "Water conducts current, creating a shock path." },
    { q: "The combination of overloaded wiring and heat creates a risk of:", o: ["Cleaner benches", "Freezing", "Fire", "Lower bills"], a: 2, w: "Overloaded, overheating wiring can start a fire." },
    { q: "On finding a colleague being shocked and still holding a live instrument, you must FIRST:", o: ["Cut the power - switch off, unplug or trip the breaker", "Pour water on them", "Touch the instrument", "Grab and pull them off"], a: 0, w: "Cut the power before touching, or you become the next casualty." },
    { q: "Grabbing a person still connected to a live source is dangerous because:", o: ["The current will pass into you too", "It damages the instrument", "It is against policy only", "It wastes time"], a: 0, w: "You would become a second victim of the same current." },
    { q: "After the power is cut, an electrocution casualty may need:", o: ["Emergency help and possibly resuscitation", "Nothing at all", "Only a plaster", "To keep working"], a: 0, w: "A shock across the heart can cause cardiac arrest needing resuscitation." },
    { q: "The golden rule of electrical rescue is:", o: ["Use water first", "Switch off first, touch second", "Never help", "Touch first, switch off later"], a: 1, w: "Always cut the power before touching a live casualty." },
    { q: "Fuses and circuit breakers mainly protect:", o: ["Nothing", "The lighting only", "The person from small leakage", "Equipment and against fire by cutting large currents"], a: 3, w: "They cut large currents; the RCD is what protects the person." },
    { q: "Faulty electrical equipment in the laboratory should be:", o: ["Taken out of service, labelled and reported", "Kept in use", "Used only at night", "Hidden"], a: 0, w: "Remove faulty equipment from use and report it immediately." },
    { q: "Overall, laboratory electrical safety is best described as:", o: ["Only the electrician's concern", "A one-time check", "A chain of built-in safeguards, daily discipline and correct emergency response", "An optional extra"], a: 2, w: "It combines safeguards, everyday care and a life-saving response." },
  ],
};

/* --------------------------- ana:4 --------------------------- */
const T_ANA_GLAND = {
  courseId: "ana",
  topicIndex: 4,
  title: "Glandular Epithelium",
  minutes: 18,
  note: [
    { q: "From lining to secreting: the second job of epithelium.",
      body: `You have studied membranous epithelium - the sheets that cover and line surfaces. Now we meet the other great role of epithelial tissue: secretion. Epithelial cells do not only form barriers; some of them specialise to manufacture and release useful substances, and when they do, they form glands.

My Socratic question: your body must produce sweat, saliva, tears, digestive enzymes, hormones, mucus and milk. What single tissue type is responsible for building the structures that make all of these?

The answer is glandular epithelium. A gland is essentially epithelial cells specialised for secretion - the production and release of a substance the body needs. Glands develop from epithelium: during development, epithelial cells grow down into the underlying connective tissue and specialise to secrete.

Crucial insight: glandular epithelium is epithelium adapted for secretion rather than covering. Understanding it explains where saliva, hormones, sweat, and digestive juices actually come from - all from epithelial cells doing their second great job. This is why, after learning the covering epithelia, we turn to the secreting ones.` },

    { q: "The first great divide: exocrine versus endocrine.",
      body: `All glands fall into two fundamental categories, distinguished by one question: where do they send their product? This single distinction organises the entire topic.

My Socratic question: a sweat gland releases sweat onto the skin surface, while the thyroid releases hormones into the blood. What is the essential difference in how these two deliver their products?

The answer is that exocrine glands secrete their products through ducts onto a surface, while endocrine glands secrete their products directly into the blood, having no ducts. Exocrine glands - sweat, salivary, mammary, digestive - have a tube, the duct, that carries the secretion to an epithelial surface, whether the skin or the lining of a hollow organ. Endocrine glands - the thyroid, pituitary, adrenal - are ductless; they release hormones straight into the bloodstream, which carries them to distant targets.

Crucial insight: the presence or absence of a duct is the defining difference. Exocrine glands have ducts and secrete onto surfaces; endocrine glands are ductless and secrete hormones into the blood. This one distinction - duct versus no duct, surface versus blood - is the master division of all glands and the foundation for everything that follows.` },

    { q: "Endocrine glands: the ductless messengers.",
      body: `Let us look more closely at the ductless glands, because they run much of the body's coordination.

Endocrine glands secrete hormones - chemical messengers - directly into the surrounding tissue fluid and blood. The blood then carries these hormones throughout the body to reach specific target cells, sometimes far away, which respond to them. Because they use the bloodstream rather than a duct, their effects are widespread and often slow and sustained.

My Socratic question: examples include the thyroid gland, the adrenal glands, the pituitary, and the islet cells of the pancreas. What links all of these despite their different locations and hormones?

The answer is that all of them are ductless and release their products into the blood to act at a distance. The pancreas is a fascinating special case worth noting - it is both: its endocrine islet cells release insulin into the blood, while its exocrine cells release digestive enzymes through a duct into the gut.

Crucial insight: endocrine glands are the body's slow, blood-borne signalling system - recall from physiology the endocrine system as the sustained partner to the fast nervous system. Their ductless structure is exactly what lets hormones travel widely through the blood. When you measure hormone levels in a laboratory, you are sampling the products of these ductless glands.` },

    { q: "Exocrine glands: structure of a secreting unit.",
      body: `Now the exocrine glands, which are more varied in structure, and whose anatomy examiners love. Every exocrine gland has two functional parts.

The secretory unit, or acinus, is the group of epithelial cells that actually produce the secretion. The duct is the tube, itself lined by epithelium, that carries the secretion from the secretory unit to the surface.

My Socratic question: glands are classified by the shape of these two parts. If the secretory portion is a rounded sac it is called one thing; if it is a tube, another. What are these two shapes called?

The answer is that a flask-like or rounded secretory unit is called acinar (or alveolar), while a tube-shaped secretory unit is called tubular. Glands can be purely tubular, purely acinar, or a mix - tubuloacinar.

Crucial insight: an exocrine gland is a secretory unit plus a duct, and its classification begins with the shapes of these parts - tubular, acinar, or both. Recognising the secretory unit and duct in a slide, and their shapes, is the first step in identifying and classifying any exocrine gland under the microscope, which is a core laboratory skill.` },

    { q: "Classifying exocrine glands: simple versus compound.",
      body: `Beyond the shape of the secretory unit, exocrine glands are classified by their duct system, giving a clear two-part naming scheme.

My Socratic question: some glands have a single unbranched duct, while others have a branching, tree-like duct system. What are these two arrangements called?

The answer is that a gland with a single, unbranched duct is simple, while a gland with a branched duct system is compound. Combine this with the secretory-unit shape and you can name any gland: a simple tubular gland (single duct, tube-shaped unit, like intestinal glands), a simple coiled tubular gland (like sweat glands), a compound acinar gland, a compound tubuloacinar gland (like the salivary glands and pancreas), and so on.

Crucial insight: exocrine gland classification is a two-part system - the duct (simple = unbranched, compound = branched) plus the secretory unit shape (tubular, acinar, tubuloacinar). Naming a gland means describing both. This systematic scheme turns the bewildering variety of glands into a small set of combinations you can identify and name, which is exactly what a microscopy exam demands.` },

    { q: "The three modes of secretion: how the product leaves the cell.",
      body: `Glands also differ in how their cells actually release the product, and this gives three named mechanisms - a classic examinable trio.

Merocrine secretion, the most common, releases the product by exocytosis, with no loss of cell material - the cell packages the secretion in vesicles that fuse with the membrane and release the contents, staying fully intact. Most sweat glands and the salivary glands and pancreas work this way. Apocrine secretion releases the product along with the apical portion of the cell - the top of the cell pinches off with the secretion inside it, losing a little cytoplasm. The mammary glands, releasing the fat in milk, are the classic example. Holocrine secretion is the most dramatic: the entire cell fills with product, dies, and disintegrates, becoming the secretion itself. The sebaceous (oil) glands of the skin work this way.

My Socratic question: which of the three modes destroys the whole cell, and which keeps the cell entirely intact?

The answer is that holocrine destroys the whole cell (holo meaning whole), while merocrine keeps the cell entirely intact; apocrine is the intermediate, losing only the apical tip.

Crucial insight: the three modes - merocrine (intact, exocytosis), apocrine (loses apical tip), holocrine (whole cell dies) - describe how the secretion escapes the cell, from least to most destructive. Linking each to its classic example (merocrine-salivary, apocrine-mammary, holocrine-sebaceous) is exactly the association exams test.` },

    { q: "Serous, mucous and mixed: the nature of the secretion.",
      body: `Exocrine glands are also described by what they secrete, giving another simple but examinable classification of the secretory cells themselves.

Serous cells produce a watery, thin, often enzyme-rich secretion - the watery part of saliva, or the enzymes of the pancreas. Under the microscope they typically have a rounded nucleus and darker, granular cytoplasm. Mucous cells produce mucus - a thick, viscous, slippery secretion for lubrication and protection. Under the microscope they appear pale and foamy, with a flattened nucleus pushed to the base of the cell by the stored mucus.

My Socratic question: the salivary glands contain both serous and mucous cells. What would we call such a gland, and why is this useful?

The answer is that it is a mixed (seromucous) gland, producing both watery enzyme-rich and thick lubricating secretions - useful because saliva needs both to moisten, lubricate and begin digesting food. In mixed glands, serous cells sometimes form crescent-shaped caps called serous demilunes over mucous units.

Crucial insight: glands are classified by secretion type - serous (watery, enzyme-rich, dark), mucous (thick, lubricating, pale and foamy), or mixed. Recognising serous versus mucous cells by their microscopic appearance - dark and granular versus pale and foamy with a basal nucleus - is a key identification skill at the bench.` },

    { q: "The goblet cell: the simplest gland of all.",
      body: `One gland is so important and so common that it deserves special attention, and it is the simplest gland in the body: the goblet cell.

A goblet cell is a single, individual mucous-secreting cell scattered among other epithelial cells - a one-celled, or unicellular, exocrine gland. It needs no duct because it sits right at the surface it secretes onto. Shaped like a wine goblet, it has a swollen top full of mucus and a narrow stalk-like base containing the nucleus.

My Socratic question: goblet cells are found abundantly in the lining of the intestines and the respiratory tract. Why is a mucus-secreting cell so valuable in exactly these places?

The answer is that in the intestine, mucus lubricates the passage of food and protects the lining from digestive enzymes and abrasion; in the airways, mucus traps inhaled dust and microbes so they can be swept out. Both are surfaces that need constant lubrication and protection, which the goblet cell provides on the spot.

Crucial insight: the goblet cell is the unicellular exocrine gland - a single mucous cell needing no duct - and the classic example that most exocrine glands are multicellular by contrast. Recognising goblet cells in intestinal and respiratory epithelium, by their pale mucus-filled cup shape, is one of the most common and testable identifications in histology.` },

    { q: "Why glands matter clinically and in the laboratory.",
      body: `Glandular epithelium is not just a structural topic - it is where much of medicine and laboratory work is focused, because glands are common sites of disease.

My Socratic question: epithelial tissues, including glands, are the origin of the most common human cancers. Why should a tissue that secretes be so prone to disease?

The answer is that glandular epithelial cells divide actively to replace themselves and to produce their secretions, and actively dividing cells are more prone to the mutations that cause cancer. A cancer arising from glandular epithelium has a specific name - an adenocarcinoma - and these are among the most common cancers, including many breast, colon, prostate, and lung cancers. The prefix adeno- means gland.

Glandular tissues are also central to laboratory medicine in other ways: the endocrine glands' hormones are measured in blood tests to diagnose disorders like thyroid disease and diabetes, and the exocrine pancreas's enzymes are measured to detect pancreatitis.

Crucial insight: glandular epithelium connects directly to your future work - adenocarcinomas (gland-derived cancers) are identified in histology, and gland products (hormones and enzymes) are measured in clinical chemistry. The tissue you are learning to recognise is the tissue behind a great deal of diagnosis, which is why mastering its normal appearance matters so much.` },

    { q: "Consolidation and your final test.",
      body: `Your cognitive map for glandular epithelium, in five lines.

The essence: glands are epithelial cells specialised for secretion, developing from epithelium that grows into the underlying tissue.

The master division: exocrine glands secrete through ducts onto surfaces; endocrine glands are ductless and secrete hormones into the blood.

Exocrine structure and classification: a secretory unit (acinar or tubular) plus a duct (simple = unbranched, compound = branched), named by combining both.

How and what they secrete: three modes - merocrine (intact, exocytosis), apocrine (loses apical tip), holocrine (whole cell dies); and secretion types - serous (watery, enzyme-rich), mucous (thick, lubricating), or mixed; the goblet cell is the unicellular mucous gland.

The relevance: gland-derived cancers are adenocarcinomas, among the commonest cancers, and gland products (hormones, enzymes) are measured throughout laboratory medicine.

Now your final test. Under the microscope you examine a salivary gland. You see rounded secretory units, some with dark granular cells and some with pale foamy cells whose nuclei are flattened against the base, all draining into a branching system of ducts. The gland releases its product by exocytosis without losing cells.

Question one: is this gland exocrine or endocrine, and how do you know from what you see?
Question two: classify its duct system and name the two types of secretory cell present, stating what overall secretion type this makes the gland.
Question three: name the mode of secretion described, and confirm it matches what is expected of a salivary gland.

Work them through before reading on.

My answers. One: it is exocrine, because it drains its product through a system of ducts rather than being ductless - the presence of ducts is the defining sign of an exocrine gland. Two: the branching duct system makes it a compound gland; the dark granular cells are serous cells and the pale foamy cells with basal flattened nuclei are mucous cells, so having both makes it a mixed (seromucous) gland. Three: releasing product by exocytosis without losing cells is merocrine secretion, which is exactly the mode expected of a salivary gland.

If those came cleanly, you can recognise, classify and understand glandular epithelium - the secreting half of epithelial tissue, and the origin of much of the disease you will one day help diagnose.` },
  ],
  theory: [
    { q: "What is a gland, and from what tissue do glands develop?", a: "A gland is epithelial cells specialised for secretion - the production and release of a useful substance. Glands develop from epithelium, forming when epithelial cells grow down into the underlying connective tissue during development and specialise to secrete." },
    { q: "State the fundamental difference between exocrine and endocrine glands.", a: "Exocrine glands secrete their products through ducts onto a surface (the skin or a hollow organ's lining), while endocrine glands are ductless and secrete hormones directly into the blood, which carries them to distant target cells. The presence or absence of a duct is the defining difference." },
    { q: "How do endocrine glands deliver their products, and give two examples.", a: "Endocrine glands release hormones directly into the surrounding tissue fluid and blood, with no duct; the blood then carries the hormones to target cells throughout the body. Examples include the thyroid, adrenal glands, pituitary, and the islet cells of the pancreas." },
    { q: "Describe the two functional parts of an exocrine gland.", a: "The secretory unit (acinus), the group of epithelial cells that produce the secretion; and the duct, the epithelium-lined tube that carries the secretion from the secretory unit to the surface." },
    { q: "Explain the simple versus compound classification of exocrine glands.", a: "It is based on the duct system: a simple gland has a single, unbranched duct, while a compound gland has a branched duct system. Combined with the secretory-unit shape (tubular, acinar, or tubuloacinar), this allows any exocrine gland to be named." },
    { q: "Describe the three modes of secretion.", a: "Merocrine: product released by exocytosis with the cell staying fully intact (e.g. salivary glands). Apocrine: product released with the apical part of the cell pinching off, losing a little cytoplasm (e.g. mammary glands). Holocrine: the whole cell fills with product, dies and disintegrates to become the secretion (e.g. sebaceous glands)." },
    { q: "Distinguish serous from mucous secretory cells.", a: "Serous cells produce a watery, thin, enzyme-rich secretion and appear with a rounded nucleus and darker, granular cytoplasm. Mucous cells produce thick, viscous, lubricating mucus and appear pale and foamy, with a flattened nucleus pushed to the base of the cell. A gland with both is mixed (seromucous)." },
    { q: "What is a goblet cell?", a: "A goblet cell is a single, individual mucous-secreting cell scattered among other epithelial cells - a unicellular exocrine gland. Shaped like a goblet, with a mucus-filled swollen top and a narrow base holding the nucleus, it needs no duct and is abundant in the intestinal and respiratory linings." },
    { q: "Why are goblet cells valuable in the intestine and airways?", a: "In the intestine, their mucus lubricates the passage of food and protects the lining from digestive enzymes and abrasion; in the airways, mucus traps inhaled dust and microbes so they can be cleared. Both are surfaces needing constant lubrication and protection." },
    { q: "What is an adenocarcinoma and why is glandular epithelium prone to cancer?", a: "An adenocarcinoma is a cancer arising from glandular epithelium (adeno- meaning gland). Glandular epithelium is prone to cancer because its cells divide actively to replace themselves and produce secretions, and actively dividing cells are more susceptible to cancer-causing mutations. Adenocarcinomas include many breast, colon, prostate and lung cancers." },
  ],
  videos: [
    { channel: "Histology", title: "Glandular Epithelium Exocrine and Endocrine", note: "The master division and how each gland type secretes.", url: "" },
    { channel: "Histology", title: "Classification of Exocrine Glands Simple Compound", note: "Duct and secretory-unit shapes and how glands are named.", url: "" },
    { channel: "Histology", title: "Modes of Secretion Merocrine Apocrine Holocrine", note: "The three secretion modes with their classic gland examples.", url: "" },
  ],
  mcqs: [
    { q: "A gland is fundamentally made of cells specialised for:", o: ["Support", "Secretion", "Contraction", "Conduction"], a: 1, w: "Glands are epithelial cells specialised to secrete." },
    { q: "Glands develop from:", o: ["Epithelium", "Bone", "Muscle", "Blood"], a: 0, w: "Glands form from epithelium growing into underlying tissue." },
    { q: "The defining difference between exocrine and endocrine glands is:", o: ["Their size", "Their location only", "The presence or absence of a duct", "Their colour"], a: 2, w: "Exocrine glands have ducts; endocrine glands are ductless." },
    { q: "Exocrine glands secrete their products:", o: ["Nowhere", "Through ducts onto a surface", "Into the blood", "Into the bone"], a: 1, w: "Exocrine secretion travels through a duct to a surface." },
    { q: "Endocrine glands secrete their products:", o: ["Onto the skin", "Into the gut", "Through ducts", "Directly into the blood"], a: 3, w: "Ductless endocrine glands release hormones into the blood." },
    { q: "Which is an endocrine gland?", o: ["Thyroid gland", "Mammary gland", "Salivary gland", "Sweat gland"], a: 0, w: "The thyroid is ductless and secretes hormones into blood." },
    { q: "Which is an exocrine gland?", o: ["Pituitary", "Thyroid", "Adrenal", "Salivary gland"], a: 3, w: "The salivary gland uses ducts to secrete onto a surface." },
    { q: "The pancreas is special because it is:", o: ["Both exocrine and endocrine", "Only endocrine", "A muscle", "Neither gland type"], a: 0, w: "It has endocrine islets and an exocrine enzyme-secreting portion." },
    { q: "The secretory unit of an exocrine gland is called the:", o: ["Duct", "Nucleus", "Acinus", "Lumen"], a: 2, w: "The acinus is the group of cells producing the secretion." },
    { q: "A rounded, flask-like secretory unit is described as:", o: ["Simple", "Acinar (alveolar)", "Compound", "Tubular"], a: 1, w: "Acinar or alveolar means a rounded secretory unit." },
    { q: "A tube-shaped secretory unit is described as:", o: ["Compound", "Acinar", "Holocrine", "Tubular"], a: 3, w: "A tubular secretory unit is tube-shaped." },
    { q: "A gland with a single, unbranched duct is:", o: ["Simple", "Endocrine", "Compound", "Mixed"], a: 0, w: "Simple glands have one unbranched duct." },
    { q: "A gland with a branched duct system is:", o: ["Compound", "Unicellular", "Ductless", "Simple"], a: 0, w: "Compound glands have branching ducts." },
    { q: "Sweat glands, with a coiled tube-shaped unit and single duct, are:", o: ["Compound acinar", "Simple coiled tubular", "Holocrine", "Endocrine"], a: 1, w: "A single duct with a coiled tubular unit is simple coiled tubular." },
    { q: "Merocrine secretion releases product by:", o: ["Bursting", "Destroying the whole cell", "Losing the apical tip", "Exocytosis with the cell staying intact"], a: 3, w: "Merocrine uses exocytosis and keeps the cell intact." },
    { q: "Apocrine secretion involves loss of:", o: ["The whole cell", "No cell material", "The apical portion of the cell", "The nucleus only"], a: 2, w: "Apocrine pinches off the apical tip with the secretion." },
    { q: "Holocrine secretion involves:", o: ["Only the tip", "The entire cell dying and becoming the secretion", "Exocytosis", "No loss of cell"], a: 1, w: "In holocrine secretion the whole cell disintegrates as the product." },
    { q: "The sebaceous (oil) glands secrete by which mode?", o: ["Endocrine", "Merocrine", "Apocrine", "Holocrine"], a: 3, w: "Sebaceous glands are the classic holocrine glands." },
    { q: "The mammary glands are the classic example of which mode?", o: ["Apocrine", "Merocrine", "Serous", "Holocrine"], a: 0, w: "Mammary glands release milk fat by apocrine secretion." },
    { q: "Serous cells produce a secretion that is:", o: ["Solid", "Oily", "Watery and enzyme-rich", "Thick and slippery"], a: 2, w: "Serous secretion is watery and often enzyme-rich." },
    { q: "Mucous cells produce a secretion that is:", o: ["Watery", "Hormonal", "Thick, viscous and lubricating", "Enzyme-rich"], a: 2, w: "Mucus is thick, viscous and lubricating." },
    { q: "Under the microscope, mucous cells typically appear:", o: ["Empty", "Pale and foamy with a basal flattened nucleus", "Red", "Dark and granular"], a: 1, w: "Stored mucus makes them pale and foamy with a basal nucleus." },
    { q: "A gland with both serous and mucous cells is:", o: ["Holocrine", "Mixed (seromucous)", "Purely serous", "Endocrine"], a: 1, w: "Both cell types make it a mixed seromucous gland." },
    { q: "A goblet cell is best described as a:", o: ["Endocrine gland", "Muscle cell", "Unicellular (single-celled) exocrine gland", "Multicellular gland"], a: 2, w: "The goblet cell is a single-celled exocrine gland." },
    { q: "A goblet cell secretes:", o: ["Bone", "Mucus", "Enzymes only", "Hormones"], a: 1, w: "Goblet cells are mucous-secreting cells." },
    { q: "Goblet cells are abundant in the:", o: ["Bone marrow", "Kidney tubules only", "Intestinal and respiratory linings", "Heart muscle"], a: 2, w: "They lubricate and protect the gut and airway linings." },
    { q: "A goblet cell needs no duct because it:", o: ["Is endocrine", "Is in the blood", "Does not secrete", "Sits at the surface it secretes onto"], a: 3, w: "Being at the surface, it releases mucus directly, no duct needed." },
    { q: "A cancer arising from glandular epithelium is called a(n):", o: ["Adenocarcinoma", "Melanoma", "Lymphoma", "Sarcoma"], a: 0, w: "Adeno- means gland; adenocarcinoma is a gland-derived cancer." },
    { q: "Glandular epithelium is prone to cancer largely because its cells:", o: ["Are dead", "Lack nuclei", "Never divide", "Divide actively, risking mutation"], a: 3, w: "Active division raises the chance of cancer-causing mutations." },
    { q: "Measuring hormones and pancreatic enzymes in blood tests relies on the products of:", o: ["Glandular epithelium", "Nerves", "Bone", "Muscle tissue"], a: 0, w: "Hormones and enzymes are secretions of glandular epithelium." },
  ],
};

/* --------------------------- phy:2 --------------------------- */
const T_PHY_TRANSPORT = {
  courseId: "phy",
  topicIndex: 2,
  title: "Membrane Transport Overview",
  minutes: 18,
  note: [
    { q: "Why the cell membrane is the gatekeeper of life.",
      body: `You learned that homeostasis keeps the internal environment stable. That stability begins at a boundary you must now understand deeply: the cell membrane, which decides what enters and leaves every cell.

My Socratic question: a cell must take in glucose, oxygen and ions while keeping out toxins and holding its contents in - all across one thin membrane. If that membrane let everything through freely, or nothing at all, what would happen to the cell?

The answer is that the cell would die either way - free passage would let its careful internal composition dissolve into the surroundings, while a sealed membrane would starve it. Life depends on the membrane being selectively permeable: allowing some substances across while blocking others, and controlling the rate.

Crucial insight: membrane transport is the set of mechanisms by which substances cross the cell membrane, and it is the foundation of cellular life and homeostasis. Every nutrient absorbed, every waste removed, every nerve impulse and muscle contraction depends on controlled movement across membranes. This is why, having established homeostasis, we now examine exactly how the membrane moves things - the machinery behind the stability.` },

    { q: "The membrane structure that makes selective transport possible.",
      body: `To understand transport you must recall what the membrane is made of, because its structure dictates what can cross easily and what cannot.

The cell membrane is a phospholipid bilayer - a double sheet of phospholipid molecules. Each phospholipid has a water-loving (hydrophilic) phosphate head and two water-fearing (hydrophobic) fatty acid tails. The heads face outward toward the watery fluids inside and outside the cell, while the tails point inward, forming an oily, water-fearing core in the middle of the membrane. Embedded in this bilayer are proteins that act as channels and carriers.

My Socratic question: given that the middle of the membrane is oily and water-fearing, predict which kind of substance slips through easily and which is blocked.

The answer is that small, non-polar, fat-soluble substances - like oxygen and carbon dioxide - dissolve through the oily core easily, while water-soluble and charged substances - like ions, glucose and even water itself - are repelled by that oily core and cannot cross the lipid directly; they need protein help.

Crucial insight: the phospholipid bilayer's oily core is the key to selectivity - it welcomes fat-soluble molecules and blocks water-soluble and charged ones. This single structural fact explains why some substances cross freely while others need special protein pathways, and it organises the entire topic of transport into those that need help and those that do not.` },

    { q: "The master division: passive versus active transport.",
      body: `All membrane transport falls into two great categories, separated by one question: does it require the cell to spend energy?

My Socratic question: some substances move across the membrane on their own, while others must be pushed by the cell using energy. What determines which is which, and what is the energy currency the cell spends?

The answer is that the direction of movement relative to the concentration gradient decides it. Passive transport requires no energy - substances move down their concentration gradient, from where they are more concentrated to where they are less concentrated, like a ball rolling downhill. Active transport requires energy, supplied by ATP, because substances are moved up their concentration gradient, from low to high concentration - against the natural flow, like pushing a ball uphill.

Crucial insight: passive transport is downhill and free; active transport is uphill and costs ATP. This single distinction - with or against the gradient, free or energy-requiring - is the master division of all membrane transport. Every specific mechanism you study is a form of one or the other, so fix this contrast firmly before going further.` },

    { q: "The concentration gradient: the driving force.",
      body: `Both categories are defined by the concentration gradient, so you must understand this idea precisely - it is the engine of passive transport and the obstacle active transport overcomes.

A concentration gradient exists whenever a substance is more concentrated in one region than another. Substances naturally tend to move from high concentration to low concentration, spreading out until evenly distributed - this natural spreading is the basis of diffusion.

My Socratic question: why do particles move from high to low concentration on their own, without any energy being added?

The answer lies in the random motion of all particles. Particles are constantly moving randomly in all directions; where they are crowded (high concentration), more of them happen to move away than move in, so the net movement is outward, toward the less crowded region. No force pushes them - it is simply the statistical result of random motion, which is why it needs no energy. This spreading releases energy rather than requiring it.

Crucial insight: the concentration gradient drives passive transport for free because random particle motion naturally moves substances from high to low concentration. Moving with this gradient is effortless (passive); moving against it, from low to high, requires energy to overcome the natural tendency (active). Understanding why downhill movement is free is the key to understanding why uphill movement must cost ATP.` },

    { q: "Simple diffusion: crossing the membrane directly.",
      body: `The simplest form of passive transport is simple diffusion, and it applies to exactly those substances the oily membrane core welcomes.

Simple diffusion is the movement of a substance directly through the phospholipid bilayer, down its concentration gradient, with no help from proteins. It works only for substances that can dissolve through the oily core: small, non-polar, lipid-soluble molecules.

My Socratic question: name the two most important gases that cross cell membranes this way, and explain why this matters for every breath you take.

The answer is oxygen and carbon dioxide, both small and non-polar. In the lungs, oxygen diffuses from the air into the blood and carbon dioxide diffuses out, all by simple diffusion down their gradients; in every tissue, the same gases diffuse between blood and cells. Your entire gas exchange depends on simple diffusion.

Crucial insight: simple diffusion moves small, non-polar, lipid-soluble substances directly through the membrane, down their gradient, without energy or proteins - oxygen and carbon dioxide being the vital examples. It is the most straightforward transport, requiring nothing but the gradient and a membrane the substance can dissolve through. When the substance cannot dissolve through the oily core, a different passive mechanism is needed.` },

    { q: "Facilitated diffusion: passive, but with a protein helper.",
      body: `Many essential substances - glucose, ions - cannot cross the oily membrane directly, yet the cell still moves them without spending energy. How? Through facilitated diffusion.

Facilitated diffusion is the movement of a substance down its concentration gradient with the help of a membrane transport protein. It is still passive - no energy is used, and the substance still moves from high to low concentration - but it needs a protein pathway because the substance cannot dissolve through the lipid.

My Socratic question: if facilitated diffusion uses proteins like active transport does, what makes it passive rather than active?

The answer is the direction of movement: facilitated diffusion moves substances down their gradient, so no energy is needed - the protein simply provides a passage through the membrane the substance could not otherwise cross. The gradient still does the work; the protein just opens a door. Active transport, by contrast, uses proteins to push substances up the gradient, which does require energy.

Crucial insight: facilitated diffusion is passive transport through a protein - down the gradient, no energy, but requiring a channel or carrier for substances that cannot cross the lipid alone, such as glucose and ions. The presence of a protein does not make transport active; only movement against the gradient does. This distinction is a favourite exam trap, so hold it firmly.` },

    { q: "Osmosis: the special case of water.",
      body: `Water deserves its own attention because its movement across membranes - osmosis - is central to fluid balance and a constant concern in the laboratory.

Osmosis is the diffusion of water across a selectively permeable membrane, from a region of higher water concentration to lower water concentration - which is the same as saying from a dilute solution to a concentrated one. Water moves toward the side with more dissolved solute.

My Socratic question: place a red blood cell in pure water and it swells and bursts; place it in very salty water and it shrivels. Using osmosis, explain both.

The answer is that in pure water, the water concentration outside is higher than inside the cell, so water rushes in by osmosis until the cell bursts; in salty water, the water concentration outside is lower, so water leaves the cell and it shrivels. Water always moves toward the saltier side.

Crucial insight: osmosis is the movement of water toward the more concentrated solution, and it governs whether cells swell, shrink or stay balanced. This is exactly why intravenous fluids and laboratory solutions must be isotonic - matching the cell's concentration - so cells neither burst nor shrivel. When you prepare or handle solutions with cells, osmosis is the principle you are managing.` },

    { q: "Bulk transport: moving the largest cargo.",
      body: `Some materials are simply too large to cross the membrane by any of the mechanisms so far - even through proteins. For these, the cell uses bulk transport, which packages material in membrane sacs. This always requires energy.

Endocytosis is the process of taking large materials into the cell by wrapping them in a piece of membrane that pinches off inward to form a vesicle. When the material is solid particles, such as a bacterium engulfed by an immune cell, it is called phagocytosis (cell eating); when it is fluid droplets, it is called pinocytosis (cell drinking). Exocytosis is the reverse - a vesicle inside the cell fuses with the membrane and releases its contents outside, as when a gland cell secretes a hormone or a nerve cell releases a neurotransmitter.

My Socratic question: an immune cell must engulf and destroy invading bacteria. Which bulk transport process does it use, and is energy required?

The answer is phagocytosis, a form of endocytosis, and yes - all bulk transport requires energy because it involves actively reshaping the membrane, so it is a form of active transport.

Crucial insight: bulk transport - endocytosis (phagocytosis for solids, pinocytosis for fluids) and exocytosis - moves materials too large for other mechanisms, always using energy. It links directly to immune defence (engulfing microbes) and to secretion (releasing hormones and neurotransmitters), showing how transport underlies whole-body functions you will study later.` },

    { q: "Putting it together: a map of membrane transport.",
      body: `Let us assemble the whole scheme, because seeing all mechanisms in one framework lets you classify any example you meet.

The first question is always: does it require energy? If no, it is passive - moving down the gradient. Passive transport includes simple diffusion (small non-polar substances directly through the lipid), facilitated diffusion (via proteins, for substances that cannot cross the lipid), and osmosis (water across the membrane). If yes, it is active - moving up the gradient or moving bulk material. Active transport includes primary active transport (using ATP directly, like the sodium-potassium pump), secondary active transport (using a gradient built by primary), and bulk transport (endocytosis and exocytosis).

My Socratic question: a substance moves from an area where it is scarce to an area where it is already abundant. Immediately, what must be true about the transport?

The answer is that it must be active and require energy, because moving from low to high concentration is against the gradient, which never happens on its own. The direction alone tells you energy is involved.

Crucial insight: classify any transport by asking two questions - does it need energy (passive or active), and does it need a protein (direct or protein-mediated). This two-question framework turns the whole topic into a decision you can make about any substance crossing any membrane, which is exactly what exams and laboratory reasoning require.` },

    { q: "Consolidation and your final test.",
      body: `Your cognitive map for membrane transport, in five lines.

The foundation: the cell membrane is a selectively permeable phospholipid bilayer whose oily core admits small non-polar substances and blocks water-soluble and charged ones, which need proteins.

The master division: passive transport moves substances down their gradient with no energy; active transport moves them up their gradient using ATP.

Passive mechanisms: simple diffusion (small non-polar molecules like oxygen and carbon dioxide directly through the lipid), facilitated diffusion (proteins carry substances like glucose down the gradient), and osmosis (water moving toward the more concentrated solution).

Active mechanisms: primary active transport (ATP directly, the sodium-potassium pump), secondary active transport (using a primary-built gradient), and bulk transport - endocytosis (phagocytosis for solids, pinocytosis for fluids) and exocytosis - all requiring energy.

The reasoning tool: ask does it need energy, and does it need a protein - two questions that classify any transport.

Now your final test. A cell must take in glucose, which is present in higher concentration outside the cell than inside, but glucose cannot dissolve through the oily membrane. Separately, the same cell must pump sodium out even though sodium is already more concentrated outside.

Question one: by what mechanism does the glucose enter, and is energy required? Justify using both the gradient and the need for a protein.
Question two: by what type of mechanism is sodium pumped out, and why must energy be used?
Question three: state the general two-question framework you used to classify each, and what each answer told you.

Work them through before reading on.

My answers. One: glucose enters by facilitated diffusion - it moves down its gradient from high outside to low inside, so no energy is required, but because it cannot dissolve through the oily core it needs a transport protein; passive, but protein-mediated. Two: sodium is pumped out by active transport, because it is being moved from lower concentration inside to higher concentration outside - up its gradient, against the natural flow - which cannot happen on its own and so requires ATP. Three: the framework is to ask first whether energy is needed (down the gradient means passive and free; up the gradient means active and ATP-requiring) and second whether a protein is needed (substances that cannot cross the lipid require a channel or carrier); glucose answered passive-but-protein-mediated, sodium answered active.

If those came cleanly, you understand the gatekeeping machinery of every cell - the mechanisms behind homeostasis, gas exchange, nutrition, nerve impulses and secretion. The next topics examine these mechanisms one by one in depth.` },
  ],
  theory: [
    { q: "Why must the cell membrane be selectively permeable?", a: "Because a cell must take in needed substances (glucose, oxygen, ions) and remove wastes while holding its contents in and keeping toxins out. Free passage would let its internal composition dissolve away, and a sealed membrane would starve it - so it must allow some substances across while blocking others, and control the rate." },
    { q: "Describe the structure of the cell membrane and how it affects transport.", a: "It is a phospholipid bilayer: a double sheet of phospholipids with hydrophilic phosphate heads facing the watery fluids and hydrophobic fatty-acid tails forming an oily core, with embedded proteins. The oily core lets small non-polar, fat-soluble substances dissolve through easily but blocks water-soluble and charged substances, which need protein pathways." },
    { q: "State the master division between passive and active transport.", a: "Passive transport requires no energy: substances move down their concentration gradient (high to low). Active transport requires energy from ATP: substances are moved up their concentration gradient (low to high), against the natural flow." },
    { q: "What is a concentration gradient, and why does passive movement down it require no energy?", a: "A concentration gradient exists when a substance is more concentrated in one region than another. Movement down it needs no energy because particles are in constant random motion, and where they are crowded more happen to move away than toward, giving a net movement from high to low concentration - a free, statistical result of random motion." },
    { q: "Define simple diffusion and give the key examples.", a: "Simple diffusion is movement of a substance directly through the phospholipid bilayer, down its concentration gradient, with no proteins and no energy. It works only for small, non-polar, lipid-soluble substances - oxygen and carbon dioxide being the vital examples, driving gas exchange." },
    { q: "Define facilitated diffusion and explain why it is still passive.", a: "Facilitated diffusion is movement of a substance down its concentration gradient with the help of a membrane transport protein. It is passive because the substance still moves from high to low concentration, so no energy is used; the protein only provides a pathway for substances (like glucose and ions) that cannot dissolve through the lipid. Only movement against the gradient makes transport active." },
    { q: "Define osmosis and state the direction water moves.", a: "Osmosis is the diffusion of water across a selectively permeable membrane, from higher water concentration to lower - that is, from a dilute solution toward a more concentrated (saltier) one. Water always moves toward the side with more dissolved solute." },
    { q: "Explain what happens to a red blood cell in pure water and in very salty water.", a: "In pure water, the outside water concentration is higher than inside, so water rushes into the cell by osmosis until it swells and bursts. In very salty water, the outside water concentration is lower, so water leaves the cell and it shrivels. This is why laboratory and IV solutions must be isotonic." },
    { q: "Describe endocytosis and its two types, and exocytosis.", a: "Endocytosis takes large materials into the cell by wrapping them in membrane that pinches off as a vesicle: phagocytosis (cell eating) engulfs solid particles like bacteria, and pinocytosis (cell drinking) takes in fluid droplets. Exocytosis is the reverse - a vesicle fuses with the membrane and releases its contents outside, as in secretion of hormones or neurotransmitters. All bulk transport requires energy." },
    { q: "State the two-question framework for classifying any membrane transport.", a: "First, does it require energy? Down the gradient means passive (free); up the gradient or moving bulk material means active (ATP-requiring). Second, does it require a protein? Substances that cannot cross the oily lipid core need a channel or carrier, while small non-polar ones cross directly. These two questions classify any transport." },
  ],
  videos: [
    { channel: "Physiology", title: "Cell Membrane Transport Passive and Active Overview", note: "The master division and where each mechanism fits.", url: "" },
    { channel: "Physiology", title: "Diffusion Osmosis and Facilitated Diffusion", note: "The passive mechanisms compared, with clear examples.", url: "" },
    { channel: "Physiology", title: "Endocytosis Exocytosis Bulk Transport", note: "How the cell moves its largest cargo, and why it costs energy.", url: "" },
  ],
  mcqs: [
    { q: "A membrane that allows some substances across but not others is:", o: ["Solid", "Selectively permeable", "Freely permeable", "Impermeable"], a: 1, w: "Selective permeability lets the cell control what crosses." },
    { q: "The cell membrane is structurally a:", o: ["Phospholipid bilayer", "Single protein sheet", "Solid wall", "Layer of sugar"], a: 0, w: "It is a double sheet of phospholipids with embedded proteins." },
    { q: "The core of the membrane is:", o: ["Made of bone", "Oily and water-fearing", "Empty", "Watery and charged"], a: 1, w: "The fatty-acid tails form an oily, hydrophobic core." },
    { q: "Which substance crosses the lipid core most easily?", o: ["Oxygen (small, non-polar)", "Glucose", "A charged ion", "A protein"], a: 0, w: "Small non-polar substances dissolve through the oily core." },
    { q: "Passive transport moves substances:", o: ["Down the gradient with no energy", "Only in bulk", "Up the gradient using ATP", "Against random motion"], a: 0, w: "Passive transport is downhill and requires no energy." },
    { q: "Active transport moves substances:", o: ["Only water", "Up the gradient using energy (ATP)", "Down the gradient freely", "Without proteins"], a: 1, w: "Active transport pushes substances uphill and costs ATP." },
    { q: "The key difference between passive and active transport is:", o: ["Colour", "Whether energy is required", "Speed only", "Temperature"], a: 1, w: "Passive is free (down gradient); active requires energy (up gradient)." },
    { q: "Particles move from high to low concentration on their own because of:", o: ["ATP", "Their constant random motion", "Gravity only", "An added force"], a: 1, w: "Random motion statistically spreads particles from crowded regions." },
    { q: "Simple diffusion moves substances:", o: ["Directly through the lipid bilayer, down the gradient", "Up the gradient", "In vesicles", "Through proteins"], a: 0, w: "Simple diffusion crosses the lipid directly, no proteins, no energy." },
    { q: "Which pair crosses membranes mainly by simple diffusion?", o: ["Glucose and sodium", "Bacteria and water", "Proteins and DNA", "Oxygen and carbon dioxide"], a: 3, w: "O2 and CO2 are small and non-polar - ideal for simple diffusion." },
    { q: "Facilitated diffusion requires:", o: ["Energy and a protein", "Neither protein nor energy", "Only ATP", "A protein but no energy"], a: 3, w: "It uses a protein pathway but moves down the gradient, so no energy." },
    { q: "Facilitated diffusion is classified as passive because it:", o: ["Moves substances down their gradient with no energy", "Is fast", "Moves water", "Uses proteins"], a: 0, w: "Direction down the gradient, not the protein, makes it passive." },
    { q: "A substance moving down its gradient through a protein is using:", o: ["Active transport", "Simple diffusion", "Facilitated diffusion", "Exocytosis"], a: 2, w: "Protein-assisted movement down the gradient is facilitated diffusion." },
    { q: "Osmosis is the movement of:", o: ["Glucose", "Gases", "Water across a selectively permeable membrane", "Ions only"], a: 2, w: "Osmosis is specifically the diffusion of water." },
    { q: "In osmosis, water moves toward the side with:", o: ["Less solute", "More gas", "No water", "More dissolved solute"], a: 3, w: "Water moves toward the more concentrated (saltier) solution." },
    { q: "A red blood cell placed in pure water will:", o: ["Swell and possibly burst", "Stay the same", "Shrivel", "Turn blue"], a: 0, w: "Water rushes in by osmosis, swelling and bursting the cell." },
    { q: "A red blood cell in very salty water will:", o: ["Burst", "Shrivel", "Divide", "Swell"], a: 1, w: "Water leaves the cell toward the saltier outside, shrivelling it." },
    { q: "Laboratory and IV solutions must be isotonic so that cells:", o: ["Stop working", "Shrink", "Neither burst nor shrivel", "Burst"], a: 2, w: "Isotonic solutions match the cell, preventing osmotic damage." },
    { q: "Taking large materials into the cell in a vesicle is:", o: ["Osmosis", "Exocytosis", "Endocytosis", "Diffusion"], a: 2, w: "Endocytosis wraps material in membrane and brings it inward." },
    { q: "Engulfing solid particles like bacteria is:", o: ["Phagocytosis", "Exocytosis", "Pinocytosis", "Osmosis"], a: 0, w: "Phagocytosis (cell eating) engulfs solid particles." },
    { q: "Taking in fluid droplets is:", o: ["Exocytosis", "Diffusion", "Phagocytosis", "Pinocytosis"], a: 3, w: "Pinocytosis (cell drinking) takes in fluid." },
    { q: "Releasing contents from the cell by vesicle fusion is:", o: ["Osmosis", "Endocytosis", "Exocytosis", "Diffusion"], a: 2, w: "Exocytosis fuses a vesicle with the membrane to release contents." },
    { q: "An immune cell engulfing bacteria uses:", o: ["Simple diffusion", "Phagocytosis", "Facilitated diffusion", "Osmosis"], a: 1, w: "Phagocytosis is how immune cells engulf microbes." },
    { q: "Bulk transport (endocytosis and exocytosis) requires:", o: ["No energy", "Energy (it is active)", "Only a gradient", "Only water"], a: 1, w: "Reshaping the membrane for bulk transport requires energy." },
    { q: "A hormone or neurotransmitter is released from a cell by:", o: ["Simple diffusion", "Endocytosis", "Exocytosis", "Osmosis"], a: 2, w: "Secretion of hormones and neurotransmitters uses exocytosis." },
    { q: "If a substance moves from low to high concentration, the transport must be:", o: ["Simple diffusion", "Passive", "Active (requiring energy)", "Osmosis"], a: 2, w: "Moving against the gradient always requires energy." },
    { q: "The first question to classify any transport is:", o: ["How big is the cell", "What time is it", "What colour is it", "Does it require energy"], a: 3, w: "Energy need separates passive from active transport." },
    { q: "The second useful question to classify transport is:", o: ["Does it need a protein", "Is it daytime", "Is it warm", "Is it fast"], a: 0, w: "Protein need separates direct from protein-mediated transport." },
    { q: "The sodium-potassium pump is an example of:", o: ["Facilitated diffusion", "Simple diffusion", "Osmosis", "Primary active transport"], a: 3, w: "It uses ATP directly to pump ions against their gradients." },
    { q: "Membrane transport ultimately underlies:", o: ["Only digestion", "Only bones", "Nothing important", "Homeostasis, gas exchange, nutrition, nerve impulses and secretion"], a: 3, w: "Controlled transport is the basis of nearly all cell function." },
  ],
};

/* --------------------------- phy:3 --------------------------- */
const T_PHY_FACIL = {
  courseId: "phy",
  topicIndex: 3,
  title: "Facilitated Diffusion",
  minutes: 16,
  note: [
    { q: "Revisiting the problem facilitated diffusion solves.",
      body: `In the transport overview you met facilitated diffusion briefly. Now we examine it in depth, because it is how many of the most vital substances - glucose, amino acids, and ions - actually cross into your cells.

My Socratic question: glucose is your cells' main fuel and must enter constantly, yet glucose is water-soluble and cannot dissolve through the oily membrane core. It also moves without the cell spending energy. How can something cross a barrier it cannot dissolve through, without any energy?

The answer is facilitated diffusion: a membrane protein provides a passage, and the glucose moves through it down its concentration gradient, driven by the gradient alone. The protein solves the "cannot cross the lipid" problem; the gradient solves the "how does it move" problem, for free.

Crucial insight: facilitated diffusion is the passive movement of a substance down its concentration gradient through a specific membrane transport protein. It exists to move substances that are essential but cannot cross the lipid bilayer directly - and it does so without energy, using the gradient. This combination of protein-mediated yet passive is exactly what makes it distinctive, and often confusing, so we study it carefully.` },

    { q: "The defining features: passive but protein-dependent.",
      body: `Facilitated diffusion sits in an interesting position - it shares one feature with simple diffusion and one with active transport, and pinning down exactly which is the key to mastering it.

Like simple diffusion, and unlike active transport, facilitated diffusion is passive: it moves substances down their concentration gradient, from high to low, and uses no ATP. Like active transport, and unlike simple diffusion, it requires a membrane protein, because the substances it moves cannot cross the lipid alone.

My Socratic question: a student says "it uses a protein, so it must be active transport." Why is this wrong, and what is the single feature that actually decides passive versus active?

The answer is that the use of a protein does not determine whether transport is active or passive - the direction relative to the gradient does. Facilitated diffusion moves substances down the gradient, so it is passive regardless of the protein. Only movement up the gradient, against the natural flow, requires energy and defines active transport.

Crucial insight: facilitated diffusion is passive because of its direction (down the gradient), and protein-dependent because of its cargo (substances that cannot cross the lipid). Never let the presence of a protein trick you into calling it active - the gradient direction is the sole test. This is the single most important and most tested idea in the topic.` },

    { q: "The two kinds of transport protein: channels and carriers.",
      body: `Facilitated diffusion is carried out by two distinct types of membrane protein, and distinguishing them is essential.

Channel proteins form a water-filled pore or tunnel through the membrane, through which specific substances - usually ions - can pass. They are like an open doorway; substances flow through quickly when the channel is open. Carrier proteins, by contrast, bind the specific substance on one side, then change shape to move it to the other side and release it - like a revolving door that must turn for each passenger. Carriers move substances like glucose and amino acids.

My Socratic question: which type would you expect to move substances faster, and why?

The answer is that channels are faster, because substances simply flow through an open pore, while carriers are slower because each must physically change shape for every molecule it moves - a revolving door is slower than an open doorway. This is why ions, which must move rapidly, use channels.

Crucial insight: facilitated diffusion uses channel proteins (fast, water-filled pores, mainly for ions) and carrier proteins (slower, shape-changing, for larger solutes like glucose). Both move substances down the gradient without energy; they differ in mechanism and speed. Recognising which type a substance uses, and why, is central to understanding facilitated diffusion.` },

    { q: "Specificity: each protein for its own substance.",
      body: `A crucial property of these transport proteins is that they are highly selective - each one moves only a particular substance or class of substances, and this specificity has major consequences.

Transport proteins have a specific shape and binding site that fits only certain substances, the way a lock fits only its key. A glucose carrier moves glucose but not amino acids; a potassium channel passes potassium but not sodium. This is why the membrane can control precisely which substances enter and leave.

My Socratic question: why is this specificity essential for the cell rather than just an interesting detail?

The answer is that specificity is what makes the membrane selectively permeable in a controlled way. If proteins moved anything, the cell could not regulate its internal composition; because each protein moves only its own substance, the cell decides exactly what crosses by choosing which proteins it makes and opens. Specificity turns transport from a leak into a control system.

Crucial insight: transport proteins are substance-specific, each recognising and moving only its particular cargo through a matching binding site. This selectivity is the basis of the cell's precise control over its contents, and it explains why a defect in one specific transport protein can cause disease by blocking one substance while leaving others unaffected.` },

    { q: "Saturation: why facilitated diffusion has a speed limit.",
      body: `Here is a property that sharply distinguishes facilitated diffusion from simple diffusion, and it is a favourite of examiners: facilitated diffusion can be saturated.

In simple diffusion, the rate of movement increases steadily as the concentration gradient increases - more gradient, more movement, without limit. But in facilitated diffusion, the rate rises with the gradient only up to a point, then levels off at a maximum, no matter how much steeper the gradient becomes.

My Socratic question: why does facilitated diffusion reach a maximum rate while simple diffusion does not?

The answer is that facilitated diffusion depends on a limited number of transport proteins. When every protein is working as fast as it can - when they are all occupied - adding more substance cannot speed things up, because there are no free proteins to carry it. The transport is saturated, like a car park that is full: more cars arriving cannot get in until spaces free up. Simple diffusion has no such limit because it needs no proteins.

Crucial insight: facilitated diffusion shows saturation - a maximum transport rate set by the number of transport proteins - whereas simple diffusion has no maximum. This saturation is direct evidence that proteins are involved, and distinguishing the two by their rate-versus-gradient behaviour is a classic exam question.` },

    { q: "Glucose transport: the essential worked example.",
      body: `Let us ground all of this in the single most important example of facilitated diffusion in the body: the uptake of glucose into cells.

Glucose is the primary fuel of most cells, yet it is water-soluble and cannot cross the lipid membrane. Cells therefore use glucose carrier proteins, called GLUT transporters, which bind glucose on the outside where it is abundant and release it inside where it is scarce - moving it down its gradient, no energy needed.

My Socratic question: after a meal, blood glucose is high; the hormone insulin causes muscle and fat cells to insert more glucose transporters into their membranes. How does this help control blood sugar, and what does it tell you about facilitated diffusion?

The answer is that more transporters mean more glucose can enter cells by facilitated diffusion, lowering blood glucose - and it shows that the cell controls facilitated diffusion by controlling how many transport proteins are present. Facilitated diffusion is passive, but the cell still regulates it by adjusting protein numbers.

Crucial insight: glucose uptake by GLUT carriers is the defining example of facilitated diffusion - passive, carrier-mediated, down the gradient - and its regulation by insulin links directly to blood sugar control and diabetes. When insulin fails, as in diabetes, glucose cannot enter cells efficiently and blood glucose rises - a facilitated-diffusion problem with whole-body consequences you will measure in the laboratory.` },

    { q: "Comparing the three passive routes.",
      body: `To lock in your understanding, compare facilitated diffusion directly with the other passive mechanisms, since exams love asking you to distinguish them.

Simple diffusion moves small non-polar substances (oxygen, carbon dioxide) directly through the lipid, no protein, no saturation. Facilitated diffusion moves substances that cannot cross the lipid (glucose, ions) through proteins, showing specificity and saturation, but still down the gradient with no energy. Osmosis is the specific case of water moving across the membrane toward the more concentrated solution.

My Socratic question: all three are passive and need no energy. What single feature most clearly separates facilitated diffusion from simple diffusion in an experiment?

The answer is saturation: if the transport rate levels off at a maximum as concentration rises, a limited number of proteins is involved, so it is facilitated diffusion; if the rate keeps rising without limit, it is simple diffusion. Specificity is another distinguishing sign - facilitated diffusion is selective, simple diffusion is not.

Crucial insight: all passive transport moves down the gradient without energy, but they differ in mechanism - simple diffusion needs no protein and does not saturate; facilitated diffusion needs a specific protein and does saturate; osmosis moves water. Being able to tell them apart by protein-dependence, specificity and saturation is exactly the discrimination exams demand.` },

    { q: "Gated channels: doors that open and close.",
      body: `Not all channel proteins stay permanently open. Many are gated - they open and close in response to signals - and this refinement is essential for understanding nerves and muscles later.

A gated channel has a gate that controls whether the pore is open or shut, so the cell can allow facilitated diffusion at some moments and block it at others. There are three main kinds. Voltage-gated channels open or close in response to changes in the electrical charge across the membrane. Ligand-gated (chemically gated) channels open when a specific molecule, such as a neurotransmitter, binds to them. Mechanically gated channels open in response to physical force, such as stretch or pressure.

My Socratic question: why is a gate so valuable - why not simply leave every channel open all the time?

The answer is that control requires the ability to say no as well as yes. If channels were always open, ions would flow constantly and the cell could never build up or hold a gradient, nor generate the sudden, timed ion movements that produce nerve impulses and muscle contractions. The gate lets the cell open the door only at the right moment.

Crucial insight: gated channels open and close in response to voltage, chemical signals, or mechanical force, giving the cell precise control over when facilitated diffusion of ions occurs. This timed, controllable ion movement is the very basis of nerve impulses and muscle contraction, so the humble gated channel is the foundation of the excitable tissues you will soon study.` },

    { q: "When facilitated diffusion fails: clinical relevance.",
      body: `Because facilitated diffusion depends on specific proteins, a fault in a single transport protein can cause disease - which makes this topic directly relevant to your future diagnostic work.

My Socratic question: if a person inherited a defective glucose transport protein, what would happen, and why would only glucose handling be affected and not, say, oxygen uptake?

The answer is that glucose could not be moved efficiently into or across cells, causing disease, while oxygen would be unaffected because oxygen uses simple diffusion, not a protein - so a protein defect touches only the substance that protein carries. This is the consequence of specificity: each transporter serves one cargo, so its failure is specific.

Real examples exist: in some inherited disorders, defective glucose transporters in the gut or kidney impair glucose absorption or cause glucose to be lost in urine; and the failure of insulin-regulated glucose uptake underlies the high blood glucose of diabetes. All are facilitated-diffusion problems.

Crucial insight: because facilitated diffusion is protein-specific, defects in transport proteins cause specific diseases affecting only their particular substance - a direct clinical consequence of the specificity you learned. Recognising that a laboratory finding, like glucose in the urine, can reflect a transport-protein problem is exactly the kind of mechanistic reasoning that makes a skilled laboratory scientist.` },

    { q: "Consolidation and your final test.",
      body: `Your cognitive map for facilitated diffusion, in five lines.

The definition: facilitated diffusion is the passive movement of a substance down its concentration gradient through a specific membrane transport protein, needed for substances that cannot cross the lipid alone.

The crucial classification: it is passive because of its direction (down the gradient, no energy), and protein-dependent because of its cargo - the protein never makes it active; only movement up the gradient does.

The machinery: channel proteins (fast, water-filled pores, mainly ions) and carrier proteins (slower, shape-changing, for glucose and amino acids), both highly specific to their substance.

The signature: saturation - a maximum rate set by the number of proteins - which simple diffusion lacks; together with specificity, this is how facilitated diffusion is identified.

The relevance: glucose uptake by GLUT carriers, regulated by insulin, is the key example, and defects in specific transport proteins cause specific diseases - the mechanistic basis of findings like glucose in the urine.

Now your final test. In an experiment, a substance crosses a membrane down its concentration gradient without any energy. As its concentration outside is increased, its rate of entry rises at first but then levels off at a fixed maximum and cannot go higher.

Question one: is this simple or facilitated diffusion, and what single feature of the result proves it?
Question two: what does the levelling-off (maximum rate) tell you about the mechanism at the molecular level?
Question three: is energy involved, and what does that make this transport - passive or active - despite the protein being required?

Work them through before reading on.

My answers. One: it is facilitated diffusion, proven by the saturation - the rate levelling off at a maximum, which simple diffusion never does. Two: the maximum rate means a limited number of transport proteins are involved; once all of them are occupied and working at full speed, adding more substance cannot increase the rate, because there are no free proteins to carry it. Three: no energy is involved, because the substance moves down its gradient; this makes the transport passive, and the requirement for a protein does not change that - only movement against the gradient would make it active.

If those came cleanly, you have mastered the mechanism that feeds your cells their glucose and lets ions cross - passive, specific, saturable, protein-mediated. Active transport, which moves substances the hard way, uphill, is the natural next step.` },
  ],
  theory: [
    { q: "Define facilitated diffusion.", a: "Facilitated diffusion is the passive movement of a substance down its concentration gradient through a specific membrane transport protein. It moves substances that cannot cross the lipid bilayer directly (such as glucose and ions) but requires no energy, since the movement is down the gradient." },
    { q: "Why is facilitated diffusion classified as passive despite using a protein?", a: "Because the substance moves down its concentration gradient (from high to low), which requires no energy. The presence of a protein does not make transport active; only movement up the gradient, against the natural flow, requires energy and defines active transport. Direction, not the protein, is the deciding feature." },
    { q: "Distinguish channel proteins from carrier proteins.", a: "Channel proteins form a water-filled pore through which substances (usually ions) flow quickly when open, like an open doorway. Carrier proteins bind a substance, change shape to move it across, then release it - like a revolving door - and are slower; they move larger solutes like glucose and amino acids." },
    { q: "Why are channel proteins generally faster than carrier proteins?", a: "Because substances simply flow through an open channel pore, whereas a carrier must physically change shape for each molecule it moves. An open doorway passes many quickly; a revolving door must turn for each passenger, so carriers are slower." },
    { q: "Explain the specificity of transport proteins and why it matters.", a: "Each transport protein has a specific shape and binding site that fits only certain substances, like a lock and key, so it moves only its particular cargo. This specificity lets the cell precisely control which substances cross by choosing which proteins it makes and opens, turning transport into a control system rather than a leak." },
    { q: "What is saturation in facilitated diffusion, and why does it occur?", a: "Saturation is the levelling-off of transport rate at a maximum as substance concentration rises, no matter how steep the gradient becomes. It occurs because there is a limited number of transport proteins; once all are occupied and working at full speed, adding more substance cannot increase the rate. Simple diffusion has no such limit." },
    { q: "How does saturation distinguish facilitated diffusion from simple diffusion?", a: "In simple diffusion the rate rises steadily with the gradient without limit, because no proteins are needed. In facilitated diffusion the rate rises then reaches a maximum, because the limited transport proteins become saturated. A levelling-off at a maximum rate is evidence that proteins are involved." },
    { q: "Describe how glucose enters cells and how insulin regulates it.", a: "Glucose enters by facilitated diffusion through GLUT carrier proteins, which bind glucose outside (where it is abundant) and release it inside (where it is scarce), moving it down its gradient with no energy. Insulin causes muscle and fat cells to insert more glucose transporters, increasing glucose uptake and lowering blood glucose - showing the cell regulates facilitated diffusion by adjusting protein numbers." },
    { q: "Why does a defect in one transport protein affect only one substance?", a: "Because transport proteins are specific - each carries only its particular cargo. A defective glucose transporter impairs glucose handling but leaves oxygen unaffected, since oxygen uses simple diffusion rather than a protein. Specificity means each transporter's failure affects only its own substance." },
    { q: "Compare the three passive transport mechanisms.", a: "Simple diffusion moves small non-polar substances (oxygen, carbon dioxide) directly through the lipid, with no protein and no saturation. Facilitated diffusion moves substances that cannot cross the lipid (glucose, ions) through specific proteins, showing specificity and saturation, but still down the gradient without energy. Osmosis is the movement of water toward the more concentrated solution." },
  ],
  videos: [
    { channel: "Physiology", title: "Facilitated Diffusion Channels and Carriers", note: "The two protein types and how each moves its cargo.", url: "" },
    { channel: "Physiology", title: "Simple vs Facilitated Diffusion Saturation", note: "How saturation and specificity distinguish the two.", url: "" },
    { channel: "Physiology", title: "GLUT Glucose Transporters and Insulin", note: "The key glucose example and its regulation.", url: "" },
  ],
  mcqs: [
    { q: "Facilitated diffusion moves substances:", o: ["Only in vesicles", "Down the gradient through a protein, no energy", "Directly through the lipid", "Up the gradient using ATP"], a: 1, w: "It is passive, protein-mediated, down the gradient." },
    { q: "Facilitated diffusion is needed for substances that:", o: ["Cannot cross the lipid bilayer directly", "Dissolve in oil", "Are gases", "Are small and non-polar"], a: 0, w: "Water-soluble or charged substances need a protein pathway." },
    { q: "Facilitated diffusion is classified as passive because it:", o: ["Moves substances down their gradient with no energy", "Moves glucose", "Uses a protein", "Is slow"], a: 0, w: "Direction down the gradient makes it passive, not the protein." },
    { q: "A student calls facilitated diffusion 'active' because it uses a protein. This is wrong because:", o: ["Only movement against the gradient makes transport active", "It is very fast", "Proteins are never used", "It moves water"], a: 0, w: "The gradient direction, not the protein, decides active vs passive." },
    { q: "A water-filled pore through the membrane is a:", o: ["Vesicle", "Carrier protein", "Channel protein", "Phospholipid"], a: 2, w: "Channel proteins form pores for substances to flow through." },
    { q: "A protein that binds a substance and changes shape to move it is a:", o: ["Carrier protein", "Lipid", "Pore", "Channel protein"], a: 0, w: "Carrier proteins bind, change shape, and release the substance." },
    { q: "Channel proteins mainly transport:", o: ["Ions", "Large proteins", "Fats", "Whole cells"], a: 0, w: "Channels are fast pores well suited to ions." },
    { q: "Carrier proteins typically move substances such as:", o: ["Carbon dioxide", "Nothing", "Glucose and amino acids", "Oxygen"], a: 2, w: "Carriers move larger solutes like glucose and amino acids." },
    { q: "Channel proteins are generally faster than carriers because:", o: ["They move water", "They are bigger", "They use ATP", "Substances flow through an open pore rather than needing a shape change"], a: 3, w: "An open pore is faster than a shape-changing revolving door." },
    { q: "Transport proteins are described as specific because they:", o: ["Never bind substances", "Move only their particular substance, like a lock and key", "Are all identical", "Move anything"], a: 1, w: "Each protein's binding site fits only certain substances." },
    { q: "Specificity of transport proteins allows the cell to:", o: ["Ignore gradients", "Control precisely which substances cross", "Leak freely", "Stop all transport"], a: 1, w: "Selecting which proteins to use controls what enters and leaves." },
    { q: "Saturation in facilitated diffusion means the transport rate:", o: ["Rises forever", "Reaches a maximum and levels off", "Is always zero", "Never changes"], a: 1, w: "The rate levels off at a maximum as proteins become fully occupied." },
    { q: "Saturation occurs because:", o: ["Energy runs out", "Water is used up", "The gradient disappears", "There is a limited number of transport proteins"], a: 3, w: "When all proteins are occupied, the rate cannot increase." },
    { q: "Which shows saturation as concentration rises?", o: ["Neither", "Simple diffusion", "Both equally", "Facilitated diffusion"], a: 3, w: "Facilitated diffusion saturates; simple diffusion does not." },
    { q: "A transport rate that keeps rising without limit indicates:", o: ["Simple diffusion", "Osmosis", "Active transport", "Facilitated diffusion"], a: 0, w: "No saturation means no limiting proteins - simple diffusion." },
    { q: "Glucose enters most cells by:", o: ["Facilitated diffusion via GLUT carriers", "Osmosis", "Simple diffusion", "Phagocytosis"], a: 0, w: "GLUT carrier proteins move glucose down its gradient." },
    { q: "GLUT transporters move glucose:", o: ["As a gas", "Only out of cells", "Down its gradient with no energy", "Up its gradient with ATP"], a: 2, w: "Glucose moves down its gradient - facilitated diffusion, no energy." },
    { q: "Insulin increases glucose uptake by:", o: ["Adding ATP", "Heating the cell", "Causing cells to insert more glucose transporters", "Removing glucose"], a: 2, w: "More transporters allow more facilitated diffusion of glucose." },
    { q: "That insulin regulates transporter numbers shows the cell:", o: ["Ignores glucose", "Cannot control facilitated diffusion", "Uses no proteins", "Regulates facilitated diffusion by adjusting protein numbers"], a: 3, w: "Protein number sets the capacity of facilitated diffusion." },
    { q: "In diabetes, impaired insulin action causes:", o: ["No effect", "Low blood glucose", "Faster oxygen uptake", "Glucose failing to enter cells, raising blood glucose"], a: 3, w: "Poor glucose uptake by facilitated diffusion raises blood glucose." },
    { q: "Which distinguishes facilitated from simple diffusion in an experiment?", o: ["Both need energy", "Simple diffusion uses proteins", "Facilitated diffusion moves gases", "Facilitated diffusion saturates and is specific"], a: 3, w: "Saturation and specificity mark facilitated diffusion." },
    { q: "Oxygen is unaffected by a glucose-transporter defect because oxygen uses:", o: ["Osmosis", "Active transport", "Simple diffusion, needing no protein", "The same carrier"], a: 2, w: "Oxygen crosses by simple diffusion, so a protein defect does not affect it." },
    { q: "A defect in a specific transport protein causes disease affecting:", o: ["All substances", "Only that protein's particular substance", "Only gases", "Nothing"], a: 1, w: "Specificity means one transporter's failure affects only its cargo." },
    { q: "Glucose appearing in the urine can reflect:", o: ["A glucose transport-protein problem", "Fast diffusion of gases", "Too much water", "Normal oxygen transport"], a: 0, w: "Defective glucose transporters can let glucose escape into urine." },
    { q: "Osmosis differs from facilitated diffusion in that osmosis specifically moves:", o: ["Glucose", "Oxygen", "Ions", "Water"], a: 3, w: "Osmosis is the movement of water across the membrane." },
    { q: "All passive transport mechanisms share that they:", o: ["Use ATP", "Move substances down the gradient with no energy", "Move only water", "Need vesicles"], a: 1, w: "Passive transport is always down the gradient and energy-free." },
    { q: "Compared with a carrier, an ion channel is:", o: ["Energy-using", "Faster, a simple open pore", "Slower", "Specific to glucose"], a: 1, w: "Channels pass ions quickly through an open pore." },
    { q: "The cargo that facilitated diffusion is best known for moving is:", o: ["Oxygen", "Glucose", "Fats", "Carbon dioxide"], a: 1, w: "Glucose is the classic facilitated-diffusion substance." },
    { q: "Facilitated diffusion requires which two things to occur?", o: ["ATP and a vesicle", "A duct and a gland", "A concentration gradient and a specific protein", "Heat and light"], a: 2, w: "It needs a favourable gradient and a matching transport protein." },
    { q: "The single test for whether transport is active or passive is:", o: ["The temperature", "Whether a protein is used", "The direction relative to the concentration gradient", "The speed"], a: 2, w: "Down the gradient is passive; up the gradient is active." },
  ],
};

/* --------------------------- phy:4 --------------------------- */
const T_PHY_ACTIVE = {
  courseId: "phy",
  topicIndex: 4,
  title: "Active Transport",
  minutes: 16,
  note: [
    { q: "The transport that goes the hard way: uphill.",
      body: `You have mastered passive transport, where substances flow downhill for free. Now we meet its opposite and its complement: active transport, the movement of substances the hard way - uphill, against their gradient - which costs the cell energy but makes precise control of the internal environment possible.

My Socratic question: your cells keep sodium low inside and potassium high inside, even though sodium is high outside and potassium is low outside. Left alone, both would leak down their gradients until the differences vanished. How does the cell maintain these differences against the constant leak?

The answer is active transport - the cell continuously pumps sodium out and potassium in, against their gradients, spending energy to do so. Without this constant uphill pumping, the gradients would collapse and the cell would lose the very differences that make it alive.

Crucial insight: active transport is the movement of a substance against its concentration gradient - from low to high concentration - using energy, usually from ATP. It exists because homeostasis often requires holding substances at concentrations very different from the surroundings, which passive transport, always moving toward equality, can never achieve. Active transport is how the cell defies the natural drift toward sameness.` },

    { q: "Why moving uphill must cost energy.",
      body: `The defining feature of active transport is its energy requirement, and understanding why it needs energy - while passive transport does not - is the heart of the topic.

My Socratic question: passive transport moves substances down their gradient using only the free energy of random motion. Why can the same random motion not move substances up their gradient too?

The answer is that random motion naturally spreads substances from crowded to less crowded regions - from high to low concentration - because statistically more particles move away from a crowd than into it. Moving substances the other way, gathering them from a less crowded region into an already crowded one, is against this natural statistical flow. It does not happen by itself, just as a ball never rolls uphill on its own. To force it, the cell must supply energy, exactly as you must supply energy to push a ball uphill.

Crucial insight: active transport requires energy because it moves substances against the natural direction of diffusion, up the concentration gradient, which random motion will never do unaided. The energy, usually from ATP, is the price of defying diffusion. This is the fundamental reason passive transport is free and active transport is not - direction relative to the gradient decides everything.` },

    { q: "Primary active transport: ATP directly.",
      body: `Active transport comes in two forms, distinguished by where the energy comes from. The first and most direct is primary active transport.

In primary active transport, the transport protein uses energy directly from ATP - it splits ATP and uses the energy released to change its shape and move the substance against its gradient. The protein that does this is often called a pump, because it pumps substances uphill.

My Socratic question: the most important pump in the body, present in every cell, moves sodium and potassium. What is it called, and what exactly does it do?

The answer is the sodium-potassium pump (the Na-K-ATPase). Using the energy from one ATP, it pumps three sodium ions out of the cell and two potassium ions in - both against their gradients. It runs constantly in every cell, and a large share of your body's entire energy budget is spent keeping it running.

Crucial insight: primary active transport uses ATP directly to pump substances against their gradients, the sodium-potassium pump being the supreme example - three sodium out, two potassium in, per ATP. This one pump maintains the fundamental ion gradients of every cell, powers nerve and muscle function, and, as you will see, provides the energy for a second, cleverer kind of active transport.` },

    { q: "The sodium-potassium pump: the cell's master pump.",
      body: `The sodium-potassium pump deserves deep attention, because it does more than maintain gradients - it underlies much of physiology.

The pump maintains low sodium and high potassium inside the cell. This has several vital consequences. It creates the ion gradients that make nerve and muscle cells electrically excitable - able to generate impulses. It keeps the cell from swelling: by pumping out sodium, it controls the cell's water content and prevents it bursting from osmosis. And, crucially, it builds a steep sodium gradient - lots of sodium outside, little inside - that stores energy the cell can use elsewhere.

My Socratic question: the pump moves three positive sodium ions out but only two positive potassium ions in, per cycle. What is the electrical consequence of that unequal exchange?

The answer is that each cycle removes a net of one positive charge from the cell, making the inside slightly more negative than the outside. The pump is therefore electrogenic - it directly contributes to the electrical charge difference across the membrane, which is the basis of the resting membrane potential you will study next.

Crucial insight: the sodium-potassium pump maintains ion gradients, controls cell volume, and is electrogenic, contributing to the membrane's electrical charge - and it stores energy in the sodium gradient. It is not just one pump among many; it is the foundation of excitability, volume control, and secondary active transport. Understanding it deeply unlocks much of physiology.` },

    { q: "Secondary active transport: spending the stored energy.",
      body: `The second form of active transport is more subtle and elegant - it does not use ATP directly, but rides on the energy the sodium pump already stored. This is secondary active transport.

Recall that the sodium-potassium pump builds a steep sodium gradient, with much more sodium outside than inside. Sodium therefore constantly tends to rush back in, down its gradient. Secondary active transport harnesses that inward rush: as sodium flows back in down its gradient, it drags another substance along with it, even pushing that substance up its own gradient.

My Socratic question: this moves the second substance against its gradient without using ATP directly. So why is it still called active transport, and where did the energy really come from?

The answer is that it is active because the second substance is moved up its gradient, which always requires energy - but the energy came indirectly from ATP, which the sodium pump used earlier to build the sodium gradient. The pump pays with ATP once; secondary active transport then spends that stored energy. So ATP is the ultimate source, just used at one remove.

Crucial insight: secondary active transport moves a substance up its gradient by coupling it to sodium flowing down its gradient, using energy stored by the sodium pump rather than ATP directly. It is active because a substance still moves uphill; the energy is simply borrowed from the pump's earlier work. This clever mechanism absorbs glucose and amino acids from your gut and kidneys.` },

    { q: "Symport and antiport: two directions of coupling.",
      body: `Secondary active transport comes in two arrangements, depending on whether the coupled substance moves in the same direction as sodium or the opposite. Both are examinable.

In symport (cotransport), the driving ion (sodium) and the transported substance move in the same direction - both into the cell. The classic example is the absorption of glucose from the gut: sodium rushing in drags glucose in with it, even against glucose's own gradient. In antiport (countertransport or exchange), the driving ion and the transported substance move in opposite directions - as sodium moves in, the other substance is pushed out. An example is the sodium-calcium exchanger, which uses incoming sodium to pump calcium out.

My Socratic question: in the gut, glucose is absorbed into intestinal cells even when glucose is already more concentrated inside them. Which mechanism achieves this, and what powers it?

The answer is sodium-glucose symport (cotransport): sodium flowing in down its steep gradient drags glucose in against glucose's gradient, powered ultimately by the sodium-potassium pump that keeps intracellular sodium low. This is how you absorb the last of the glucose from your food.

Crucial insight: secondary active transport is either symport (both move the same way, like sodium-glucose cotransport in the gut) or antiport (they move oppositely, like the sodium-calcium exchanger). Both are powered by the sodium gradient. Recognising which arrangement a transporter uses, and that the sodium pump ultimately powers it, is core physiology and the basis of nutrient absorption.` },

    { q: "The energy cost: why pumps dominate your metabolism.",
      body: `An easily overlooked but striking fact about active transport is how expensive it is - it consumes a large share of the energy your whole body produces, which reveals just how vital it is.

The sodium-potassium pump runs continuously in every one of your trillions of cells, each pump cycle costing one ATP. Because the pump must run constantly to counter the never-ending leak of ions down their gradients, the cumulative cost is enormous - a substantial fraction of your resting energy expenditure goes simply to keeping these pumps running.

My Socratic question: why would the body spend so much of its precious energy on pumping ions that just leak back again - is this not wasteful?

The answer is that it is not waste but the price of being alive and excitable. The ion gradients the pump maintains are what allow nerves to fire, muscles to contract, cells to hold their volume, and nutrients to be absorbed. A cell that stopped pumping to save energy would lose its gradients, swell, and die. The constant expenditure buys the constant readiness of every excitable and living cell.

Crucial insight: active transport, especially the sodium-potassium pump, consumes a large portion of the body's energy because it must run ceaselessly against continuous ion leak - and this cost is the price of life, excitability, and absorption. It also explains why tissues that pump heavily, like the kidney and nervous system, have such high energy demands, a fact reflected in the metabolism you will study and the lab values you will interpret.` },

    { q: "Comparing active and passive transport side by side.",
      body: `To consolidate, let us contrast active and passive transport directly across every feature, since telling them apart is the single most tested skill.

Passive transport moves substances down their gradient, requires no energy, and includes simple diffusion, facilitated diffusion, and osmosis. Active transport moves substances up their gradient, requires energy, and includes primary active transport (ATP directly, the sodium-potassium pump), secondary active transport (sodium-coupled, symport and antiport), and bulk transport.

My Socratic question: you observe a substance being moved from a region where it is scarce to a region where it is already abundant, and you find that blocking ATP production stops the movement. What two things does this tell you?

The answer is that the movement is active transport - proven both by its direction (up the gradient, low to high) and by its dependence on ATP, since blocking energy production stops it. Passive transport would continue regardless of ATP because it needs none.

Crucial insight: active and passive transport are distinguished by direction (up versus down the gradient) and energy (required versus not) - and blocking ATP stops active transport while leaving passive transport unaffected. This experimental test, stopping energy production and seeing what stops, is exactly how physiologists and examiners probe which mechanism is at work.` },

    { q: "Why active transport matters throughout the body.",
      body: `Active transport is not an isolated cellular curiosity - it underlies whole-body functions and much of clinical medicine, connecting directly to your future work.

Consider its reach. In the kidneys, active transport reabsorbs glucose, ions and nutrients from the urine back into the blood, preventing their loss. In the gut, it absorbs glucose and amino acids from digested food. In nerves and muscles, the ion gradients it maintains make electrical signalling and contraction possible. In every cell, it controls volume and composition.

My Socratic question: the heart drug digoxin works by partially blocking the sodium-potassium pump in heart muscle. Given what the pump does, why might blocking it affect the heart's function?

The answer is that blocking the pump changes the sodium gradient, which in turn alters the sodium-calcium exchanger (an antiport), raising calcium inside heart muscle cells and strengthening the heartbeat. A drug acting on one pump ripples through the coupled transport systems - a direct clinical application of exactly what you have learned.

Crucial insight: active transport underlies kidney reabsorption, nutrient absorption, nerve and muscle function, and cell volume control, and it is a target of real medicines like digoxin. The mechanisms you are learning are not abstract - they explain how the body works and how drugs act, and they generate the laboratory values (electrolytes, glucose) you will one day measure and interpret.` },

    { q: "Consolidation and your final test.",
      body: `Your cognitive map for active transport, in five lines.

The definition: active transport moves a substance against its concentration gradient, from low to high, using energy - it defies diffusion, which passive transport never does.

Why it costs energy: moving up the gradient is against the natural statistical flow of random motion, so energy (usually ATP) must be supplied, exactly as pushing a ball uphill requires effort.

Primary active transport: uses ATP directly; the sodium-potassium pump is supreme - three sodium out, two potassium in per ATP - maintaining gradients, controlling volume, and being electrogenic.

Secondary active transport: uses energy stored in the sodium gradient rather than ATP directly, coupling a substance to sodium flowing in - as symport (same direction, like sodium-glucose cotransport) or antiport (opposite directions, like sodium-calcium exchange).

The distinction and relevance: active transport goes up the gradient and needs energy (blocking ATP stops it); passive goes down and does not - and active transport underlies kidney reabsorption, gut absorption, excitability, and drug action.

Now your final test. In the intestine, glucose is absorbed into a cell even though glucose is already more concentrated inside that cell than in the gut. This absorption stops if the sodium-potassium pump is poisoned, even though the poison does not directly touch the glucose transporter.

Question one: is glucose being moved by passive or active transport here, and how do you know from the direction?
Question two: name the specific mechanism and arrangement moving the glucose, and state what directly powers it.
Question three: explain why poisoning the sodium-potassium pump stops glucose absorption, even though the pump does not directly move glucose - and identify the true source of the energy.

Work them through before reading on.

My answers. One: glucose is being moved by active transport, because it is going up its gradient - from lower concentration in the gut to higher concentration inside the cell - and movement against the gradient always requires energy and defines active transport. Two: the mechanism is secondary active transport by sodium-glucose symport (cotransport), in which sodium flowing into the cell down its gradient drags glucose in alongside it; it is directly powered by the inward sodium gradient. Three: poisoning the sodium-potassium pump stops it maintaining the low intracellular sodium, so the steep sodium gradient collapses; without that gradient, sodium no longer rushes in to drag glucose with it, and absorption stops - revealing that the true energy source is the ATP the pump uses to build the sodium gradient in the first place.

If those came cleanly, you understand how cells move substances uphill to defy diffusion and maintain life against the drift toward sameness - the pumps and coupled transporters behind excitability, absorption, and much of medicine. The resting membrane potential, built directly on these gradients, is the natural next step.` },
  ],
  theory: [
    { q: "Define active transport.", a: "Active transport is the movement of a substance against its concentration gradient - from low to high concentration - using energy, usually from ATP. It allows the cell to hold substances at concentrations very different from the surroundings, which passive transport can never achieve." },
    { q: "Why does active transport require energy while passive transport does not?", a: "Because active transport moves substances up their gradient, against the natural statistical flow of random motion, which never happens unaided - like pushing a ball uphill. Passive transport moves substances down their gradient, which random motion drives for free. Direction relative to the gradient determines whether energy is needed." },
    { q: "Describe primary active transport and its key example.", a: "In primary active transport, the transport protein uses energy directly from ATP, splitting it to change shape and pump a substance against its gradient. The key example is the sodium-potassium pump (Na-K-ATPase), which uses one ATP to pump three sodium ions out of the cell and two potassium ions in, both against their gradients." },
    { q: "State three functions of the sodium-potassium pump.", a: "It maintains the ion gradients (low sodium, high potassium inside) that make nerve and muscle cells electrically excitable; it controls cell volume and prevents osmotic bursting by pumping out sodium; and it builds a steep sodium gradient that stores energy for secondary active transport. It is also electrogenic, contributing to the membrane potential." },
    { q: "Why is the sodium-potassium pump described as electrogenic?", a: "Because it pumps out three positive sodium ions but brings in only two positive potassium ions per cycle, removing a net of one positive charge from the cell each cycle. This makes the inside slightly more negative than the outside, directly contributing to the electrical charge difference across the membrane (the resting membrane potential)." },
    { q: "Explain secondary active transport.", a: "Secondary active transport moves a substance up its gradient without using ATP directly. Instead it couples that substance to sodium flowing back into the cell down the steep gradient built by the sodium-potassium pump; the inward rush of sodium drags the substance along, even uphill. It is active because the substance moves against its gradient, but the energy comes indirectly from the ATP the pump used earlier." },
    { q: "Distinguish symport from antiport.", a: "In symport (cotransport), the driving ion (sodium) and the transported substance move in the same direction, both into the cell - for example sodium-glucose cotransport in the gut. In antiport (countertransport), they move in opposite directions - as sodium moves in, the other substance is pushed out - for example the sodium-calcium exchanger." },
    { q: "How is glucose absorbed from the gut against its gradient?", a: "By secondary active transport using sodium-glucose symport (cotransport): sodium flowing into the intestinal cell down its steep gradient drags glucose in with it, even against glucose's own gradient. This is powered ultimately by the sodium-potassium pump, which keeps intracellular sodium low and so maintains the sodium gradient." },
    { q: "What experimental test distinguishes active from passive transport?", a: "Blocking ATP (energy) production stops active transport but leaves passive transport unaffected, since passive transport needs no energy. Combined with observing direction - active transport moves substances up the gradient (low to high), passive moves them down - this identifies which mechanism is at work." },
    { q: "Give two body-wide roles of active transport and one clinical example.", a: "Active transport reabsorbs glucose, ions and nutrients in the kidneys and absorbs glucose and amino acids in the gut; it maintains the ion gradients needed for nerve and muscle function and controls cell volume. Clinically, the drug digoxin partially blocks the sodium-potassium pump in heart muscle, altering the sodium-calcium exchanger to raise intracellular calcium and strengthen the heartbeat." },
  ],
  videos: [
    { channel: "Physiology", title: "Active Transport and the Sodium Potassium Pump", note: "Primary active transport and the master pump in detail.", url: "" },
    { channel: "Physiology", title: "Secondary Active Transport Symport Antiport", note: "How the sodium gradient powers uphill transport of glucose.", url: "" },
    { channel: "Physiology", title: "Sodium Glucose Cotransport in the Gut", note: "The key example of secondary active transport in absorption.", url: "" },
  ],
  mcqs: [
    { q: "Active transport moves substances:", o: ["Only water", "Only gases", "Up the gradient, using energy", "Down the gradient, no energy"], a: 2, w: "Active transport moves substances against the gradient using energy." },
    { q: "Active transport is needed when the cell must:", o: ["Hold substances at concentrations different from the surroundings", "Let substances reach equality", "Stop all transport", "Move only oxygen"], a: 0, w: "Maintaining differences against diffusion requires active transport." },
    { q: "Active transport requires energy because it:", o: ["Is slow", "Moves substances against the natural direction of diffusion", "Moves water", "Uses proteins"], a: 1, w: "Going up the gradient defies random motion and needs energy." },
    { q: "The usual energy source for active transport is:", o: ["ATP", "Heat", "Sound", "Light"], a: 0, w: "ATP provides the energy for active transport." },
    { q: "In primary active transport, energy comes:", o: ["From the sodium gradient", "From osmosis", "From diffusion", "Directly from ATP"], a: 3, w: "Primary active transport uses ATP directly." },
    { q: "The most important pump in every cell is the:", o: ["Proton pump only", "Sodium-potassium pump", "Calcium pump", "Glucose pump"], a: 1, w: "The sodium-potassium pump maintains fundamental ion gradients." },
    { q: "Per ATP, the sodium-potassium pump moves:", o: ["1 sodium out, 1 potassium in", "2 sodium out, 3 potassium in", "3 potassium out, 2 sodium in", "3 sodium out, 2 potassium in"], a: 3, w: "Three sodium out and two potassium in, both against their gradients." },
    { q: "The sodium-potassium pump keeps the cell interior:", o: ["High in both", "Low in both", "Low sodium, high potassium", "High sodium, low potassium"], a: 2, w: "It maintains low intracellular sodium and high potassium." },
    { q: "By pumping out sodium, the pump helps prevent the cell from:", o: ["Swelling and bursting from osmosis", "Dividing", "Making ATP", "Shrinking only"], a: 0, w: "Controlling sodium controls water and prevents osmotic bursting." },
    { q: "The pump is electrogenic because it:", o: ["Moves a net of one positive charge out per cycle", "Adds charge inside", "Uses no charge", "Moves only neutral particles"], a: 0, w: "Three positive out, two positive in leaves the inside more negative." },
    { q: "The unequal charge movement by the pump contributes to the:", o: ["Resting membrane potential", "Blood pressure", "Body temperature", "pH only"], a: 0, w: "The net charge removal helps create the membrane potential." },
    { q: "Secondary active transport gets its energy from:", o: ["ATP directly", "The sodium gradient built by the pump", "Osmosis", "Light"], a: 1, w: "It uses energy stored in the sodium gradient, not ATP directly." },
    { q: "Secondary active transport moves a substance up its gradient by coupling it to:", o: ["Water", "ATP breaking directly", "Oxygen leaving", "Sodium flowing down its gradient"], a: 3, w: "Sodium rushing in drags the substance along, even uphill." },
    { q: "Secondary active transport is still 'active' because:", o: ["A substance is moved up its gradient", "It uses a protein", "It is fast", "It moves sodium"], a: 0, w: "Moving a substance against its gradient defines active transport." },
    { q: "The ultimate energy source for secondary active transport is:", o: ["Random motion", "Light", "Heat", "ATP (used earlier by the sodium pump)"], a: 3, w: "The pump used ATP to build the gradient that now powers it." },
    { q: "In symport (cotransport), the driving ion and substance move:", o: ["In opposite directions", "Not at all", "In the same direction", "Randomly"], a: 2, w: "Symport moves both in the same direction, into the cell." },
    { q: "In antiport (countertransport), the driving ion and substance move:", o: ["Both stop", "In the same direction", "In opposite directions", "Both outward only"], a: 2, w: "Antiport moves them oppositely - one in, one out." },
    { q: "Glucose absorption from the gut against its gradient uses:", o: ["Osmosis", "Simple diffusion", "Sodium-glucose symport", "The potassium pump"], a: 2, w: "Sodium-glucose cotransport drags glucose in with sodium." },
    { q: "The sodium-calcium exchanger, moving sodium in and calcium out, is an example of:", o: ["Simple diffusion", "Symport", "Osmosis", "Antiport"], a: 3, w: "Opposite directions make it antiport (countertransport)." },
    { q: "Sodium-glucose cotransport is ultimately powered by the:", o: ["Sodium-potassium pump", "Glucose gradient", "Water gradient", "Calcium pump"], a: 0, w: "The pump maintains the sodium gradient that drives cotransport." },
    { q: "Passive transport differs from active transport in that passive:", o: ["Goes up the gradient", "Needs no energy and goes down the gradient", "Needs ATP", "Uses pumps"], a: 1, w: "Passive transport is free and moves down the gradient." },
    { q: "Blocking ATP production will stop:", o: ["Osmosis", "Active transport", "Simple diffusion", "All transport equally"], a: 1, w: "Active transport depends on ATP; passive does not." },
    { q: "A substance moving from scarce to abundant, stopped by blocking ATP, is using:", o: ["Osmosis", "Simple diffusion", "Facilitated diffusion", "Active transport"], a: 3, w: "Up-gradient movement stopped by ATP block is active transport." },
    { q: "In the kidney, active transport is used to:", o: ["Lose all glucose", "Reabsorb glucose, ions and nutrients into the blood", "Make urine acidic only", "Add toxins"], a: 1, w: "Active transport reclaims valuable substances from the urine." },
    { q: "The ion gradients maintained by active transport make possible:", o: ["Digestion only", "Nerve impulses and muscle contraction", "Bone growth only", "Hair growth"], a: 1, w: "Excitable tissues depend on the pump-maintained gradients." },
    { q: "The drug digoxin acts by:", o: ["Removing calcium", "Partially blocking the sodium-potassium pump in the heart", "Adding ATP", "Speeding diffusion"], a: 1, w: "Digoxin inhibits the pump, altering calcium and strengthening the heartbeat." },
    { q: "Digoxin strengthens the heartbeat because blocking the pump raises intracellular:", o: ["Oxygen", "Water", "Calcium, via the altered sodium-calcium exchanger", "Sodium only, with no effect"], a: 2, w: "A changed sodium gradient alters the exchanger, raising calcium." },
    { q: "Which is an example of primary active transport?", o: ["The sodium-potassium pump", "Osmosis", "Sodium-glucose cotransport", "Simple diffusion of oxygen"], a: 0, w: "The sodium-potassium pump uses ATP directly - primary active transport." },
    { q: "Which is an example of secondary active transport?", o: ["Diffusion of carbon dioxide", "The sodium-potassium pump", "Sodium-glucose cotransport", "Osmosis of water"], a: 2, w: "Sodium-glucose cotransport uses the sodium gradient - secondary." },
    { q: "Active transport allows the cell to:", o: ["Avoid using energy", "Stop all movement", "Drift toward sameness", "Defy diffusion and maintain differences from its surroundings"], a: 3, w: "Active transport maintains gradients against the natural drift to equality." },
  ],
};

/* Registry: add each built topic here. */
const CONTENT = {
  "ana:0": T_ANA_POSITION,
  "ana:1": T_ANA_HISTO,
  "ana:2": T_ANA_EPI_OVERVIEW,
  "ana:3": T_ANA_EPI_MEMB,
  "ana:4": T_ANA_GLAND,
  "phy:0": T_PHY_GENERAL,
  "bch:0": T_BCH_INTRO,
  "bio:3": T_BIO_AMINO,
  "psy:0": T_PSY_OVERVIEW,
  "com:0": T_COM_PROCESS,
  "lab:1": T_MLS_SAFETY,
  "phy:1": T_PHY_HOMEO,
  "phy:2": T_PHY_TRANSPORT,
  "phy:3": T_PHY_FACIL,
  "phy:4": T_PHY_ACTIVE,
  "lab:2": T_LAB_ELECTRICAL,
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
  async get(k, shared = false) {
    try {
      if (hasWS()) { const r = await window.storage.get(k, shared); return r ? JSON.parse(r.value) : null; }
      if (typeof localStorage === "undefined") return null;
      const item = localStorage.getItem(k);
      return item ? JSON.parse(item) : null;
    } catch { return null; }
  },
  async set(k, v) {
    try {
      if (hasWS()) { await window.storage.set(k, JSON.stringify(v)); return; }
      if (typeof localStorage !== "undefined") localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  },
  async setShared(k, v) {
    try {
      if (hasWS()) { await window.storage.set(k, JSON.stringify(v), true); return; }
      if (typeof localStorage !== "undefined") localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  },
  // list keys with a prefix from the shared store; falls back to scanning localStorage
  async listShared(prefix) {
    try {
      if (hasWS() && window.storage.list) {
        const r = await window.storage.list(prefix, true);
        return (r && r.keys) ? r.keys : [];
      }
      if (typeof localStorage === "undefined") return [];
      const out = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) out.push(k);
      }
      return out;
    } catch { return []; }
  }
};

/* ---------------------------------------------------------------------------
   Supabase data layer.
   The whole class shares one database, so the leaderboard shows everyone and
   progress follows a student across devices. Every function fails soft: if the
   network or Supabase is unavailable, it returns a safe default and the app
   keeps working on local data rather than crashing.
--------------------------------------------------------------------------- */
const db = {
  // the id of the signed-in user, or null
  async uid() {
    try {
      const { data } = await supabase.auth.getUser();
      return data && data.user ? data.user.id : null;
    } catch { return null; }
  },

  // Publish a username/password (local) user's standing to the cloud leaderboard.
  // They have no Supabase auth account, so we give them a stable synthetic id
  // derived from their username. This lets EVERYONE - Google or username - appear
  // on the same class-wide leaderboard that everyone reads.
  async publishLocalUser(username, xp, streak) {
    try {
      const clean = String(username).toLowerCase().replace(/[^a-z0-9]/g, "");
      const synthId = "local-" + clean;
      await supabase.from("profiles").upsert({
        id: synthId,
        name: username,
        username: username,
        email: synthId + "@ascend.local",
        xp: xp || 0,
        streak: streak || 0,
        updated_at: new Date().toISOString(),
      });
    } catch {}
  },

  // load this user's progress JSON (or null if none saved yet)
  async loadProgress(uid) {
    try {
      const { data, error } = await supabase.from("progress").select("data").eq("id", uid).maybeSingle();
      if (error || !data) return null;
      return data.data || null;
    } catch { return null; }
  },

  // save this user's progress JSON, and mirror name/xp/streak into their profile
  async saveProgress(uid, progress) {
    try {
      await supabase.from("progress").upsert({ id: uid, data: progress, updated_at: new Date().toISOString() });
      await supabase.from("profiles").upsert({
        id: uid,
        name: progress.name,
        xp: progress.xp,
        streak: progress.streak,
        updated_at: new Date().toISOString(),
      });
    } catch {}
  },

  // change the display name / username on the profile
  async setUsername(uid, name) {
    try {
      await supabase.from("profiles").upsert({ id: uid, name, username: name, updated_at: new Date().toISOString() });
    } catch {}
  },

  // read the whole class leaderboard (everyone who has signed up)
  async leaderboard() {
    try {
      const { data, error } = await supabase.from("profiles").select("id, name, xp, streak").order("xp", { ascending: false }).limit(500);
      if (error || !data) return [];
      return data;
    } catch { return []; }
  },
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

/* AI endpoint. On the deployed site this points at your serverless proxy, which
   holds the API key (see claude-proxy.js). A browser cannot call an AI provider
   directly - the key would be exposed and the request blocked by CORS. */
const API_ENDPOINT = "/api/claude";
/* Password-reset backend (see password-reset.js), e.g. "/api/request-reset".
   While empty, the reset screen explains that email delivery is not yet connected. */
const AUTH_ENDPOINT = "";
/* Gemini sometimes wraps JSON in markdown fences, adds prose around it, or
   leaves a trailing comma - all of which break JSON.parse. This helper pulls out
   the JSON and cleans the common problems so LAMLA and Papers parse reliably. */
function parseAIJson(raw) {
  if (!raw) throw new Error("empty AI response");
  let s = String(raw).trim();
  // strip markdown code fences
  s = s.replace(/```json/gi, "").replace(/```/g, "").trim();
  // grab the outermost JSON array or object if there is surrounding prose
  const firstArr = s.indexOf("["), firstObj = s.indexOf("{");
  let start = -1;
  if (firstArr === -1) start = firstObj;
  else if (firstObj === -1) start = firstArr;
  else start = Math.min(firstArr, firstObj);
  if (start > 0) s = s.slice(start);
  const lastArr = s.lastIndexOf("]"), lastObj = s.lastIndexOf("}");
  const end = Math.max(lastArr, lastObj);
  if (end >= 0 && end < s.length - 1) s = s.slice(0, end + 1);
  // remove trailing commas before ] or }
  s = s.replace(/,\s*([\]}])/g, "$1");
  // curly quotes -> straight quotes
  s = s.replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'");
  return JSON.parse(s);
}

/* Load the Mermaid diagram library once, on demand, from a CDN. Mermaid turns
   simple text (which the AI writes reliably) into a clean flow diagram, so we get
   accurate visuals for free without the AI ever trying to draw. */
let _mermaidPromise = null;
function loadMermaid() {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.mermaid) return Promise.resolve(window.mermaid);
  if (_mermaidPromise) return _mermaidPromise;
  _mermaidPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.9.1/mermaid.min.js";
    s.onload = () => {
      try {
        window.mermaid.initialize({ startOnLoad: false, theme: "dark", securityLevel: "loose" });
        resolve(window.mermaid);
      } catch (e) { reject(e); }
    };
    s.onerror = () => reject(new Error("Could not load the diagram library - check your connection."));
    document.head.appendChild(s);
  });
  return _mermaidPromise;
}

async function callClaude(system, messages, maxTokens = 2048) {
  const body = JSON.stringify({ max_tokens: maxTokens, system, messages });
  let res;
  // Retry on rate limits (429) and transient overload (529/503). The free AI tier
  // limits requests per minute, so when several people use it at once we wait and
  // retry rather than failing - most rate limits clear within a few seconds.
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      res = await fetch(API_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body });
    } catch (netErr) {
      // network hiccup - wait briefly and retry
      if (attempt < 4) { await new Promise((r) => setTimeout(r, 800 * (attempt + 1))); continue; }
      throw new Error("Could not reach the AI - check your connection and try again.");
    }
    if (res.ok) break;
    if (res.status === 429 || res.status === 529 || res.status === 503) {
      await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)));
      continue;
    }
    throw new Error("The AI service returned an error (" + res.status + ").");
  }
  if (!res.ok) throw new Error((res.status === 429 || res.status === 503 || res.status === 529)
    ? "The AI is handling lots of requests right now. Wait about 20 seconds and try again - it is free, so it just needs a moment."
    : "The AI service is unavailable at the moment.");
  const data = await res.json();
  if (data && data.error) throw new Error(typeof data.error === "string" ? data.error : (data.error.message || "AI error"));
  // accept Anthropic ({content:[{type:'text',text}]}) and OpenAI/DeepSeek/Gemini-proxied ({choices:[{message:{content}}]}) shapes
  let text = "";
  if (Array.isArray(data.content)) text = data.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  else if (data.choices && data.choices[0]) text = data.choices[0].message ? data.choices[0].message.content : data.choices[0].text;
  else if (typeof data.text === "string") text = data.text;
  text = (text || "").trim();
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
    const sys = `You are the ASCEND tutor for KNUST medical laboratory science students. Teach the WHY and the mechanism, step by step. Keep each answer complete but focused - finish within a few clear paragraphs rather than writing an essay, so the reply is never cut off. No emojis.\n\nTOPIC: ${topicTitle}\n\nSOURCE:\n${context}`;
    const apiMsgs = next.slice(1);
    try {
      const reply = await callClaude(sys, apiMsgs.map((m) => ({ role: m.role, content: m.content })), 3000);
      // tutor answers capped at 3000 tokens so they stay complete but focused
      setMsgs([...next, { role: "assistant", content: reply }]);
    } catch (e) {
      setMsgs([...next, { role: "assistant", content: (e && e.message ? e.message + " " : "") + "The tutor could not respond just now. Please try again in a moment." }]);
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
  const [earnedXp, setEarnedXp] = useState(true);
  const bankLen = q.length;
  const [left, setLeft] = useState(bankLen * 45);

  const finish = () => {
    const correct = q.reduce((n, item, idx) => n + (answers[idx] === item.a ? 1 : 0), 0);
    if (t) {
      const already = !!app.progress.completed?.[`${t.courseId}:${t.topicIndex}`];
      setEarnedXp(!already);
      // collect the questions the student got wrong, so they can review them later
      const missed = q.filter((item, idx) => answers[idx] !== undefined && answers[idx] !== item.a)
        .map((item) => ({ q: item.q, o: item.o, a: item.a, w: item.w, topic: t.title, courseId: t.courseId }));
      app.finishQuiz(t.courseId, t.topicIndex, correct, missed, bankLen);
    }
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
          <div style={{ color: "var(--text-2)" }}>{pct}% correct{earnedXp ? ` · +${score * 10} XP earned` : " · practice run, no new XP"}</div>
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
          <div className="eyebrow" style={{ marginBottom: 6 }}>Watch on YouTube</div>
          <p style={{ color: "var(--text-2)", fontSize: 13.5, margin: "0 0 12px", lineHeight: 1.55 }}>Tap a topic to open a fresh YouTube search - pick whichever video looks clearest to you. We keep these as searches, not fixed links, so they are always current and you choose the best one.</p>
          <div className="grid g2">
            {(t.videos || []).map((v, k) => {
              const query = encodeURIComponent(v.title + " " + (t.title || ""));
              const searchUrl = "https://www.youtube.com/results?search_query=" + query;
              return (
                <a className="card hover" key={k} href={searchUrl} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--amber-dim)", color: "var(--amber)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ic.play p={18} /></div>
                    <div><div style={{ fontWeight: 650, fontSize: 14.5 }}>{v.title}</div><div className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>SEARCH YOUTUBE</div></div>
                  </div>
                  <p style={{ color: "var(--text-2)", fontSize: 13, margin: "10px 0 0" }}>{v.note}</p>
                </a>
              );
            })}
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
                    <div style={{ color: "var(--text-3)", fontSize: 12.5, marginTop: 4 }}>{tc ? `Lesson · AI tutor · ${(tc.theory || []).length} theory Q · ${(tc.mcqs || []).length} MCQ` : "New lessons arrive weekly - tap for a preview."}</div>
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
          // ring reflects progress through the topics that actually exist, not all 87
          const prog = live ? Math.min(done / live, 1) : 0;
          return (
            <button className="card hover" key={c.id} style={{ textAlign: "left" }} onClick={() => app.go("course", { courseId: c.id })}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <span className="day-tag">{c.day.slice(0, 3)}</span>
                <Ring value={prog} size={38} stroke={4} />
              </div>
              <h3 style={{ fontSize: 16.5, margin: "0 0 3px" }}>{c.name}</h3>
              <div className="ct-code">{c.code} · {count} topics</div>
              <div style={{ marginTop: 12, fontSize: 12.5, color: live ? "var(--good)" : "var(--text-3)", fontWeight: 600 }} className="mono">{live ? `${live} TOPIC${live > 1 ? "S" : ""} LIVE` : "LESSONS ARRIVE WEEKLY"}</div>
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
  const meKey = String(app.progress.name).toLowerCase().replace(/[^a-z0-9]/g, "");
  const [others, setOthers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      setLoading(true);
      // Always read the class-wide leaderboard from Supabase, no matter how the
      // student logged in (Google or username). Everyone who signed up has a
      // profile row in the cloud, so everyone sees the same full leaderboard.
      try {
        const rows = await db.leaderboard();
        if (Array.isArray(rows) && rows.length) {
          // exclude my own row (matched by id if I have one, else by name) so I am
          // not shown twice - my own card is added separately below.
          const mine = app.supaUid;
          const filtered = rows.filter((r) =>
            mine ? r.id !== mine : String(r.name || "").toLowerCase().replace(/[^a-z0-9]/g, "") !== meKey
          );
          setOthers(filtered);
          setLoading(false);
          return;
        }
      } catch {}
      // Only if the cloud returned nothing at all, fall back to the local board.
      try {
        const keys = await store.listShared("ascend_board:");
        const rows = [];
        for (const k of keys) {
          const v = await store.get(k, true);
          if (v && v.name && k !== "ascend_board:" + meKey) rows.push(v);
        }
        setOthers(rows);
      } catch {}
      setLoading(false);
    })();
  }, [meKey, app.progress.xp, app.supaUid]);
  const me = { name: app.progress.name, xp: app.progress.xp, streak: app.progress.streak, me: true };
  const board = [...others, me].sort((a, b) => b.xp - a.xp);
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

/* ------------------------------- review --------------------------------- */
/* Spaced-style review: every question a student got wrong is collected here so
   they can drill their weak spots. Answer one correctly and it leaves the deck.
   This is the single most powerful study feature - it makes students revisit
   exactly what they do not yet know, which is how real retention is built. */
function ReviewView({ app }) {
  const deck = Array.isArray(app.progress.review) ? app.progress.review : [];
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);

  // Weak-spots: from recorded best scores, list topics scored below 70% so the
  // student sees exactly where they are weakest and can jump straight to them.
  const scores = app.progress.scores || {};
  const scored = Object.keys(scores).map((k) => {
    const [cid, tid] = k.split(":");
    const t = contentFor(cid, parseInt(tid, 10));
    return { key: k, cid, tid: parseInt(tid, 10), pct: scores[k], title: t ? t.title : null, course: courseById(cid) };
  }).filter((x) => x.title);
  const weak = scored.filter((x) => x.pct < 70).sort((a, b) => a.pct - b.pct);
  const strong = scored.filter((x) => x.pct >= 70).length;

  const WeakSpots = () => {
    if (scored.length === 0) return null;
    return (
      <div className="card" style={{ marginTop: 16 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Your weak spots</div>
        {weak.length === 0 ? (
          <p style={{ color: "var(--text-2)", fontSize: 14, margin: 0, lineHeight: 1.6 }}>No weak topics - every quiz you have taken is at 70% or above. Strong work. Keep taking new topics to keep climbing.</p>
        ) : (
          <>
            <p style={{ color: "var(--text-2)", fontSize: 13.5, margin: "0 0 12px", lineHeight: 1.55 }}>Topics you have scored below 70% on. These are where your marks are most easily won - tap one to open it and try again.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {weak.slice(0, 8).map((w) => (
                <button key={w.key} className="card hover" style={{ textAlign: "left", padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }} onClick={() => app.go("topic", { courseId: w.cid, topicId: w.tid })}>
                  <div>
                    <div style={{ fontWeight: 650, fontSize: 14.5 }}>{w.title}</div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{w.course ? w.course.code : ""}</div>
                  </div>
                  <span style={{ fontWeight: 750, fontSize: 15, color: w.pct < 50 ? "var(--bad)" : "var(--amber)", flexShrink: 0 }}>{w.pct}%</span>
                </button>
              ))}
            </div>
          </>
        )}
        {strong > 0 && <p className="note-hint" style={{ marginTop: 12 }}>{strong} topic{strong === 1 ? "" : "s"} mastered at 70% or above.</p>}
      </div>
    );
  };

  if (deck.length === 0) {
    return (
      <div className="view">
        <div className="eyebrow">Review and weak spots</div>
        <h1 className="headline" style={{ marginTop: 6 }}>{scored.length === 0 ? "Nothing to review yet" : "Your progress so far"}</h1>
        <div className="card" style={{ marginTop: 16 }}>
          <p style={{ color: "var(--text-2)", fontSize: 15, lineHeight: 1.6, margin: 0 }}>When you get a question wrong in any quiz, it lands here so you can drill it until it sticks. Right now your review deck is empty - so either you have not taken a quiz yet, or you have cleared every missed question. Either way, keep climbing.</p>
        </div>
        <WeakSpots />
        <button className="btn btn-a" style={{ marginTop: 16 }} onClick={() => app.go("courses")}>Go to courses <Ic.chevR p={16} /></button>
      </div>
    );
  }

  const item = deck[Math.min(idx, deck.length - 1)];
  const answered = picked !== null;
  const correct = answered && picked === item.a;

  const next = () => {
    if (correct) {
      // remove from the deck; it is learned for now
      app.clearReviewItem(item.q);
      setPicked(null);
      setIdx(0); // deck shrank, restart at top of what remains
    } else {
      setPicked(null);
      setIdx((idx + 1) % deck.length); // cycle to the next missed one
    }
  };

  return (
    <div className="view">
      <div className="eyebrow">Review your mistakes</div>
      <h1 className="headline" style={{ marginTop: 6 }}>{deck.length} to master</h1>
      <p style={{ color: "var(--text-2)", fontSize: 14, margin: "6px 0 18px", lineHeight: 1.55 }}>These are questions you have missed. Answer one correctly and it leaves your deck. Get it wrong and it stays - keep drilling until they are all gone.</p>

      <div className="card">
        <div className="mono" style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 8 }}>{(item.topic || "").toUpperCase()}</div>
        <div style={{ fontWeight: 650, fontSize: 16, lineHeight: 1.5, marginBottom: 16 }}>{item.q}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {item.o.map((opt, k) => {
            let cls = "opt";
            if (answered) {
              if (k === item.a) cls += " opt-correct";
              else if (k === picked) cls += " opt-wrong";
            }
            return (
              <button key={k} className={cls} disabled={answered} onClick={() => setPicked(k)}>{opt}</button>
            );
          })}
        </div>
        {answered && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 650, color: correct ? "var(--good)" : "var(--bad)", marginBottom: 6 }}>{correct ? "Correct - removing from your deck" : "Not quite - this one stays for another round"}</div>
            <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{item.w}</p>
            <button className="btn btn-a" style={{ marginTop: 14 }} onClick={next}>{correct ? "Next" : "Keep going"} <Ic.chevR p={16} /></button>
          </div>
        )}
      </div>
      <WeakSpots />
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
/* ---------------------------- study tools ------------------------------- */
/* Flashcards and mind maps generated by the free Gemini AI from a chosen course
   topic or pasted material. Flashcards drill active recall; the mind map shows
   how ideas connect - both serve deep retention, not rote reading. */
function StudyToolsView() {
  const [tab, setTab] = useState("cards");
  const [courseId, setCourseId] = useState("ana");
  const [topic, setTopic] = useState("");
  const [material, setMaterial] = useState("");
  const [source, setSource] = useState("topic"); // "topic" or "paste"
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [cards, setCards] = useState(null);
  const [flipped, setFlipped] = useState({});
  const [map, setMap] = useState(null);
  const [flowCode, setFlowCode] = useState("");
  const [flowErr, setFlowErr] = useState("");
  const flowRef = useRef(null);

  const subject = source === "paste"
    ? `the following material:\n\n${material}`
    : `the topic "${topic || "this subject"}" in ${courseById(courseId).name} (${courseById(courseId).code}) for a KNUST first-year medical laboratory science student`;

  const genCards = async () => {
    if (busy) return;
    if (source === "topic" && !topic.trim()) { setErr("Type a topic first."); return; }
    if (source === "paste" && !material.trim()) { setErr("Paste some material first."); return; }
    setBusy(true); setErr(""); setCards(null); setFlipped({});
    try {
      const raw = await callClaude(
        "You create study flashcards for KNUST medical laboratory science students. Each card has a short front (a question, term, or prompt) and a concise back (the answer or definition). Focus on the most important, testable facts. Return ONLY a valid, compact JSON array, no prose, no markdown, no trailing commas.",
        [{ role: "user", content: `Create 10 to 14 flashcards on ${subject}. Format: [{"front":"...","back":"..."}]. Keep each side short and precise.` }],
        3000
      );
      const arr = parseAIJson(raw);
      const clean = (Array.isArray(arr) ? arr : []).filter((x) => x && x.front && x.back);
      if (!clean.length) throw new Error("No cards came back - try again.");
      setCards(clean);
    } catch (e) {
      setErr((e && e.message ? e.message + " " : "") + "The AI could not respond just now. Please try again.");
    }
    setBusy(false);
  };

  const genMap = async () => {
    if (busy) return;
    if (source === "topic" && !topic.trim()) { setErr("Type a topic first."); return; }
    if (source === "paste" && !material.trim()) { setErr("Paste some material first."); return; }
    setBusy(true); setErr(""); setMap(null);
    try {
      const raw = await callClaude(
        "You create hierarchical mind maps for KNUST medical laboratory science students. A mind map has a central topic, main branches, and sub-points under each. Return ONLY valid compact JSON, no prose, no markdown, no trailing commas.",
        [{ role: "user", content: `Create a mind map of ${subject}. Format: {"central":"topic name","branches":[{"title":"main idea","points":["sub-point","sub-point"]}]}. Give 4 to 6 branches, each with 2 to 4 short points.` }],
        3000
      );
      const data = parseAIJson(raw);
      if (!data || !data.central || !Array.isArray(data.branches)) throw new Error("bad shape");
      setMap(data);
    } catch (e) {
      setErr((e && e.message ? e.message + " " : "") + "The AI could not respond just now. Please try again.");
    }
    setBusy(false);
  };

  const branchColors = ["var(--amber)", "#5B8DEF", "#4FB477", "#E86A6A", "#B07CE8", "#E0A32E"];

  const genFlow = async () => {
    if (busy) return;
    if (source === "topic" && !topic.trim()) { setErr("Type a topic first."); return; }
    if (source === "paste" && !material.trim()) { setErr("Paste some material first."); return; }
    setBusy(true); setErr(""); setFlowErr(""); setFlowCode("");
    try {
      const raw = await callClaude(
        "You write Mermaid flowchart code for KNUST medical laboratory science students. Output ONLY valid Mermaid flowchart syntax - nothing else, no explanation, no markdown fences. Start with 'graph TD' or 'graph LR'. Use short node labels in square brackets and arrows with -->. Keep node text free of parentheses, colons and special characters that break Mermaid. Show the process or pathway as a clear step-by-step flow.",
        [{ role: "user", content: `Write a Mermaid flowchart showing the flow, pathway or process of ${subject}. Keep it to 6 to 14 nodes so it stays clear. Output only the Mermaid code.` }],
        1500
      );
      // strip any stray markdown fences or prose the AI may add
      let code = String(raw).replace(/```mermaid/gi, "").replace(/```/g, "").trim();
      // if the AI added a sentence before the graph, cut to the graph start
      const gi = code.search(/graph\s+(TD|LR|TB|RL)/i);
      if (gi > 0) code = code.slice(gi);
      if (!/graph\s+(TD|LR|TB|RL)/i.test(code)) throw new Error("The diagram could not be built - try again.");
      setFlowCode(code);
    } catch (e) {
      setErr((e && e.message ? e.message + " " : "") + "The AI could not respond just now. Please try again.");
    }
    setBusy(false);
  };

  // render the Mermaid code whenever it changes
  useEffect(() => {
    if (!flowCode || tab !== "flow") return;
    let cancelled = false;
    (async () => {
      try {
        const mermaid = await loadMermaid();
        const id = "flow-" + Date.now();
        const { svg } = await mermaid.render(id, flowCode);
        if (!cancelled && flowRef.current) { flowRef.current.innerHTML = svg; setFlowErr(""); }
      } catch (e) {
        if (!cancelled) setFlowErr("This diagram did not render cleanly. Tap Build again for a fresh version.");
      }
    })();
    return () => { cancelled = true; };
  }, [flowCode, tab]);

  return (
    <div className="view">
      <div className="eyebrow">Study tools</div>
      <h1 style={{ fontSize: "clamp(22px,4vw,28px)", margin: "6px 0 4px" }}>Flashcards and mind maps</h1>
      <p style={{ color: "var(--text-2)", marginTop: 0, maxWidth: "58ch" }}>Turn any topic or your own notes into flashcards for active recall, or a mind map to see how the ideas connect. Both are generated fresh by ASCEND.</p>

      <div className="tabs">
        <button className={"tab " + (tab === "cards" ? "on" : "")} onClick={() => { setTab("cards"); setErr(""); }}>Flashcards</button>
        <button className={"tab " + (tab === "map" ? "on" : "")} onClick={() => { setTab("map"); setErr(""); }}>Mind map</button>
        <button className={"tab " + (tab === "flow" ? "on" : "")} onClick={() => { setTab("flow"); setErr(""); }}>Flow diagram</button>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <button className="btn btn-sm" style={{ background: source === "topic" ? "var(--amber)" : "var(--bg-3)", color: source === "topic" ? "#1B1405" : "var(--text-2)", border: "1px solid var(--line)" }} onClick={() => setSource("topic")}>From a topic</button>
          <button className="btn btn-sm" style={{ background: source === "paste" ? "var(--amber)" : "var(--bg-3)", color: source === "paste" ? "#1B1405" : "var(--text-2)", border: "1px solid var(--line)" }} onClick={() => setSource("paste")}>From my notes</button>
        </div>

        {source === "topic" ? (
          <>
            <label className="eyebrow" style={{ display: "block", marginBottom: 8 }}>Course</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              {COURSES.map((c) => (
                <button key={c.id} className="btn btn-sm" style={{ background: courseId === c.id ? "var(--amber)" : "var(--bg-3)", color: courseId === c.id ? "#1B1405" : "var(--text-2)", border: "1px solid var(--line)" }} onClick={() => setCourseId(c.id)}>{c.code}</button>
              ))}
            </div>
            <label className="eyebrow" style={{ display: "block", marginBottom: 8 }}>Topic</label>
            <input className="auth-input" value={topic} placeholder="e.g. Homeostasis, or Amino acids" onChange={(e) => setTopic(e.target.value)} />
          </>
        ) : (
          <>
            <label className="eyebrow" style={{ display: "block", marginBottom: 8 }}>Paste your notes or lecture material</label>
            <textarea className="pastebox" value={material} placeholder="Paste any notes, slide text or a paragraph here..." onChange={(e) => setMaterial(e.target.value)} />
          </>
        )}

        <div style={{ marginTop: 14 }}>
          {tab === "cards"
            ? <button className="btn btn-a" onClick={genCards} disabled={busy}>{busy ? "Making your flashcards..." : "Make flashcards"} <Ic.ai p={16} /></button>
            : tab === "map"
            ? <button className="btn btn-a" onClick={genMap} disabled={busy}>{busy ? "Building your mind map..." : "Build mind map"} <Ic.ai p={16} /></button>
            : <button className="btn btn-a" onClick={genFlow} disabled={busy}>{busy ? "Drawing your flow diagram..." : "Build flow diagram"} <Ic.ai p={16} /></button>}
        </div>
      </div>

      {err && <div className="card" style={{ marginTop: 14, borderColor: "var(--line-2)", color: "var(--text-2)", fontSize: 14 }}>{err}</div>}
      {busy && <div className="card" style={{ marginTop: 14 }}><span className="dots"><span /><span /><span /></span></div>}

      {tab === "cards" && cards && (
        <>
          <p className="note-hint" style={{ margin: "16px 0 10px" }}>Tap a card to flip it. Say the answer out loud before you flip - that is the recall that builds memory.</p>
          <div className="grid g2">
            {cards.map((c, k) => (
              <button key={k} className="card hover" style={{ minHeight: 120, textAlign: "left", display: "flex", flexDirection: "column", justifyContent: "center", cursor: "pointer", border: flipped[k] ? "1px solid var(--amber)" : "1px solid var(--line)" }} onClick={() => setFlipped({ ...flipped, [k]: !flipped[k] })}>
                <div className="mono" style={{ fontSize: 10.5, color: flipped[k] ? "var(--amber)" : "var(--text-3)", marginBottom: 8 }}>{flipped[k] ? "ANSWER" : "TAP TO FLIP"}</div>
                <div style={{ fontWeight: flipped[k] ? 500 : 650, fontSize: 15, lineHeight: 1.5, color: flipped[k] ? "var(--text-2)" : "var(--text)" }}>{flipped[k] ? c.back : c.front}</div>
              </button>
            ))}
          </div>
        </>
      )}

      {tab === "map" && map && (
        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <span style={{ display: "inline-block", background: "var(--amber)", color: "#1B1405", fontWeight: 750, fontSize: 16, padding: "10px 20px", borderRadius: 12 }}>{map.central}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {map.branches.map((b, k) => (
              <div key={k} style={{ borderLeft: `3px solid ${branchColors[k % branchColors.length]}`, paddingLeft: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: branchColors[k % branchColors.length], marginBottom: 6 }}>{b.title}</div>
                <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-2)", fontSize: 14, lineHeight: 1.7 }}>
                  {(b.points || []).map((p, j) => <li key={j}>{p}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === "flow" && flowCode && (
        <>
          <p className="note-hint" style={{ margin: "16px 0 10px" }}>Follow the arrows to see how each step leads to the next. Rebuild for a fresh version any time.</p>
          <div className="card" style={{ marginTop: 4, overflowX: "auto" }}>
            <div ref={flowRef} style={{ display: "flex", justifyContent: "center", minHeight: 60 }} />
            {flowErr && <div style={{ color: "var(--text-2)", fontSize: 13.5, marginTop: 10 }}>{flowErr}</div>}
          </div>
        </>
      )}
    </div>
  );
}

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
      let text = await callClaude(`You generate KNUST-style medical laboratory science exam questions. Return ONLY a valid, compact, complete JSON array, no prose, no markdown, no trailing commas. Keep each question and option short.`, [{ role: "user", content: usr }], 3500);
      const arr = parseAIJson(text);
      const clean = (Array.isArray(arr) ? arr : []).filter((x) => x && x.q && Array.isArray(x.o) && x.o.length === 4 && typeof x.a === "number");
      if (!clean.length) throw new Error("No usable questions came back - try again.");
      setItems(clean);
    } catch (e) {
      setErr((e && e.message ? e.message + " " : "") + "The AI could not respond just now. Please try again in a moment.");
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
const SOCRATIC_TASK = "Break this study material into a focused Socratic lesson of 4 to 6 steps. For each step: state the question, explain the answer in one or two clear paragraphs, then give the crucial insight in one line. End with three short self-test questions and their answers. Be economical so the whole lesson is complete and never cut off.";

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
        setResult(await callClaude(SOCRATIC_SYS, [{ role: "user", content }], 4000));
      } else {
        let material = typed;
        if (file && !material) {
          if (ext === "pptx") { setStage("Opening your slides..."); material = await pptxToText(file); }
          else if (ext === "txt" || ext === "md") { setStage("Reading your file..."); material = await readTextFile(file); }
          else throw new Error("Supported files are PDF, PowerPoint (.pptx), and plain text. For .ppt or .doc, export to PDF first.");
        }
        if (!material) throw new Error("That file had no readable text.");
        setStage("Building your lesson...");
        setResult(await callClaude(SOCRATIC_SYS, [{ role: "user", content: SOCRATIC_TASK + "\n\nMATERIAL:\n" + material }], 4000));
      }
    } catch (e) {
      setErr((e && e.message ? e.message + " " : "") + "The AI could not respond just now. Please try again in a moment.");
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
          <p className="hero-p">Built by Prince, Ansah, Jeffery and Dacosta so the Class of 2029 rises together.</p>
        </div>
      </div>

      {(() => {
        // Exam countdown - end-of-semester exams begin 17 August 2026.
        const examStart = new Date("2026-08-17T00:00:00");
        const now = new Date();
        const msPerDay = 1000 * 60 * 60 * 24;
        const daysLeft = Math.ceil((examStart - now) / msPerDay);
        if (daysLeft < -30) return null; // hide well after exams
        const built = Object.keys(CONTENT).length;
        let line;
        if (daysLeft > 1) line = `The end-of-semester exams begin in ${daysLeft} days. Some topics you will be examined on you may not have covered yet - ASCEND has you. Start climbing today.`;
        else if (daysLeft === 1) line = `Exams begin tomorrow. One last climb - revise your weak spots in Review and lock it in. ASCEND has you.`;
        else if (daysLeft === 0) line = `Exams begin today. Breathe, trust your preparation, and give it everything. ASCEND has you.`;
        else line = `Exam season is here. Keep going - revise, review, and finish strong. ASCEND has you.`;
        return (
          <div className="card card-feature" style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flexShrink: 0, width: 72, height: 72, borderRadius: 16, background: "var(--amber-dim)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontWeight: 800, fontSize: 26, color: "var(--amber)", lineHeight: 1 }}>{daysLeft > 0 ? daysLeft : 0}</div>
              <div className="mono" style={{ fontSize: 9.5, color: "var(--amber-2)", marginTop: 2 }}>{daysLeft === 1 ? "DAY" : "DAYS"}</div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div className="eyebrow" style={{ color: "var(--amber)", marginBottom: 4 }}>Countdown to exams · 17 Aug 2026</div>
              <div style={{ fontSize: 14.5, color: "var(--text-2)", lineHeight: 1.55 }}>{line}</div>
            </div>
          </div>
        );
      })()}

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
          <div style={{ color: "var(--text-2)", fontSize: 14 }}>Get a cram sheet of what is most likely on the paper.</div>
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

      <div className="card card-feature" style={{ marginTop: 26, textAlign: "center" }}>
        <div className="eyebrow" style={{ color: "var(--amber)", marginBottom: 10 }}>Built by the ASCEND team</div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
          {["Prince", "Ansah", "Jeffery", "Dacosta"].map((n) => (
            <span key={n} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--bg-3)", border: "1px solid var(--line)", borderRadius: 999, padding: "8px 14px", fontSize: 14, fontWeight: 600 }}>
              <span style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--amber-dim)", color: "var(--amber-2)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 750 }}>{n[0]}</span>
              {n}
            </span>
          ))}
        </div>
        <div style={{ color: "var(--text-3)", fontSize: 12.5, marginTop: 12, lineHeight: 1.6 }}>For the MLS Class of 2029. No gatekeeping.</div>
      </div>
    </div>
  );
}

/* ------------------------------- auth ----------------------------------- */
const encodePw = (s) => { try { return btoa(unescape(encodeURIComponent(s))); } catch { return s; } };
const freshProgress = (name) => ({ name, xp: 0, streak: 0, lastActive: null, dailyDone: {}, completed: {}, review: [], scores: {} });
const progKey = (u) => "ascend_progress:" + String(u).toLowerCase();
function AuthScreen({ onAuthed }) {
  const [tab, setTab] = useState("login");        // login | signup | forgot
  const [username, setUsername] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);
  const [fStage, setFStage] = useState("who");    // who | sent

  // remember the last student who used this device, so the field is prefilled
  useEffect(() => { (async () => { const last = await store.get("ascend_last_user"); if (last) setUsername(last); })(); }, []);

  const clearMsgs = () => { setErr(""); setOk(""); };

  const signInWithGoogle = async () => {
    clearMsgs();
    try {
      setBusy(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
      // the browser now redirects to Google; on return, onAuthStateChange signs the user in
    } catch (e) {
      setErr(e && e.message ? e.message : "Google sign-in could not start. Please try again.");
      setBusy(false);
    }
  };

  const submit = async () => {
    clearMsgs();
    const u = username.trim();
    if (u.length < 2) { setErr("Pick a username of at least 2 characters."); return; }
    if (pw.length < 4) { setErr("Use a password of at least 4 characters."); return; }
    if (tab === "signup") {
      if (pw !== pw2) { setErr("The two passwords do not match."); return; }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) { setErr("Enter a valid email so you can reset your password later."); return; }
    }
    setBusy(true);
    const key = u.toLowerCase();
    try {
      const accounts = (await store.get("ascend_accounts")) || {};
      if (tab === "signup") {
        if (accounts[key]) {
          setBusy(false);
          setErr("That username already exists. Switch to Log in to sign in with it.");
          return;
        }
        const acct = { username: u, email: email.trim().toLowerCase(), pass: encodePw(pw), createdAt: Date.now() };
        accounts[key] = acct;
        await store.set("ascend_accounts", accounts);
        await store.set("ascend_session", key);
        await store.set("ascend_last_user", acct.username);
        // register on the class board WITHOUT blocking sign-in (fire and forget)
        store.setShared("ascend_board:" + key.replace(/[^a-z0-9]/g, ""), { name: u, xp: 0, streak: 0 });
        db.publishLocalUser(u, 0, 0); // also put them on the cloud leaderboard everyone reads
        setBusy(false);
        onAuthed(acct);
        return;
      }
      // login
      const acct = accounts[key];
      if (!acct) { setBusy(false); setErr("No account with that username. Tap Create account to sign up."); return; }
      if (acct.pass !== encodePw(pw)) { setBusy(false); setErr("Password is not right. Try again or reset it."); return; }
      await store.set("ascend_session", key);
      await store.set("ascend_last_user", acct.username);
      // make sure this returning user is on the cloud leaderboard everyone reads
      const savedP = await store.get(progKey(acct.username));
      db.publishLocalUser(acct.username, savedP ? savedP.xp || 0 : 0, savedP ? savedP.streak || 0 : 0);
      setBusy(false);
      onAuthed(acct);
    } catch (e) {
      setBusy(false);
      setErr("Something went wrong. Please try again.");
    }
  };

  const requestReset = async () => {
    clearMsgs();
    const id = username.trim().toLowerCase();
    if (!id) { setErr("Type your username or email first."); return; }
    setBusy(true);
    // Real email delivery needs the reset backend (see password-reset.js). When
    // AUTH_ENDPOINT is set, this calls it; until then we tell the student plainly.
    if (AUTH_ENDPOINT) {
      try {
        const res = await fetch(AUTH_ENDPOINT, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: id })
        });
        setBusy(false);
        if (res.ok) { setFStage("sent"); return; }
        throw new Error("reset service error");
      } catch (e) {
        setBusy(false);
        setErr("The reset email could not be sent right now. Please try again later.");
        return;
      }
    }
    setBusy(false);
    setFStage("sent");
  };

  const goTab = (t) => { setTab(t); clearMsgs(); setPw(""); setPw2(""); setFStage("who"); };

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

  if (tab === "forgot") return (
    <div className="auth-wrap">
      {Logo}
      <div className="auth-card">
        <div className="eyebrow" style={{ marginBottom: 4 }}>Password reset</div>
        <h2 style={{ fontSize: 19, margin: "0 0 12px" }}>Forgot your password?</h2>
        {fStage === "who" && (
          <>
            <p style={{ color: "var(--text-2)", fontSize: 13.5, marginTop: 0, lineHeight: 1.6 }}>Enter your username or the email you signed up with, and we will send a reset link to your email.</p>
            <label className="field"><span>Username or email</span>
              <input className="auth-input" name="username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="prince_a  or  you@gmail.com" autoCapitalize="none" autoCorrect="off" />
            </label>
            {err && <div className="auth-err">{err}</div>}
            <button className="btn btn-a auth-btn" onClick={requestReset} disabled={busy}>{busy ? "Sending..." : "Send reset link"}</button>
            <button className="btn btn-g btn-sm" style={{ width: "100%", marginTop: 10 }} onClick={() => goTab("login")}>Back to log in</button>
          </>
        )}
        {fStage === "sent" && (
          <>
            <div className="card" style={{ background: "var(--good-dim)", padding: 16, marginBottom: 14 }}>
              <div style={{ fontWeight: 700, color: "var(--good)", marginBottom: 5 }}>Check your email</div>
              <div style={{ color: "var(--text-2)", fontSize: 13.5, lineHeight: 1.6 }}>If an account matches that username or email, a reset link is on its way. It expires in one hour - check your spam folder if you do not see it.{AUTH_ENDPOINT ? "" : " (Email delivery activates once the ASCEND team connects the mail service.)"}</div>
            </div>
            <button className="btn btn-a auth-btn" onClick={() => goTab("login")}>Back to log in</button>
          </>
        )}
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

        <button className="btn btn-a auth-btn" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontWeight: 700, fontSize: 15.5, marginBottom: 4 }} onClick={signInWithGoogle} disabled={busy}>
          <svg width="20" height="20" viewBox="0 0 18 18" aria-hidden>
            <path fill="#fff" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" opacity="0.0"/>
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z"/>
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </button>
        <p className="note-hint" style={{ textAlign: "center", margin: "0 0 12px", fontSize: 12 }}>Recommended - saves your progress and rank across all your devices.</p>

        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0 14px" }}>
          <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
          <span style={{ color: "var(--text-3)", fontSize: 12 }}>or use a username</span>
          <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
        </div>

        <label className="field">
          <span>{tab === "signup" ? "Username (your name on the leaderboard - a nickname is fine)" : "Username"}</span>
          <input className="auth-input" name="username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. prince_a" autoCapitalize="none" autoCorrect="off" />
        </label>
        <PasswordInput id="password" autoComplete={tab === "signup" ? "new-password" : "current-password"} label="Password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 4 characters" />
        {tab === "signup" && (
          <>
            <PasswordInput id="password2" autoComplete="new-password" label="Confirm password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Type it again" />
            <label className="field"><span>Email (so you can reset your password if you forget it)</span>
              <input className="auth-input" type="email" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@gmail.com" autoCapitalize="none" autoCorrect="off" />
            </label>
          </>
        )}
        {err && <div className="auth-err">{err}</div>}
        {ok && <div style={{ color: "var(--good)", fontSize: 13, margin: "2px 0 12px" }}>{ok}</div>}
        <button className="btn btn-g auth-btn" onClick={submit} disabled={busy}>{busy ? "Please wait..." : tab === "signup" ? "Create account" : "Log in"}</button>
        {tab === "login" && (
          <button className="btn btn-g btn-sm" style={{ width: "100%", marginTop: 10 }} onClick={() => goTab("forgot")}>Forgot password?</button>
        )}
      </div>
    </div>
  );
}

const ANNOUNCEMENTS = [
  { id: "a2", tag: "Feature", title: "CWA planner, themes and resources", body: "Plan your target CWA under the CWA tab, switch light and dark with the toggle up top, and turn your own notes into lessons under Resources." },
  { id: "a1", tag: "Welcome", title: "Welcome to ASCEND", body: "The climb to First Class, together, built by Prince, Ansah, Jeffery and Dacosta. Do the daily question every day to build your streak and rise through the ranks." }
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
  const [offlineReason, setOfflineReason] = useState("");

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
      bullets: ["Open this topic in ASCEND, read the note steps and lock in the crucial-insight lines.", "Redo the MCQs until you score full marks, and reread every explanation.", "Write the key definitions and diagrams from memory, then check them."]
    }));
    return { topics: picked, summary: { confidence: prep >= 3 ? "75%" : prep >= 1 ? "60%" : "45%", targetScore: targetFor(goal), focusAreas: picked.slice(0, 3).map((t) => t.topic) } };
  };

  const generatePlan = async () => {
    if (!courseId || busy) return;
    setBusy(true); setOffline(false);
    const course = courseById(courseId);
    const allTopics = TOPICS[courseId] || [];
    // Cap how many topics we ask the AI to detail, so the JSON reply stays small
    // enough to complete within the function timeout and not get cut off.
    const maxTopics = Math.max(4, Math.min(8, Math.round(hours * 1.2)));
    const topics = allTopics.slice(0, maxTopics);
    const prompt = `A KNUST medical laboratory science student is cramming for their ${course.name} (${course.code}) exam with ${hours} hours left. Preparation: "${prepOptions[prep]}". Goal: ${goal}. Format: ${examType}.
Topics to cover (already prioritised): ${topics.join("; ")}.

You are triaging for the exam, NOT teaching. For each topic give 3 to 5 "bullets" that are the actual exam-guaranteed facts to MEMORISE - specific definitions, values, classifications, steps, enzymes, or one-liners. NOT study instructions. Keep each bullet short. Example style: "Resting potential = -70 mV, set by K+ permeability"; "Na/K pump: 3 Na out, 2 K in per ATP - electrogenic".

Return ONLY compact JSON, no markdown, no trailing commas, all strings short: {"topics":[{"topic":"name","allocatedMinutes":20,"priority":"High","bullets":["fact","fact","fact"]}],"summary":{"confidence":"65%","targetScore":"70%","focusAreas":["area","area","area"]}}`;
    let lastErr = "";
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await callClaude("You are LAMLA, an exam-cram assistant for KNUST medical laboratory science students. You give precise, memorisable facts - definitions, values, classifications, steps - never vague study advice. Return ONLY valid, compact, complete JSON. No emojis.", [{ role: "user", content: prompt }], 4000);
        const data = parseAIJson(res);
        if (!data || !Array.isArray(data.topics) || !data.topics.length) throw new Error("unexpected shape from AI");
        setPlan(data); setOffline(false); setStep("plan"); setBusy(false);
        return;
      } catch (e) {
        lastErr = e && e.message ? e.message : "unknown error";
      }
    }
    // both attempts failed - fall back to the offline ordering and show why
    setPlan(fallbackPlan()); setOffline(true); setOfflineReason(lastErr);
    setStep("plan"); setBusy(false);
  };

  if (step === "setup") {
    return (
      <div className="view">
        <div className="eyebrow">LAMLA</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,28px)", margin: "6px 0 4px" }}>Last Minute Learners Association</h1>
        <p style={{ color: "var(--text-2)", marginTop: 0 }}>Exam close and no time to learn everything? Tell LAMLA your situation and it hands you a cram sheet - the exact facts most likely to be on the paper, in bullets you can memorise fast.</p>
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
            {busy ? "Building your cram sheet..." : "Build my cram sheet"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="view">
      <button className="back" onClick={() => { setStep("setup"); setPlan(null); }}><Ic.chevR p={15} style={{ transform: "rotate(180deg)" }} /> Back</button>
      <div className="eyebrow">LAMLA · cram sheet</div>
      <h1 style={{ fontSize: "clamp(22px,4vw,28px)", margin: "6px 0 4px" }}>{courseById(courseId)?.name}</h1>
      <div className="card card-feature" style={{ marginTop: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, textAlign: "center" }}>
          <div><div className="eyebrow">Time</div><div style={{ fontSize: 20, fontWeight: 700, color: "var(--amber)" }}>{hours}h</div></div>
          <div><div className="eyebrow">Topics</div><div style={{ fontSize: 20, fontWeight: 700, color: "var(--good)" }}>{plan?.topics?.length || 0}</div></div>
          <div><div className="eyebrow">Confidence</div><div style={{ fontSize: 20, fontWeight: 700, color: "var(--amber-2)" }}>{plan?.summary?.confidence || "60%"}</div></div>
          <div><div className="eyebrow">Target</div><div style={{ fontSize: 20, fontWeight: 700, color: "var(--amber)" }}>{plan?.summary?.targetScore || targetFor(goal)}</div></div>
        </div>
      </div>
      {offline && <div className="card" style={{ marginTop: 12, color: "var(--text-2)", fontSize: 13.5, lineHeight: 1.6 }}>The live cram sheet could not be built this time{offlineReason ? " (" + offlineReason + ")" : ""}, so this is ASCEND's offline ordering - study these topics top to bottom, highest priority first. Try again in a moment for the full memorise-this list.</div>}
      <div className="card" style={{ marginTop: 12 }}>
        <div className="eyebrow">Most likely to be tested</div>
        <p style={{ color: "var(--text-2)", marginTop: 4 }}>{plan?.summary?.focusAreas?.join(" · ") || "Key topics only"}</p>
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <div className="eyebrow" style={{ marginBottom: 4 }}>What to memorise, in priority order</div>
        <p style={{ color: "var(--text-3)", fontSize: 12.5, marginTop: 0, marginBottom: 8, lineHeight: 1.6 }}>These are the facts most likely to come up. Burn them in - do not stop to learn full lessons.</p>
        {(plan?.topics || []).map((t, i) => (
          <div key={i} style={{ padding: "14px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
              <span className="mono" style={{ color: "var(--amber)", fontSize: 12 }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ fontWeight: 700, fontSize: 15, flex: 1, minWidth: 140 }}>{t.topic}</span>
              <span className="mono" style={{ fontSize: 12, color: "var(--amber)" }}>{t.allocatedMinutes} min</span>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 5, background: t.priority === "High" ? "var(--amber-dim)" : "var(--bg-3)", color: t.priority === "High" ? "var(--amber-2)" : "var(--text-3)" }}>{t.priority || "Med"}</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 7 }}>
              {(t.bullets || []).map((b, bi) => (
                <li key={bi} style={{ display: "flex", gap: 9, alignItems: "flex-start", color: "var(--text)", fontSize: 14, lineHeight: 1.55 }}>
                  <span style={{ color: "var(--amber)", flexShrink: 0, marginTop: 6, width: 5, height: 5, borderRadius: "50%", background: "var(--amber)" }} />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <div className="eyebrow">How to use the time</div>
        <p style={{ color: "var(--text-2)", fontSize: 13.5, marginTop: 4, lineHeight: 1.6 }}>{hours < 2 ? "Under two hours: read each fact aloud once, then cover it and recall it. Do not open full lessons." : hours < 4 ? "A few hours: memorise the facts above, then blitz the MCQs for these topics to test recall." : "You have room: memorise these facts first, then open the full lessons for the High-priority topics to cement the mechanism."}</p>
      </div>
      <button className="btn btn-a" style={{ width: "100%", marginTop: 12, padding: "14px" }} onClick={() => app.go("courses")}>Open the topics</button>
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
  { key: "review", label: "Review", icon: "target" },
  { key: "tools", label: "Study Tools", icon: "star" },
  { key: "ranks", label: "Ranks", icon: "trophy" },
  { key: "papers", label: "Papers", icon: "file" },
  { key: "plan", label: "CWA", icon: "target" },
  { key: "resources", label: "Resources", icon: "upload" },
  { key: "lamla", label: "LAMLA", icon: "clock" },
  { key: "feedback", label: "Feedback", icon: "star" }
];

const DEFAULT_PROGRESS = { name: "Prince", xp: 0, streak: 0, lastActive: shift(-1), dailyDone: {}, completed: {}, review: [], scores: {} };

/* ------------------------------- app ------------------------------------ */
export default function App() {
  const [route, setRoute] = useState({ view: "home" });

  // Make the iPhone edge-swipe and the browser/hardware back button work:
  // when the user goes back, restore the route we saved in history rather than
  // leaving the app. If there is no saved route (they are at the first screen),
  // send them to home instead of off the site.
  useEffect(() => {
    if (typeof window === "undefined") return;
    // seed the first history entry so the very first back press has somewhere to land
    try { window.history.replaceState({ ascendRoute: { view: "home" } }, ""); } catch {}
    const onPop = (e) => {
      const saved = e.state && e.state.ascendRoute ? e.state.ascendRoute : { view: "home" };
      setRoute(saved);
      setMenuOpen(false);
      window.scrollTo?.(0, 0);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const [progress, setProgress] = useState(DEFAULT_PROGRESS);
  const [auth, setAuth] = useState(null);
  const [supaUid, setSupaUid] = useState(null); // set when signed in via Supabase (Google)
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

    // PWA icon and manifest are declared in public/index.html (real files), which
    // is the reliable way for phones - especially iPhone - to show the home-screen
    // icon. We only ensure the apple-touch-icon is present as a safety net here.
    const icon = "/ascend-icon.png";
    if (!document.querySelector('link[rel="apple-touch-icon"]')) {
      const aLink = document.createElement("link");
      aLink.rel = "apple-touch-icon"; aLink.href = icon;
      document.head.appendChild(aLink);
    }
    let meta = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
    if (!meta) { meta = document.createElement("meta"); meta.name = "apple-mobile-web-app-capable"; meta.content = "yes"; document.head.appendChild(meta); }

    // Register the service worker so ASCEND works offline and loads instantly,
    // saving students' mobile data. Fails silently where unsupported.
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      });
    }

    (async () => {
      const t = await store.get("ascend_theme");
      if (t === "light" || t === "dark") setTheme(t);

      // 1. Supabase session first (Google or email-via-Supabase). If present, it wins.
      try {
        const { data } = await supabase.auth.getSession();
        const sUser = data && data.session ? data.session.user : null;
        if (sUser) {
          await adoptSupabaseUser(sUser);
          setLoaded(true);
          return;
        }
      } catch {}

      // 2. Otherwise fall back to a local username/password session.
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

    // Listen for Google sign-in / sign-out happening after load (OAuth redirect).
    let sub;
    try {
      const res = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN" && session && session.user) {
          adoptSupabaseUser(session.user);
          setRoute({ view: "home" });
        }
        if (event === "SIGNED_OUT") {
          setSupaUid(null);
          setAuth(null);
        }
      });
      sub = res.data ? res.data.subscription : null;
    } catch {}

    return () => { try { document.head.removeChild(link); } catch {} try { sub && sub.unsubscribe(); } catch {} };
  }, []);

  // Bring a Supabase-authenticated user into the app: set auth, load their
  // progress from the cloud (creating a fresh record if this is their first time).
  const adoptSupabaseUser = async (sUser) => {
    const uid = sUser.id;
    const displayName =
      (sUser.user_metadata && (sUser.user_metadata.full_name || sUser.user_metadata.name)) ||
      (sUser.email ? sUser.email.split("@")[0] : "student");
    setSupaUid(uid);
    setAuth({ username: displayName, email: sUser.email, name: displayName, supabase: true });
    const cloud = await db.loadProgress(uid);
    const base = freshProgress(displayName);
    const merged = cloud ? { ...base, ...cloud, name: cloud.name || displayName } : { ...base, name: displayName };
    setProgress(merged);
    // Ensure this user appears on the class leaderboard from the moment they log
    // in - create/refresh their profile row directly, so nobody is missing even
    // if the signup trigger did not fire or they have not earned XP yet.
    try {
      await supabase.from("profiles").upsert({
        id: uid,
        name: merged.name,
        username: merged.name,
        xp: merged.xp || 0,
        streak: merged.streak || 0,
        updated_at: new Date().toISOString(),
      });
    } catch {}
    db.saveProgress(uid, merged);
  };

  const handleAuthed = async (acct) => {
    setAuth(acct);
    const p = await store.get(progKey(acct.username));
    setProgress(p ? { ...freshProgress(acct.username), ...p, name: acct.username } : freshProgress(acct.username));
    setRoute({ view: "home" });
  };
  const logout = async () => {
    if (supaUid) { try { await supabase.auth.signOut(); } catch {} setSupaUid(null); }
    await store.set("ascend_session", "");
    setAuth(null); setMenuOpen(false); setRoute({ view: "home" });
  };
  const toggleTheme = () => { const t = theme === "light" ? "dark" : "light"; setTheme(t); store.set("ascend_theme", t); };

  const persist = (p) => {
    setProgress(p);
    if (supaUid) {
      // signed in via Supabase: save to the cloud (cross-device + class leaderboard)
      db.saveProgress(supaUid, p);
    } else if (auth) {
      // local username/password account: save on this device AND publish to the
      // cloud leaderboard everyone reads, so this user is visible to the class.
      store.set(progKey(auth.username), p);
      store.setShared("ascend_board:" + p.name.toLowerCase().replace(/[^a-z0-9]/g, ""), { name: p.name, xp: p.xp, streak: p.streak });
      db.publishLocalUser(p.name, p.xp, p.streak);
    }
  };
  const go = (view, extra = {}) => {
    const next = { view, ...extra };
    setRoute(next);
    setMenuOpen(false);
    if (typeof window !== "undefined") {
      // Push this navigation into the browser history so the iPhone edge-swipe
      // and the browser/hardware back button move back through the app instead
      // of leaving the site.
      try { window.history.pushState({ ascendRoute: next }, ""); } catch {}
      window.scrollTo?.(0, 0);
    }
  };

  const recordDaily = (correct) => {
    const tk = todayKey();
    if (progress.dailyDone?.[tk]) return;
    const streak = progress.lastActive === shift(-1) ? progress.streak + 1 : (progress.lastActive === tk ? progress.streak : 1);
    persist({ ...progress, xp: progress.xp + (correct ? 20 : 5), streak, lastActive: tk, dailyDone: { ...progress.dailyDone, [tk]: true } });
  };
  const finishQuiz = (cid, tid, correct, missed = [], total = 0) => {
    const tkey = `${cid}:${tid}`;
    const firstTime = !progress.completed?.[tkey];
    // XP is only awarded the first time a topic is completed, so the leaderboard
    // rewards coverage, not grinding the same quiz over and over.
    const gained = firstTime ? correct * 10 : 0;
    // Build the review deck: keep previously-missed questions, add newly-missed
    // ones (de-duplicated by question text), so students can drill their weak spots.
    const prevReview = Array.isArray(progress.review) ? progress.review : [];
    const seen = new Set(prevReview.map((m) => m.q));
    const merged = [...prevReview];
    for (const m of missed) { if (!seen.has(m.q)) { merged.push(m); seen.add(m.q); } }
    // Record the best score percent for this topic, so the weak-spots dashboard
    // can show which topics the student is strongest and weakest on.
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const prevScores = progress.scores || {};
    const bestPrev = prevScores[tkey] || 0;
    const scores = { ...prevScores, [tkey]: Math.max(bestPrev, pct) };
    persist({ ...progress, xp: progress.xp + gained, completed: { ...progress.completed, [tkey]: true }, review: merged, scores });
  };
  // Remove a question from the review deck once the student answers it correctly there.
  const clearReviewItem = (questionText) => {
    const prev = Array.isArray(progress.review) ? progress.review : [];
    persist({ ...progress, review: prev.filter((m) => m.q !== questionText) });
  };
  const setName = async () => {
    if (typeof window === "undefined") return;
    const raw = window.prompt("Change your username (this is your name on the leaderboard)", progress.name);
    if (!raw) return;
    const newName = raw.trim().slice(0, 24);
    if (newName.length < 2 || newName === progress.name) return;

    if (supaUid) {
      // Supabase user: update the profile name in the cloud
      await db.setUsername(supaUid, newName);
      persist({ ...progress, name: newName });
      return;
    }
    // local account: remove old shared-board entry to avoid a duplicate, then sync
    if (progress.name) {
      const oldBoardKey = "ascend_board:" + String(progress.name).toLowerCase().replace(/[^a-z0-9]/g, "");
      try { if (hasWS()) { await window.storage.delete?.(oldBoardKey, true); } else { localStorage.removeItem(oldBoardKey); } } catch {}
    }
    if (auth) {
      const accounts = (await store.get("ascend_accounts")) || {};
      const key = auth.username.toLowerCase();
      if (accounts[key]) { accounts[key] = { ...accounts[key], name: newName }; await store.set("ascend_accounts", accounts); }
    }
    persist({ ...progress, name: newName });
  };

  const app = { progress, go, recordDaily, finishQuiz, clearReviewItem, supaUid, courseId: route.courseId, topicId: route.topicId };
  const render = () => {
    switch (route.view) {
      case "home": return <HomeView app={app} />;
      case "courses": return <CoursesView app={app} />;
      case "course": return <CourseView app={app} />;
      case "topic": return <TopicView app={app} />;
      case "quiz": return <QuizView app={app} />;
      case "daily": return <DailyView app={app} />;
      case "ranks": return <RanksView app={app} />;
      case "review": return <ReviewView app={app} />;
      case "tools": return <StudyToolsView />;
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
              <button className="avatar" onClick={setName} title="Tap to change your username">{progress.name[0]?.toUpperCase()}</button>
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
