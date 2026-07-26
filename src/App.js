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
.side{width:244px;flex-shrink:0;border-right:1px solid var(--line);padding:22px 16px;
  position:sticky;top:0;height:100vh;display:flex;flex-direction:column;gap:6px;overflow-y:auto}
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
.onlymobile{display:none}
/* large desktop: give the sidebar a little more room */
@media (min-width:1280px){
  .side{width:270px;padding:26px 20px}
  .content{padding:30px 44px 70px}
}
/* the switch to the mobile layout: single column, hamburger nav, full-bleed */
@media (max-width:900px){
  .side{display:none}
  .content{padding:16px 14px 50px}
  .content>.view{max-width:100%}
  .topbar{padding:10px 14px;gap:8px}
  .onlymobile{display:flex}
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
  topicIndex: 0,
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
  title: "Overview of Medical Psychology",
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
  title: "The Communication Process",
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

/* Registry: add each built topic here. */
const CONTENT = {
  "ana:0": T_ANA_POSITION,
  "ana:1": T_ANA_HISTO,
  "ana:2": T_ANA_EPI_OVERVIEW,
  "ana:3": T_ANA_EPI_MEMB,
  "phy:0": T_PHY_GENERAL,
  "bch:0": T_BCH_INTRO,
  "bio:0": T_BIO_AMINO,
  "psy:0": T_PSY_OVERVIEW,
  "com:0": T_COM_PROCESS,
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

async function callClaude(system, messages, maxTokens = 2048) {
  const body = JSON.stringify({ max_tokens: maxTokens, system, messages });
  let res;
  for (let attempt = 0; attempt < 3; attempt++) {
    res = await fetch(API_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body });
    if (res.ok) break;
    if (res.status === 429 || res.status === 529) { await new Promise((r) => setTimeout(r, 900 * (attempt + 1))); continue; }
    throw new Error("The AI service returned an error (" + res.status + ").");
  }
  if (!res.ok) throw new Error(res.status === 429 ? "The AI is busy right now. Wait a few seconds and try again." : "The AI service is unavailable at the moment.");
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
      app.finishQuiz(t.courseId, t.topicIndex, correct);
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
  useEffect(() => {
    (async () => {
      if (app.supaUid) {
        // class-wide leaderboard from Supabase - everyone who has signed up
        const rows = await db.leaderboard();
        setOthers(rows.filter((r) => r.id !== app.supaUid));
        return;
      }
      // local fallback: read the on-device shared board
      const keys = await store.listShared("ascend_board:");
      const rows = [];
      for (const k of keys) {
        const v = await store.get(k, true);
        if (v && v.name && k !== "ascend_board:" + meKey) rows.push(v);
      }
      setOthers(rows);
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
const freshProgress = (name) => ({ name, xp: 0, streak: 0, lastActive: null, dailyDone: {}, completed: {} });
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
    // ensure a profile/progress row exists from the start
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
      // local username/password account: save on this device
      store.set(progKey(auth.username), p);
      store.setShared("ascend_board:" + p.name.toLowerCase().replace(/[^a-z0-9]/g, ""), { name: p.name, xp: p.xp, streak: p.streak });
    }
  };
  const go = (view, extra = {}) => { setRoute({ view, ...extra }); setMenuOpen(false); if (typeof window !== "undefined") window.scrollTo?.(0, 0); };

  const recordDaily = (correct) => {
    const tk = todayKey();
    if (progress.dailyDone?.[tk]) return;
    const streak = progress.lastActive === shift(-1) ? progress.streak + 1 : (progress.lastActive === tk ? progress.streak : 1);
    persist({ ...progress, xp: progress.xp + (correct ? 20 : 5), streak, lastActive: tk, dailyDone: { ...progress.dailyDone, [tk]: true } });
  };
  const finishQuiz = (cid, tid, correct) => {
    const tkey = `${cid}:${tid}`;
    const firstTime = !progress.completed?.[tkey];
    // XP is only awarded the first time a topic is completed, so the leaderboard
    // rewards coverage, not grinding the same quiz over and over.
    const gained = firstTime ? correct * 10 : 0;
    persist({ ...progress, xp: progress.xp + gained, completed: { ...progress.completed, [tkey]: true } });
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

  const app = { progress, go, recordDaily, finishQuiz, supaUid, courseId: route.courseId, topicId: route.topicId };
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
