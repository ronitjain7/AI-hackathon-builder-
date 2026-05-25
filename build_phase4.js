const fs = require('fs');

const finalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>INCIDENTIQ — AI Incident Root Cause Analyzer</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><circle cx='8' cy='8' r='6' fill='%23FC8181'/></svg>">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
    :root {
      --bg-base:#0C0F14; --bg-surface:#111620; --bg-card:#161C27; --bg-input:#0A0D12;
      --border:rgba(255,255,255,0.07); --border-focus:rgba(99,179,237,0.4);
      --blue:#63B3ED; --teal:#4FD1C5; --amber:#F6AD55; --red:#FC8181; --green:#68D391; --purple:#B794F4;
      --tx-1:#E8EDF3; --tx-2:#A0AABA; --tx-3:#5C6878; --tx-4:#3A4455;
      --f-ui:'Inter',sans-serif; --f-mono:'JetBrains Mono',monospace; --f-head:'IBM Plex Sans',sans-serif;
      --r-sm:4px; --r-md:6px; --t-fast:0.15s ease; --t-med:0.25s ease;
    }
    *{box-sizing:border-box;margin:0;padding:0;}
    body{background:var(--bg-base);color:var(--tx-1);font-family:var(--f-ui);height:100vh;overflow:hidden;display:flex;flex-direction:column;-webkit-font-smoothing:antialiased;background-image:radial-gradient(circle,rgba(255,255,255,0.025) 1px,transparent 1px);background-size:28px 28px;}
    ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:var(--tx-4);border-radius:2px;}
    .mono{font-family:var(--f-mono);font-variant-numeric:tabular-nums;} .truncate{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}

    /* LOADING SCREEN */
    .loading-overlay { position:fixed; inset:0; background:#000; z-index:9999; display:flex; flex-direction:column; align-items:center; justify-content:center; transition:opacity 0.3s ease; }
    .loading-ascii { font-family:var(--f-mono); font-size:14px; color:var(--tx-2); white-space:pre; margin-bottom:20px; }
    .loading-sub { font-family:var(--f-mono); font-size:11px; color:var(--teal); margin-bottom:12px; }
    .loading-bar-wrap { width:240px; height:2px; background:rgba(255,255,255,0.1); overflow:hidden; }
    .loading-bar { height:100%; background:var(--teal); width:0%; animation:loadBar 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
    @keyframes loadBar { 0%{width:0%;} 70%{width:80%;} 100%{width:100%;} }

    /* NAV */
    .navbar{height:52px;display:flex;align-items:center;padding:0 24px;flex-shrink:0;border-bottom:1px solid var(--border);background:var(--bg-surface);z-index:100;}
    .logo{display:flex;align-items:center;gap:9px;width:210px;}
    .logo-text{font-family:var(--f-mono);font-size:14px;font-weight:600;color:var(--blue);letter-spacing:.08em;}
    .logo-dot{width:7px;height:7px;background:var(--green);border-radius:50%;box-shadow:0 0 6px var(--green);animation:breathe 3s ease-in-out infinite;flex-shrink:0;}
    .tabs{flex:1;display:flex;height:100%;}
    .tab{font-size:12px;font-weight:500;letter-spacing:.06em;color:var(--tx-3);cursor:pointer;padding:0 18px;border:none;border-bottom:2px solid transparent;background:none;display:flex;align-items:center;text-transform:uppercase;transition:color var(--t-fast),border-color var(--t-fast);}
    .tab:hover{color:var(--tx-2);} .tab.active{color:var(--blue);border-bottom-color:var(--blue);}
    .nav-right{display:flex;align-items:center;gap:8px;}
    .status-pill{display:flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;font-family:var(--f-mono);font-size:10px;font-weight:500;border:1px solid;letter-spacing:.04em;}
    .pill-green{color:var(--green);border-color:rgba(104,211,145,.25);background:rgba(104,211,145,.06);}
    .pill-amber{color:var(--amber);border-color:rgba(246,173,85,.25);background:rgba(246,173,85,.06);animation:shimmerBorder 3s ease-in-out infinite;}
    .pill-muted{color:var(--tx-2);border-color:var(--border);background:rgba(255,255,255,.03);}
    .pill-dot{width:5px;height:5px;border-radius:50%;}
    .pill-dot.g{background:var(--green);} .pill-dot.a{background:var(--amber);animation:breathe 2s ease-in-out infinite;}
    
    .btn-demo { background:#FFB300; color:#000; font-family:var(--f-mono); font-size:11px; font-weight:700; padding:6px 12px; border-radius:20px; border:none; cursor:pointer; margin-right:8px; animation:pulseAmber 2s infinite; transition:all var(--t-fast); }
    .btn-demo.active { background:var(--red); color:#fff; animation:none; border:1px solid rgba(255,255,255,0.3); }
    @keyframes pulseAmber { 0%{box-shadow:0 0 0 0 rgba(255,179,0,0.4);} 70%{box-shadow:0 0 0 6px rgba(255,179,0,0);} 100%{box-shadow:0 0 0 0 rgba(255,179,0,0);} }

    .avatar{width:30px;height:30px;border-radius:50%;border:1px solid rgba(99,179,237,.3);background:rgba(99,179,237,.1);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:var(--blue);cursor:pointer;margin-left:4px;}

    .demo-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:9998; display:flex; flex-direction:column; align-items:center; justify-content:center; opacity:0; pointer-events:none; transition:opacity 0.3s ease; }
    .demo-overlay.show { opacity:1; }
    .demo-overlay h1 { font-family:var(--f-mono); font-size:32px; color:var(--teal); margin-bottom:12px; letter-spacing:0.1em; }
    .demo-overlay p { font-family:var(--f-mono); font-size:14px; color:var(--tx-3); }
    
    .demo-banner { background:rgba(246,173,85,0.15); border-bottom:1px solid rgba(246,173,85,0.3); color:var(--amber); font-family:var(--f-mono); font-size:10px; text-align:center; padding:6px; display:flex; justify-content:center; align-items:center; gap:16px; flex-shrink:0; }
    .demo-banner-close { cursor:pointer; font-size:12px; opacity:0.7; }
    .demo-banner-close:hover { opacity:1; }

    /* SETTINGS BAR */
    .settings-bar{height:38px;display:flex;align-items:center;padding:0 24px;gap:12px;flex-shrink:0;border-bottom:1px solid var(--border);background:#0E1219;z-index:99;}
    .sb-label{font-family:var(--f-mono);font-size:10px;font-weight:600;letter-spacing:.1em;color:var(--tx-3);text-transform:uppercase;white-space:nowrap;display:flex;align-items:center;gap:6px;}
    .sb-key-input{flex:1;max-width:420px;background:var(--bg-input);border:1px solid var(--border);color:var(--tx-1);font-family:var(--f-mono);font-size:10px;padding:4px 10px;border-radius:var(--r-sm);outline:none;transition:border-color var(--t-fast);}
    .sb-key-input:focus{border-color:var(--border-focus);}
    .sb-key-input::placeholder{color:var(--tx-4);}
    .sb-connect{font-family:var(--f-mono);font-size:10px;font-weight:600;letter-spacing:.06em;padding:4px 14px;border-radius:var(--r-sm);cursor:pointer;border:1px solid;transition:all var(--t-fast);white-space:nowrap;}
    .sb-connect.idle{color:var(--blue);border-color:rgba(99,179,237,.35);background:transparent;}
    .sb-connect.idle:hover{background:rgba(99,179,237,.1);}
    .sb-connect.connected{color:var(--green);border-color:rgba(104,211,145,.35);background:rgba(104,211,145,.08);}
    .sb-connect.error{color:var(--red);border-color:rgba(252,129,129,.35);background:rgba(252,129,129,.08);}
    .sb-status{font-family:var(--f-mono);font-size:10px;color:var(--tx-4);letter-spacing:.04em;}

    /* LAYOUT */
    .body-layout{display:flex;flex:1;overflow:hidden;min-height:0;}

    /* SIDEBAR */
    .sidebar{width:256px;border-right:1px solid var(--border);display:flex;flex-direction:column;background:var(--bg-surface);flex-shrink:0;overflow:hidden;}
    .side-section-hdr{font-size:10px;font-weight:600;letter-spacing:.12em;color:var(--tx-3);text-transform:uppercase;padding:14px 16px 10px;}
    .inc-list{display:flex;flex-direction:column;gap:4px;padding:0 10px 10px;overflow-y:auto;flex:1;}
    .inc-card{padding:10px 12px;border-radius:var(--r-md);border:1px solid transparent;border-left:2px solid var(--tx-4);background:transparent;cursor:pointer;display:flex;flex-direction:column;gap:5px;transition:background var(--t-fast),border-color var(--t-fast);}
    .inc-card:hover{background:rgba(255,255,255,.03);}
    .inc-card.active{background:rgba(99,179,237,.07);border-color:rgba(99,179,237,.18);border-left-width:3px;}
    .inc-card.sev-CRITICAL{border-left-color:var(--red);} .inc-card.sev-HIGH{border-left-color:var(--amber);} .inc-card.sev-MEDIUM{border-left-color:var(--blue);} .inc-card.sev-LOW{border-left-color:var(--tx-4);}
    .inc-card.active.sev-CRITICAL{background:rgba(252,129,129,.06);border-color:rgba(252,129,129,.2);}
    .inc-card.active.sev-HIGH{background:rgba(246,173,85,.06);border-color:rgba(246,173,85,.2);}
    .inc-card.active.sev-MEDIUM{background:rgba(99,179,237,.06);border-color:rgba(99,179,237,.2);}
    
    @keyframes borderFlashRed { 0%{border-color:var(--red);background:rgba(252,129,129,.1);} 50%{border-color:rgba(255,255,255,0.1);background:transparent;} 100%{border-color:var(--red);background:rgba(252,129,129,.1);} }
    .inc-card.flash-red { animation:borderFlashRed 0.6s 3; border-left-color:var(--red); }
    .inc-card.resolved-green { border-left-color:var(--green); }

    .inc-top{display:flex;justify-content:space-between;align-items:center;}
    .inc-sev-tag{font-family:var(--f-mono);font-size:9px;font-weight:600;letter-spacing:.08em;padding:2px 6px;border-radius:3px;}
    .sev-CRITICAL .inc-sev-tag{color:var(--red);background:rgba(252,129,129,.12);}
    .sev-HIGH .inc-sev-tag{color:var(--amber);background:rgba(246,173,85,.12);}
    .sev-MEDIUM .inc-sev-tag{color:var(--blue);background:rgba(99,179,237,.12);}
    .sev-LOW .inc-sev-tag{color:var(--tx-3);background:rgba(255,255,255,.08);}
    .inc-ts{font-family:var(--f-mono);font-size:10px;color:var(--tx-3);}
    .inc-title{font-size:12px;font-weight:500;line-height:1.35;color:var(--tx-1);}
    .inc-svc{font-family:var(--f-mono);font-size:10px;color:var(--tx-3);display:flex;align-items:center;gap:6px;}
    .pbar-bg{height:2px;background:rgba(255,255,255,.06);border-radius:1px;overflow:hidden;}
    .pbar-fill{height:100%;border-radius:1px;transition:width .5s ease;}
    .sev-CRITICAL .pbar-fill{background:var(--red);} .sev-HIGH .pbar-fill{background:var(--amber);} .sev-MEDIUM .pbar-fill{background:var(--blue);} .sev-LOW .pbar-fill{background:var(--tx-4);}
    .pbar-fill.analyzing{animation:shimmerFill 1.8s linear infinite;background-size:200% 100%;}
    .sev-CRITICAL .pbar-fill.analyzing{background-image:linear-gradient(90deg,var(--red) 0%,rgba(255,255,255,.5) 50%,var(--red) 100%);}
    .sev-HIGH .pbar-fill.analyzing{background-image:linear-gradient(90deg,var(--amber) 0%,rgba(255,255,255,.5) 50%,var(--amber) 100%);}
    .sev-MEDIUM .pbar-fill.analyzing{background-image:linear-gradient(90deg,var(--blue) 0%,rgba(255,255,255,.4) 50%,var(--blue) 100%);}
    .sidebar-divider{height:1px;background:var(--border);margin:0 10px;}
    .sources-block{padding:10px 16px 14px;flex-shrink:0;}
    .src-row{display:flex;justify-content:space-between;align-items:center;padding:5px 0;}
    .src-left{display:flex;align-items:center;gap:8px;font-family:var(--f-mono);font-size:11px;color:var(--tx-2);}
    .src-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
    .src-dot.live{background:var(--green);box-shadow:0 0 5px rgba(104,211,145,.6);} .src-dot.warn{background:var(--amber);box-shadow:0 0 5px rgba(246,173,85,.6);}
    .src-badge{font-family:var(--f-mono);font-size:9px;font-weight:600;padding:1px 6px;border-radius:3px;}
    .src-badge.live{color:var(--green);background:rgba(104,211,145,.1);} .src-badge.warn{color:var(--amber);background:rgba(246,173,85,.1);}

    /* MAIN */
    .main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
    .subhead{height:48px;display:flex;justify-content:space-between;align-items:center;padding:0 20px;border-bottom:1px solid var(--border);flex-shrink:0;background:rgba(17,22,32,.6);}
    .subhead-title{font-size:13px;font-weight:500;color:var(--tx-1);}
    .btn-row{display:flex;gap:8px;position:relative;}
    .btn-outline{background:transparent;border:1px solid rgba(99,179,237,.3);color:var(--blue);font-family:var(--f-mono);font-size:10px;font-weight:500;padding:5px 12px;cursor:pointer;border-radius:var(--r-sm);transition:background var(--t-fast),border-color var(--t-fast);letter-spacing:.06em;}
    .btn-outline:hover{background:rgba(99,179,237,.08);border-color:rgba(99,179,237,.5);}
    .btn-outline:active{transform:scale(.98);} .btn-outline:disabled{opacity:.45;cursor:default;}
    .btn-outline.cooldown{color:var(--tx-3);border-color:rgba(255,255,255,.1);}
    
    .export-dropdown { position:absolute; top:32px; right:0; background:var(--bg-card); border:1px solid var(--border); border-radius:var(--r-sm); box-shadow:0 8px 16px rgba(0,0,0,0.5); z-index:50; display:flex; flex-direction:column; min-width:160px; overflow:hidden; }
    .export-opt { background:transparent; border:none; color:var(--tx-2); font-family:var(--f-mono); font-size:10px; padding:10px 14px; text-align:left; cursor:pointer; transition:background var(--t-fast); }
    .export-opt:hover { background:rgba(255,255,255,0.05); color:var(--tx-1); }
    .export-opt:not(:last-child) { border-bottom:1px solid var(--border); }

    .panels{flex:1;padding:14px;display:flex;flex-direction:column;gap:12px;overflow:hidden;}
    .panel{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md);display:flex;flex-direction:column;overflow:hidden;}
    .panel-header{display:flex;justify-content:space-between;align-items:center;padding:0 14px;height:36px;border-bottom:1px solid var(--border);flex-shrink:0;}
    .panel-label{font-size:10px;font-weight:600;letter-spacing:.1em;color:var(--tx-3);text-transform:uppercase;}
    .badge{font-family:var(--f-mono);font-size:9px;font-weight:600;padding:2px 7px;border-radius:3px;letter-spacing:.04em;}
    .badge-blue{color:var(--blue);background:rgba(99,179,237,.1);border:1px solid rgba(99,179,237,.2);}
    .badge-green{color:var(--green);background:rgba(104,211,145,.1);border:1px solid rgba(104,211,145,.2);}
    .badge-live{display:flex;align-items:center;gap:4px;color:var(--green);font-family:var(--f-mono);font-size:10px;}
    .badge-live-dot{width:5px;height:5px;background:var(--green);border-radius:50%;animation:breathe 2s ease-in-out infinite;}

    /* TIMELINE */
    .tl-panel{height:230px;flex-shrink:0;}
    .tl-body{flex:1;padding:10px 14px 0;display:flex;flex-direction:column;overflow:hidden;}
    .swimlanes{flex:1;display:flex;flex-direction:column;justify-content:space-around;}
    .swimlane{display:flex;align-items:center;height:36px;}
    .sl-label{width:128px;font-family:var(--f-mono);font-size:10px;color:var(--tx-3);flex-shrink:0;padding-right:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .sl-track{flex:1;height:28px;position:relative;}
    .sl-baseline{position:absolute;bottom:0;left:0;right:0;height:1px;background:rgba(255,255,255,.06);}
    .tick{position:absolute;bottom:0;width:3px;cursor:pointer;transform:translateX(-50%);border-radius:2px 2px 0 0;transition:filter var(--t-fast);}
    .tick.crit{background:var(--red);height:20px;box-shadow:0 0 8px rgba(252,129,129,.35);}
    .tick.high{background:var(--amber);height:13px;box-shadow:0 0 6px rgba(246,173,85,.3);}
    .tick.info{background:var(--teal);height:8px;box-shadow:0 0 5px rgba(79,209,197,.3);}
    .tick:hover{filter:brightness(1.35);z-index:20;}
    .tick-tip{display:none;position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);background:var(--bg-surface);border:1px solid rgba(99,179,237,.25);padding:7px 10px;font-family:var(--f-mono);font-size:10px;color:var(--tx-1);width:210px;white-space:normal;z-index:50;line-height:1.5;border-radius:var(--r-sm);box-shadow:0 8px 24px rgba(0,0,0,.6);}
    .tick:hover .tick-tip{display:block;}
    .tip-time{color:var(--blue);font-weight:600;display:block;margin-bottom:3px;}
    .detect-line{position:absolute;right:0;top:0;bottom:0;border-right:1px dashed rgba(252,129,129,.4);}
    .detect-lbl{position:absolute;top:0;right:4px;font-family:var(--f-mono);font-size:9px;color:rgba(252,129,129,.7);white-space:nowrap;letter-spacing:.04em;}
    .tl-axis{padding-left:128px;padding-top:6px;padding-bottom:8px;flex-shrink:0;}
    .tl-axis-inner{position:relative;height:13px;border-top:1px solid rgba(255,255,255,.05);}
    .tl-lbl{position:absolute;transform:translateX(-50%);font-family:var(--f-mono);font-size:9px;color:var(--tx-3);top:3px;}

    /* LOG STREAM */
    .logs-panel{flex:1;min-height:0;}
    .log-hdr-left{display:flex;align-items:center;gap:12px;}
    .filter-input{background:var(--bg-input);border:1px solid var(--border);color:var(--tx-1);font-family:var(--f-mono);font-size:10px;padding:4px 10px;width:190px;border-radius:var(--r-sm);outline:none;transition:border-color var(--t-fast);}
    .filter-input:focus{border-color:var(--border-focus);}
    .filter-input::placeholder{color:var(--tx-4);}
    .log-view{flex:1;overflow-y:auto;padding:8px 14px;background:var(--bg-input);}
    .log-empty{color:var(--tx-4);font-family:var(--f-mono);font-size:11px;text-align:center;padding:32px 0;letter-spacing:.05em;}
    .log-line{display:flex;align-items:baseline;gap:10px;font-family:var(--f-mono);font-size:11px;line-height:1.7;padding:1px 6px;border-radius:3px;transition:background var(--t-fast);}
    .log-line:hover{background:rgba(255,255,255,.025);}
    @keyframes logFlash { 0%{background:rgba(79,209,197,0.3);} 100%{background:transparent;} }
    .log-line.flash-highlight { animation:logFlash 1s ease-out; }
    .log-ts{color:var(--tx-4);width:88px;flex-shrink:0;}
    .log-lvl-w{width:48px;flex-shrink:0;}
    .log-lvl{font-size:9px;font-weight:600;padding:1px 5px;border-radius:3px;letter-spacing:.04em;}
    .log-lvl.FATAL{background:rgba(252,129,129,.4);color:#fff;}
    .log-lvl.CRITICAL{background:rgba(252,129,129,.2);color:var(--red);}
    .log-lvl.ERROR{background:rgba(252,129,129,.15);color:var(--red);}
    .log-lvl.WARN{background:rgba(246,173,85,.15);color:var(--amber);}
    .log-lvl.INFO{background:rgba(79,209,197,.12);color:var(--teal);}
    .log-lvl.DEBUG{color:var(--tx-4);}
    .log-svc{color:var(--blue);width:130px;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;opacity:.8;}
    .log-msg{color:var(--tx-2);flex:1;font-size:10.5px;word-break:break-all;}

    /* RIGHT PANEL */
    .right-panel{width:320px;border-left:1px solid var(--border);background:var(--bg-surface);display:flex;flex-direction:column;overflow-y:auto;flex-shrink:0;padding:16px;gap:14px;}
    .rp-section-hdr{display:flex;justify-content:space-between;align-items:center;}
    .rp-title{font-size:10px;font-weight:600;letter-spacing:.1em;color:var(--tx-3);text-transform:uppercase;}
    .rp-divider{height:1px;background:var(--border);margin:4px 0;}
    
    .rca-fade-in { animation:rcaFadeIn 0.4s ease forwards; opacity:0; }
    @keyframes rcaFadeIn { to {opacity:1;} }
    
    .causes{display:flex;flex-direction:column;gap:12px;}
    .cause-card{display:flex;flex-direction:column;gap:5px;}
    .cause-top{display:flex;justify-content:space-between;align-items:flex-end;}
    .cause-rank{font-size:10px;color:var(--tx-4);}
    .cause-pct{font-family:var(--f-mono);font-size:11px;font-weight:600;color:var(--blue);}
    .cause-bar{height:2px;background:rgba(255,255,255,.05);border-radius:1px;overflow:hidden;}
    .cause-bar-fill{height:100%;background:var(--blue);border-radius:1px;}
    .cause-title{font-family:var(--f-head);font-size:13px;font-weight:500;color:var(--tx-1);line-height:1.4;margin-top:2px;}
    .cause-desc{font-size:11px;color:var(--tx-3);line-height:1.5;}
    .cause-evidence{font-size:10px;color:var(--amber);background:rgba(246,173,85,.08);padding:4px 8px;border-radius:3px;margin-top:4px;}
    
    .fixes{display:flex;flex-direction:column;gap:14px;}
    .fix-head{display:flex;gap:6px;align-items:baseline;margin-bottom:6px;}
    .fix-step{font-family:var(--f-mono);font-size:10px;color:var(--blue);font-weight:600;}
    .fix-action{font-family:var(--f-head);font-size:13px;font-weight:500;color:var(--tx-1);line-height:1.3;}
    .cmd-box{background:#060809;border:1px solid var(--border);border-radius:3px;display:flex;justify-content:space-between;align-items:center;padding:4px 4px 4px 10px;}
    .cmd-text{font-size:10.5px;color:var(--teal);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding-right:10px;}
    .btn-copy{background:transparent;border:1px solid var(--border);color:var(--tx-3);font-family:var(--f-mono);font-size:9px;font-weight:600;padding:4px 8px;border-radius:2px;cursor:pointer;transition:all var(--t-fast);flex-shrink:0;}
    .btn-copy:hover{border-color:var(--tx-3);color:var(--tx-2);}
    .btn-copy.done{background:var(--green);color:#000;border-color:var(--green);}
    .fix-rationale{font-size:11px;color:var(--tx-3);line-height:1.4;margin-top:5px;}
    
    .metrics-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
    .metric-tile{display:flex;flex-direction:column;gap:4px;}
    .metric-lbl{font-size:9px;font-weight:600;letter-spacing:.05em;color:var(--tx-4);}
    .metric-val{font-size:14px;}
    .metric-val.green{color:var(--green);} .metric-val.amber{color:var(--amber);} .metric-val.red{color:var(--red);} .metric-val.blue{color:var(--blue);}
    
    .btn-slack{background:rgba(255,255,255,.05);border:1px solid var(--border);color:var(--tx-2);font-size:11px;font-weight:500;padding:10px;border-radius:var(--r-sm);cursor:pointer;transition:background var(--t-fast);margin-top:auto;}
    .btn-slack:hover{background:rgba(255,255,255,.1);}
    
    /* RCA STATES */
    .rca-idle, .rca-error, .rca-analyzing { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:20px; }
    .rca-idle-icon { font-size:32px; margin-bottom:16px; opacity:0.8; }
    .rca-idle-title { font-size:12px; font-weight:600; color:var(--tx-2); letter-spacing:.05em; margin-bottom:8px; }
    .rca-idle-sub { font-size:11px; color:var(--tx-4); line-height:1.5; }
    .error-icon { font-size:32px; margin-bottom:16px; }
    .error-title { font-size:12px; font-weight:600; color:var(--red); letter-spacing:.05em; margin-bottom:8px; }
    .error-msg { font-size:11px; color:var(--tx-3); margin-bottom:20px; word-break:break-word; }
    .btn-retry { background:transparent; border:1px solid rgba(252,129,129,.4); color:var(--red); font-family:var(--f-mono); font-size:10px; padding:6px 16px; border-radius:3px; cursor:pointer; }
    .btn-retry:hover { background:rgba(252,129,129,.1); }
    .analyzing-header { width:100%; display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
    .analyzing-title { font-size:11px; font-weight:600; color:var(--blue); letter-spacing:.05em; animation:pulse 1.5s infinite; }
    .analyzing-timer { font-size:12px; color:var(--tx-2); }
    .stream-box { width:100%; height:160px; background:#000; border:1px solid var(--border); border-radius:4px; padding:10px; font-family:var(--f-mono); font-size:10px; color:var(--tx-3); text-align:left; overflow-y:auto; line-height:1.5; margin-bottom:16px; white-space:pre-wrap; word-break:break-all; }
    .skeleton-cards { width:100%; display:flex; flex-direction:column; gap:10px; margin-bottom:20px; }
    .skeleton-card { background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.05); border-radius:4px; padding:12px; display:flex; flex-direction:column; gap:8px; }
    .skeleton-line { height:8px; background:rgba(255,255,255,.05); border-radius:4px; }
    .w40 { width:40%; } .w60 { width:60%; } .w80 { width:80%; }
    .progress-bar-wrap { width:100%; height:2px; background:rgba(255,255,255,.05); border-radius:1px; overflow:hidden; }
    .progress-bar-fill { height:100%; background:var(--blue); width:30%; animation:shimmerFill 1.5s infinite; background-size:200% 100%; background-image:linear-gradient(90deg,var(--blue) 0%,rgba(255,255,255,.5) 50%,var(--blue) 100%); }
    .summary-box { background:rgba(99,179,237,.05); border:1px solid rgba(99,179,237,.15); padding:10px 12px; border-radius:var(--r-sm); margin-top:4px; }
    .summary-title { font-size:10px; font-weight:600; color:var(--blue); text-transform:uppercase; margin-bottom:6px; letter-spacing:.05em; }
    .summary-text { font-size:11px; color:var(--tx-2); line-height:1.5; }
    .token-row { font-size:9px; color:var(--tx-4); text-align:center; }
    .analyzed-in { font-family:var(--f-mono); font-size:9px; color:var(--tx-4); }

    /* TOAST */
    .toast-container{position:fixed;bottom:24px;right:24px;z-index:999;display:flex;flex-direction:column;gap:10px;pointer-events:none;}
    .toast{background:var(--bg-card);border:1px solid var(--border);border-left:3px solid var(--green);padding:12px 16px;border-radius:var(--r-md);display:flex;align-items:center;gap:12px;box-shadow:0 8px 24px rgba(0,0,0,0.4);animation:slideIn var(--t-med);pointer-events:auto;}
    .toast.t-warn{border-left-color:var(--amber);} .toast.t-error{border-left-color:var(--red);}
    .toast-icon{font-size:16px;} .toast-msg{font-size:12px;font-weight:500;color:var(--tx-1);}

    /* INGEST LOGS */
    .ingest-panel { flex:1; padding:20px 24px; display:flex; flex-direction:column; overflow-y:auto; gap:16px; background:var(--bg-card); }
    .ingest-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
    .ingest-tabs { display:flex; gap:8px; }
    .ingest-tab { font-family:var(--f-mono); font-size:11px; font-weight:600; padding:6px 14px; background:rgba(255,255,255,.05); border:1px solid var(--border); color:var(--tx-3); cursor:pointer; border-radius:3px; transition:all var(--t-fast); }
    .ingest-tab.active { background:rgba(99,179,237,.1); border-color:var(--blue); color:var(--blue); }
    .ingest-cols { display:flex; gap:16px; min-height:400px; }
    .ingest-col-left { width:60%; display:flex; flex-direction:column; gap:12px; }
    .ingest-col-right { width:40%; display:flex; flex-direction:column; gap:12px; }
    .ingest-hdr-text { font-family:var(--f-mono); font-size:10px; color:var(--tx-3); text-transform:uppercase; letter-spacing:.08em; font-weight:600; }
    .ingest-meta-row { display:flex; gap:10px; }
    .meta-input { flex:1; background:var(--bg-input); border:1px solid rgba(79,209,197,.3); color:var(--tx-1); font-family:var(--f-mono); font-size:11px; height:28px; padding:0 8px; border-radius:3px; outline:none; }
    .meta-input:focus { border-color:var(--teal); }
    .meta-select { flex:1; background:var(--bg-input); border:1px solid rgba(79,209,197,.3); color:var(--tx-1); font-family:var(--f-mono); font-size:11px; height:28px; padding:0 8px; border-radius:3px; outline:none; }
    .log-textarea { flex:1; height:320px; width:100%; background:#0A0C0F; border:1px solid rgba(79,209,197,.3); color:var(--tx-1); font-family:var(--f-mono); font-size:11px; padding:12px; border-radius:4px; outline:none; resize:none; line-height:1.5; caret-color:var(--teal); }
    .log-textarea:focus { border-color:var(--teal); }
    .log-textarea::placeholder { color:var(--tx-4); }
    .char-count { font-family:var(--f-mono); font-size:10px; color:var(--tx-4); text-align:right; }
    .btn-ingest-action { display:flex; gap:10px; }
    .btn-cyan { background:rgba(79,209,197,.15); color:var(--teal); border:1px solid rgba(79,209,197,.4); font-family:var(--f-mono); font-size:13px; font-weight:600; padding:8px 16px; border-radius:3px; cursor:pointer; transition:all var(--t-fast); text-align:center; }
    .btn-cyan:hover:not(:disabled) { background:rgba(79,209,197,.25); border-color:var(--teal); }
    .btn-cyan:disabled { opacity:0.5; cursor:not-allowed; border-color:rgba(255,255,255,.1); color:var(--tx-3); background:rgba(255,255,255,.05); }
    .btn-muted { background:transparent; color:var(--tx-3); border:1px solid var(--border); font-family:var(--f-mono); font-size:13px; padding:8px 16px; border-radius:3px; cursor:pointer; }
    .btn-muted:hover { color:var(--tx-2); border-color:var(--tx-3); }
    .drop-zone { flex:1; min-height:280px; border:2px dashed rgba(79,209,197,.4); border-radius:4px; background:var(--bg-input); display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; transition:all var(--t-fast); gap:8px; }
    .drop-zone.drag-over { border-color:var(--teal); background:rgba(0,229,255,0.04); }
    .drop-icon { font-size:48px; color:rgba(79,209,197,.5); }
    .drop-title { font-size:14px; font-weight:500; color:var(--tx-1); }
    .drop-sub { font-size:11px; color:var(--tx-3); }
    .drop-sup { font-size:10px; color:var(--tx-4); margin-top:4px; }
    .parsed-preview { flex:1; background:var(--bg-input); border:1px solid var(--border); border-radius:4px; padding:8px; overflow-y:auto; max-height:320px; display:flex; flex-direction:column; }
    .parsed-empty { margin:auto; font-family:var(--f-mono); font-size:11px; color:var(--tx-4); text-align:center; }
    .parsed-summary { font-family:var(--f-mono); font-size:11px; color:var(--green); margin-top:4px; }
    .parsed-err { font-family:var(--f-mono); font-size:11px; color:var(--amber); margin-top:2px; }

    /* NAV & SIDEBAR BADGES */
    .badge-new-nav { background:rgba(79,209,197,.2); color:var(--teal); font-family:var(--f-mono); font-size:9px; font-weight:600; padding:1px 4px; border-radius:2px; margin-left:6px; vertical-align:middle; }
    .inc-new-badge { background:var(--teal); color:#000; font-family:var(--f-mono); font-size:9px; font-weight:600; padding:1px 5px; border-radius:2px; margin-left:6px; display:inline-block; }
    .inc-linked-badge { background:var(--blue); color:#000; font-family:var(--f-mono); font-size:9px; font-weight:600; padding:1px 5px; border-radius:2px; margin-left:6px; display:inline-block; }

    /* METADATA ROW */
    .analyzer-meta { background:var(--bg-surface); border-bottom:1px solid var(--border); padding:4px 20px; font-family:var(--f-mono); font-size:10px; color:var(--tx-4); display:flex; gap:16px; align-items:center; }

    /* DEP GRAPH */
    .rp-tabs { display:flex; gap:8px; margin-bottom:14px; }
    .rp-tab { font-family:var(--f-mono); font-size:10px; font-weight:600; color:var(--tx-3); padding:4px 10px; border:1px solid var(--border); border-radius:12px; background:transparent; cursor:pointer; transition:all var(--t-fast); }
    .rp-tab.active { color:var(--tx-1); border-color:var(--tx-3); background:rgba(255,255,255,.05); }

    /* GRAPH SVG */
    .dg-node-rect { fill:#161C27; stroke:rgba(255,255,255,0.1); stroke-width:1; rx:4; transition:all var(--t-fast); }
    .dg-node-text { font-family:var(--f-mono); font-size:10px; fill:var(--tx-1); text-anchor:start; dominant-baseline:middle; }
    .dg-node-dot { r:3; }
    .dg-edge { stroke:rgba(255,255,255,0.1); stroke-width:1; fill:none; }
    .dg-edge-affected { stroke:var(--amber); stroke-dasharray:4 3; }
    .dg-node.healthy .dg-node-dot { fill:var(--tx-4); }
    .dg-node.affected .dg-node-rect { stroke:var(--amber); }
    .dg-node.affected .dg-node-text { fill:var(--amber); }
    .dg-node.affected .dg-node-dot { fill:var(--amber); }
    .dg-node.critical .dg-node-rect { stroke:var(--red); filter:drop-shadow(0 0 8px rgba(255,59,48,0.4)); }
    .dg-node.critical .dg-node-text { fill:var(--red); }
    .dg-node.critical .dg-node-dot { fill:var(--red); }
    .dg-legend { display:flex; justify-content:center; gap:16px; font-family:var(--f-mono); font-size:10px; color:var(--tx-3); margin-top:16px; align-items:center; }
    .dg-legend span { display:flex; align-items:center; gap:4px; }
    .dg-summary { text-align:center; font-family:var(--f-mono); font-size:12px; margin-top:8px; }

    /* RUNBOOKS PANEL */
    .rb-panel { flex:1; display:flex; background:var(--bg-base); overflow:hidden; }
    .rb-left { width:280px; border-right:1px solid var(--border); display:flex; flex-direction:column; background:var(--bg-surface); flex-shrink:0; }
    .rb-hdr { height:48px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; padding:0 16px; flex-shrink:0; }
    .rb-hdr-title { font-family:var(--f-mono); font-size:10px; font-weight:600; color:var(--tx-3); text-transform:uppercase; letter-spacing:0.1em; }
    .rb-search { width:100%; height:32px; background:var(--bg-input); border:1px solid rgba(79,209,197,0.3); border-radius:3px; color:var(--tx-1); font-family:var(--f-mono); font-size:11px; padding:0 10px; outline:none; }
    .rb-search:focus { border-color:var(--teal); }
    .rb-list { flex:1; overflow-y:auto; padding:12px; display:flex; flex-direction:column; gap:8px; }
    .rb-card { background:var(--bg-card); border:1px solid var(--border); border-radius:4px; padding:10px 12px; cursor:pointer; transition:all var(--t-fast); display:flex; flex-direction:column; gap:6px; border-left-width:2px; }
    .rb-card:hover { border-color:rgba(255,255,255,0.2); }
    .rb-card.active { background:rgba(79,209,197,0.05); border-color:var(--teal); }
    .rb-cat-cyan { border-left-color:var(--teal); } .rb-cat-cyan .rb-cat-badge { color:var(--teal); }
    .rb-cat-amber { border-left-color:var(--amber); } .rb-cat-amber .rb-cat-badge { color:var(--amber); }
    .rb-cat-green { border-left-color:var(--green); } .rb-cat-green .rb-cat-badge { color:var(--green); }
    .rb-cat-red { border-left-color:var(--red); } .rb-cat-red .rb-cat-badge { color:var(--red); }
    .rb-cat-badge { font-family:var(--f-mono); font-size:9px; font-weight:600; text-transform:uppercase; }
    .rb-card-title { font-family:var(--f-head); font-size:12px; font-weight:500; color:var(--tx-1); }
    .rb-card-meta { font-family:var(--f-mono); font-size:10px; color:var(--tx-4); display:flex; justify-content:space-between; }
    .rb-tags { display:flex; gap:4px; flex-wrap:wrap; }
    .rb-tag { background:var(--bg-input); border:1px solid var(--border); color:var(--tx-3); font-size:9px; padding:2px 6px; border-radius:3px; }
    .rb-card.active .rb-cat-badge { text-shadow:0 0 8px currentColor; }
    
    .rb-new-form { background:var(--bg-input); border:1px solid var(--teal); border-radius:4px; padding:10px; margin-bottom:8px; display:flex; flex-direction:column; gap:8px; }
    .rb-new-input { background:var(--bg-base); border:1px solid var(--border); color:var(--tx-1); font-family:var(--f-mono); font-size:11px; padding:6px; border-radius:3px; outline:none; }
    .rb-new-area { background:var(--bg-base); border:1px solid var(--border); color:var(--tx-1); font-family:var(--f-mono); font-size:11px; padding:6px; border-radius:3px; outline:none; resize:none; height:80px; }
    .rb-new-btn-row { display:flex; gap:6px; justify-content:flex-end; }
    
    .rb-right { flex:1; display:flex; flex-direction:column; background:var(--bg-base); overflow-y:auto; padding:24px 32px; }
    .rb-view-hdr { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
    .rb-view-title { font-family:var(--f-head); font-size:18px; font-weight:500; color:var(--tx-1); }
    .rb-view-meta { font-family:var(--f-mono); font-size:10px; color:var(--tx-3); margin-bottom:24px; }
    .rb-step { display:flex; gap:16px; margin-bottom:24px; }
    .rb-step-num { width:24px; height:24px; background:var(--teal); color:#000; font-family:var(--f-mono); font-size:11px; font-weight:700; display:flex; align-items:center; justify-content:center; border-radius:3px; flex-shrink:0; }
    .rb-step-content { flex:1; display:flex; flex-direction:column; gap:6px; }
    .rb-step-title { font-family:var(--f-head); font-size:13px; font-weight:500; color:var(--tx-1); }
    .rb-step-desc { font-size:11px; color:var(--tx-3); }
    .rb-cmd-wrap { position:relative; margin-top:4px; }
    .rb-cmd { background:#060809; border:1px solid var(--border); padding:10px 12px; border-radius:3px; font-family:var(--f-mono); font-size:11px; color:var(--teal); white-space:pre-wrap; word-break:break-all; padding-right:48px; }
    .rb-cmd-prefix { color:var(--tx-4); margin-right:6px; }
    .rb-cmd-copy { position:absolute; top:6px; right:6px; background:var(--bg-surface); border:1px solid var(--border); color:var(--tx-3); font-family:var(--f-mono); font-size:9px; padding:4px 8px; border-radius:2px; cursor:pointer; }
    .rb-cmd-copy:hover { color:var(--tx-1); }
    .rb-cmd-copy.done { background:var(--green); color:#000; border-color:var(--green); }
    
    .rb-link-pop { position:absolute; top:calc(100% + 4px); right:0; background:var(--bg-card); border:1px solid var(--teal); border-radius:4px; padding:12px; box-shadow:0 8px 24px rgba(0,0,0,0.6); z-index:100; width:260px; display:flex; flex-direction:column; gap:10px; }
    .rb-link-select { background:var(--bg-input); border:1px solid var(--border); color:var(--tx-1); font-family:var(--f-mono); font-size:11px; padding:6px; border-radius:3px; outline:none; }

    /* HISTORY PANEL */
    .hist-panel { flex:1; display:flex; flex-direction:column; background:var(--bg-base); overflow:hidden; }
    .hist-hdr { height:48px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; padding:0 24px; flex-shrink:0; background:var(--bg-surface); }
    .hist-hdr-title { font-family:var(--f-mono); font-size:12px; font-weight:600; color:var(--tx-1); letter-spacing:0.1em; }
    .hist-stats { display:flex; gap:24px; padding:16px 24px; border-bottom:1px solid var(--border); background:var(--bg-base); flex-shrink:0; }
    .hist-table-wrap { flex:1; overflow-y:auto; padding:0; }
    .hist-table { width:100%; border-collapse:collapse; }
    .hist-th { position:sticky; top:0; background:var(--bg-surface); font-family:var(--f-mono); font-size:10px; font-weight:600; color:var(--tx-3); text-align:left; padding:12px 16px; border-bottom:1px solid var(--border); text-transform:uppercase; z-index:10; }
    .hist-tr { border-bottom:1px solid rgba(255,255,255,0.02); transition:background var(--t-fast); }
    .hist-tr:nth-child(even) { background:rgba(255,255,255,0.015); }
    .hist-tr:hover { background:rgba(255,255,255,0.04); }
    .hist-td { padding:12px 16px; font-size:12px; color:var(--tx-1); }
    .hist-td-mono { font-family:var(--f-mono); font-size:11px; color:var(--tx-2); }
    
    .status-RESOLVED { color:var(--green); font-weight:500; }
    .status-OPEN { color:var(--amber); font-weight:500; animation:pulse 2s infinite; }
    
    .mttr-green { color:var(--green); } .mttr-amber { color:var(--amber); } .mttr-red { color:var(--red); }
    
    .comp-view { display:flex; height:100%; }
    .comp-col { flex:1; border-right:1px solid var(--border); display:flex; flex-direction:column; padding:24px; gap:16px; overflow-y:auto; }
    .comp-hdr { font-family:var(--f-head); font-size:16px; font-weight:500; color:var(--tx-1); margin-bottom:8px; display:flex; align-items:center; gap:8px; }
    .comp-row { display:flex; flex-direction:column; gap:4px; padding-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.05); }
    .comp-lbl { font-family:var(--f-mono); font-size:10px; color:var(--tx-4); text-transform:uppercase; }
    .comp-val { font-family:var(--f-mono); font-size:12px; color:var(--tx-2); }
    .val-better { color:var(--green); font-weight:600; }
    .val-worse { color:var(--amber); }

    /* KB SHORTCUTS */
    .kb-hint { position:fixed; bottom:20px; left:20px; background:rgba(0,0,0,0.6); border:1px solid var(--border); padding:6px 12px; border-radius:20px; font-family:var(--f-mono); font-size:9px; color:var(--tx-4); pointer-events:none; z-index:9000; transition:opacity 0.5s; opacity:0; }
    .kb-hint.show { opacity:1; }

    @keyframes shimmerFill{0%{background-position:-200% 0;} 100%{background-position:200% 0;}}
    @keyframes shimmerBorder{0%{border-color:rgba(246,173,85,.25);} 50%{border-color:rgba(246,173,85,.6);} 100%{border-color:rgba(246,173,85,.25);}}
    @keyframes breathe{0%{transform:scale(1);opacity:0.8;} 50%{transform:scale(1.3);opacity:1;} 100%{transform:scale(1);opacity:0.8;}}
    @keyframes pulse{0%{opacity:1;} 50%{opacity:0.5;} 100%{opacity:1;}}
    @keyframes slideIn{from{transform:translateY(20px);opacity:0;} to{transform:translateY(0);opacity:1;}}
  </style>
</head>
<body>
  <div id="root"></div>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script type="text/babel">
    const { useState, useEffect, useRef, useCallback, useMemo } = React;

    const SYSTEM_PROMPT = \`You are an expert SRE AI. Analyze the provided logs and incident metadata to identify the root cause and recommend fixes.
Output MUST be valid JSON matching this exact schema:

{
  "confidence": <number 0-100>,
  "causes": [
    { "rank": 1, "confidence": <number>, "title": "<max 6 words>", "description": "<max 20 words>", "evidence": "<specific log line>" },
    { "rank": 2, "confidence": <number>, "title": "<max 6 words>", "description": "<max 20 words>", "evidence": "<specific log line>" },
    { "rank": 3, "confidence": <number>, "title": "<max 6 words>", "description": "<max 20 words>", "evidence": "<specific log line>" }
  ],
  "fixes": [
    { "step": 1, "action": "<imperative, max 6 words>", "command": "<exact kubectl/bash/SQL>", "rationale": "<one sentence>" },
    { "step": 2, "action": "<action>", "command": "<command>", "rationale": "<rationale>" },
    { "step": 3, "action": "<action>", "command": "<command>", "rationale": "<rationale>" }
  ],
  "impact": {
    "affected_services": <number>,
    "error_rate_peak": "<e.g. 94%>",
    "time_to_detect": "<e.g. 47s>",
    "estimated_mttr_reduction": "<e.g. -68%>"
  },
  "summary": "<2-3 sentence plain English explanation>"
}

Rules: Respond ONLY with the JSON object. No text before or after. Base analysis strictly on provided log data. Rank causes by likelihood. Commands must be real executable kubectl/bash/SQL. Always provide exactly 3 causes and 3 fixes.\`;

    /* ── DATA CONSTANTS ─────────────────────────────────────────────── */
    const HISTORY_DATA = [
      { id:101, title:"Payment Gateway Timeout Cascade", sev:"CRITICAL", svc:"auth-service", detected:"Jan 15 14:32", resolved:"Jan 15 14:49", mttr:17, conf:94, status:"RESOLVED", topCause:"Auth Service JWT Timeout", topFix:"Rollback auth-service deployment", errPeak:"94%" },
      { id:102, title:"Database Connection Pool Exhausted", sev:"HIGH", svc:"postgres-primary", detected:"Jan 14 09:15", resolved:"Jan 14 09:44", mttr:29, conf:88, status:"RESOLVED", topCause:"Slow Analytics Query", topFix:"Terminate idle queries", errPeak:"62%" },
      { id:103, title:"Cart Service Memory Leak", sev:"HIGH", svc:"cart-api-v2", detected:"Jan 13 22:07", resolved:"Jan 13 23:01", mttr:54, conf:76, status:"RESOLVED", topCause:"OOM Killed Process", topFix:"Increase pod memory limits", errPeak:"15%" },
      { id:104, title:"Notification Queue Backlog", sev:"MEDIUM", svc:"rabbitmq-cluster", detected:"Jan 12 16:33", resolved:"Jan 12 17:02", mttr:29, conf:82, status:"RESOLVED", topCause:"Consumer Crash", topFix:"Restart notification-svc", errPeak:"0%" },
      { id:105, title:"API Gateway 502 Storm", sev:"CRITICAL", svc:"api-gateway", detected:"Jan 10 03:11", resolved:"Jan 10 03:28", mttr:17, conf:91, status:"RESOLVED", topCause:"Upstream DNS Failure", topFix:"Flush CoreDNS cache", errPeak:"100%" },
      { id:106, title:"Auth Service Cert Expiry", sev:"HIGH", svc:"auth-service", detected:"Jan 08 11:55", resolved:"Jan 08 12:18", mttr:23, conf:95, status:"RESOLVED", topCause:"Expired TLS Certificate", topFix:"Renew Vault PKI certs", errPeak:"45%" },
      { id:107, title:"Grafana Metrics Gap", sev:"LOW", svc:"monitoring-stack", detected:"Jan 06 08:40", resolved:"—", mttr:0, conf:61, status:"OPEN", topCause:"Prometheus Scrape Timeout", topFix:"Scale prometheus replicas", errPeak:"0%" }
    ];

    const HARDCODED_RUNBOOKS = [
      { id:1, cat:"KUBERNETES", title:"Rollback Deployment", lastUsed:"Used 2h ago", tags:["kubectl","rollout"], steps:[
        { action:"Identify current revision", desc:"Check which version is currently running before rolling back", cmd:"kubectl rollout history deployment/[SERVICE_NAME] -n production" },
        { action:"Initiate rollback", desc:"Roll back to the previous stable revision", cmd:"kubectl rollout undo deployment/[SERVICE_NAME] -n production" },
        { action:"Monitor rollout status", desc:"Wait for rollout to complete and verify all pods are healthy", cmd:"kubectl rollout status deployment/[SERVICE_NAME] -n production --timeout=120s" },
        { action:"Verify pod health", desc:"Confirm new pods are running and old ones terminated", cmd:"kubectl get pods -n production -l app=[SERVICE_NAME] -w" },
        { action:"Check error rate", desc:"Monitor application logs to confirm issue resolved", cmd:"kubectl logs -n production -l app=[SERVICE_NAME] --tail=50 -f" }
      ]},
      { id:2, cat:"KUBERNETES", title:"Restart Crashed Pod", lastUsed:"Used 5h ago", tags:["kubectl","pod","crashloop"], steps:[
        { action:"Find crashing pod", desc:"Identify the pod that is in CrashLoopBackOff", cmd:"kubectl get pods -n production | grep [SERVICE_NAME]" },
        { action:"Fetch crash logs", desc:"Review previous container logs to identify crash reason", cmd:"kubectl logs [POD_NAME] -n production --previous" },
        { action:"Delete pod", desc:"Force a restart by deleting the pod", cmd:"kubectl delete pod [POD_NAME] -n production" },
        { action:"Watch recovery", desc:"Ensure the replacement pod enters Running state", cmd:"kubectl get pods -n production -l app=[SERVICE_NAME] -w" }
      ]},
      { id:3, cat:"DATABASE", title:"Terminate Idle Connections", lastUsed:"Used 1d ago", tags:["postgres","psql","connections"], steps:[
        { action:"Check connections", desc:"View total active vs idle connections", cmd:"kubectl exec postgres-primary-0 -n production -- psql -c \\\"SELECT state, count(*) FROM pg_stat_activity GROUP BY state;\\\"" },
        { action:"Find stale queries", desc:"Identify connections idle for more than 5 minutes", cmd:"kubectl exec postgres-primary-0 -n production -- psql -c \\\"SELECT pid, query, state_change FROM pg_stat_activity WHERE state='idle' AND state_change < current_timestamp - interval '5 minutes';\\\"" },
        { action:"Terminate idle", desc:"Kill all idle connections aggressively", cmd:"kubectl exec postgres-primary-0 -n production -- psql -c \\\"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state='idle';\\\"" }
      ]},
      { id:4, cat:"DATABASE", title:"Analyze Slow Queries", lastUsed:"Used 3d ago", tags:["postgres","pg_stat","performance"], steps:[
        { action:"Check pg_stat_statements", desc:"Find top 5 slowest queries by mean execution time", cmd:"kubectl exec postgres-primary-0 -n production -- psql -c \\\"SELECT query, calls, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 5;\\\"" },
        { action:"Check active locks", desc:"Identify any blocking transactions", cmd:"kubectl exec postgres-primary-0 -n production -- psql -c \\\"SELECT * FROM pg_locks pl LEFT JOIN pg_stat_activity psa ON pl.pid = psa.pid WHERE NOT pl.granted;\\\"" },
        { action:"Kill blocking query", desc:"Terminate the specific blocking process", cmd:"kubectl exec postgres-primary-0 -n production -- psql -c \\\"SELECT pg_cancel_backend([PID]);\\\"" }
      ]},
      { id:5, cat:"NETWORK", title:"Flush DNS Cache", lastUsed:"Used 5d ago", tags:["dns","coredns","kubernetes"], steps:[
        { action:"Check CoreDNS status", desc:"Ensure DNS pods are healthy", cmd:"kubectl get pods -n kube-system -l k8s-app=kube-dns" },
        { action:"Restart CoreDNS", desc:"Rolling restart of DNS pods to flush cache", cmd:"kubectl rollout restart deployment coredns -n kube-system" },
        { action:"Test resolution", desc:"Spin up a temp pod to test DNS resolution", cmd:"kubectl run -it --rm --restart=Never dns-test --image=busybox:1.28 -- nslookup api-gateway.production.svc.cluster.local" }
      ]},
      { id:6, cat:"SECURITY", title:"Rotate Compromised Secret", lastUsed:"Used 1w ago", tags:["kubectl","secrets","vault"], steps:[
        { action:"Backup old secret", desc:"Save the current secret state before rotating", cmd:"kubectl get secret [SECRET_NAME] -n production -o yaml > secret-backup.yaml" },
        { action:"Update secret", desc:"Apply the new credentials", cmd:"kubectl create secret generic [SECRET_NAME] -n production --from-literal=password='[NEW_PASS]' --dry-run=client -o yaml | kubectl apply -f -" },
        { action:"Restart dependent pods", desc:"Force dependents to pick up the new secret", cmd:"kubectl rollout restart deployment/[SERVICE_NAME] -n production" }
      ]}
    ];

    const DEMO_RCA_JSON = JSON.stringify({
      "confidence": 94,
      "causes": [
        { "rank": 1, "confidence": 87, "title": "Auth Service JWT Timeout", "description": "v2.4.1 canary deploy at 14:17 introduced regression in token validation path", "evidence": "14:32:07.441 ERROR auth-service JWT validation timeout after 5000ms" },
        { "rank": 2, "confidence": 73, "title": "DB Connection Pool Exhaustion", "description": "Unoptimized query from cart-api-v2 held connections for 14s, starving auth-service", "evidence": "14:31:59.220 ERROR postgres-primary Max connections reached (100/100)" },
        { "rank": 3, "confidence": 41, "title": "Cascading Thread Saturation", "description": "Payment gateway thread pool consumed by retry storms from auth failures", "evidence": "14:32:06.112 WARN payment-gateway Thread pool utilization at 94%" }
      ],
      "fixes": [
        { "step": 1, "action": "Rollback auth-service deployment", "command": "kubectl rollout undo deployment/auth-service -n production", "rationale": "Removes the v2.4.1 regression introduced at 14:17 immediately" },
        { "step": 2, "action": "Flush DB connection pool", "command": "kubectl exec postgres-primary-0 -- psql -c \\\"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state='idle';\\\"", "rationale": "Frees starved connections blocking auth-service database queries" },
        { "step": 3, "action": "Increase JWT cache TTL", "command": "kubectl set env deployment/auth-service JWT_CACHE_TTL=3600 -n production", "rationale": "Reduces auth-service database round-trips on token validation" }
      ],
      "impact": { "affected_services": 3, "error_rate_peak": "94%", "time_to_detect": "47s", "estimated_mttr_reduction": "-68%" },
      "summary": "A canary deployment of auth-service v2.4.1 at 14:17 introduced a JWT validation regression that caused cascading failures across payment-gateway and postgres-primary. Rolling back the deployment and flushing idle DB connections will restore service within 2 minutes."
    });

    /* ── LOG PARSER ─────────────────────────────────────────────────── */
    function parseLogs(rawText) {
      const lines = rawText.split('\\n');
      const logs = [];
      let parseErrors = 0;
      
      const isoRegex = /^(\\d{4}-\\d{2}-\\d{2}T[\\d:.Z+-]+)\\s+(ERROR|WARN|WARNING|INFO|DEBUG|CRITICAL|FATAL)\\s+(\\S+)\\s+(.+)$/i;
      const shortRegex = /^(\\d{2}:\\d{2}:\\d{2}\\.\\d+)\\s+(ERROR|WARN|WARNING|INFO|DEBUG|CRITICAL|FATAL)\\s+(\\S+)\\s+(.+)$/i;
      
      for (let line of lines) {
        line = line.trim();
        if (!line) continue;
        
        let ts, lvl, svc, msg;
        
        if (line.startsWith('{') && line.endsWith('}')) {
          try {
            const obj = JSON.parse(line);
            ts = obj.timestamp || obj.time || obj.ts;
            lvl = obj.level || obj.lvl || obj.severity;
            svc = obj.service || obj.svc || obj.source;
            msg = obj.message || obj.msg || obj.text;
          } catch(e) {}
        }
        
        if (!ts) {
          const isoMatch = line.match(isoRegex);
          if (isoMatch) { ts = isoMatch[1]; lvl = isoMatch[2]; svc = isoMatch[3]; msg = isoMatch[4]; }
        }
        
        if (!ts) {
          const shortMatch = line.match(shortRegex);
          if (shortMatch) { ts = shortMatch[1]; lvl = shortMatch[2]; svc = shortMatch[3]; msg = shortMatch[4]; }
        }
        
        if (!ts && line.includes('=')) {
          const kvMatch = (key) => {
            const r = new RegExp(\`(?:^|\\s)\${key}=("([^"]+)"|(\\S+))\`, 'i');
            const m = line.match(r);
            return m ? (m[2] || m[3]) : null;
          };
          ts = kvMatch('timestamp') || kvMatch('time') || kvMatch('ts');
          lvl = kvMatch('level') || kvMatch('lvl') || kvMatch('severity');
          svc = kvMatch('service') || kvMatch('svc') || kvMatch('source');
          msg = kvMatch('message') || kvMatch('msg') || kvMatch('text');
        }
        
        if (ts && lvl && svc && msg) {
          let nLvl = String(lvl).toUpperCase();
          if (nLvl === 'WARNING') nLvl = 'WARN';
          logs.push({ ts: String(ts), lvl: nLvl, svc: String(svc), msg: String(msg) });
        } else {
          parseErrors++;
        }
      }
      
      logs.sort((a,b) => a.ts.localeCompare(b.ts));
      const services = [...new Set(logs.map(l => l.svc))];
      
      return { logs, services, parseErrors };
    }

    function buildUserMessage(incident) {
      const services = [...new Set(incident.logs.map(l => l.svc))];
      return JSON.stringify({
        incident: { name: incident.title, severity: incident.sev, affected_service: incident.svc, detected_at: incident.ts },
        logs: incident.logs.map(l => ({ timestamp: l.ts, level: l.lvl, service: l.svc, message: l.msg })),
        services
      }, null, 2);
    }

    /* ── GEMINI API STREAMING ──────────────────────────────────────── */
    async function callGeminiStream({ incident, apiKey, onChunk, onComplete, onError, onTokens }) {
      try {
        const resp = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:streamGenerateContent?alt=sse&key=\${apiKey}\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [{ role: 'user', parts: [{ text: buildUserMessage(incident) }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 8192, responseMimeType: "application/json" }
          })
        });

        if (!resp.ok) {
          const s = resp.status;
          if (s === 400) throw new Error('Bad request — check log format sent to API');
          if (s === 401 || s === 403) throw new Error('Invalid Gemini API key — verify in Google AI Studio');
          if (s === 429) throw new Error('Gemini rate limit hit — free tier allows 15 RPM. Wait and retry.');
          if (s >= 500) throw new Error('Gemini API error — retry in a moment');
          throw new Error(\`API error: HTTP \${s}\`);
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '', fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\\n');
          buffer = lines.pop();
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.usageMetadata) {
                onTokens({
                  input: parsed.usageMetadata.promptTokenCount || 0,
                  output: parsed.usageMetadata.candidatesTokenCount || 0
                });
              }
              if (parsed.candidates && parsed.candidates[0]?.content?.parts?.[0]?.text) {
                fullText += parsed.candidates[0].content.parts[0].text;
                onChunk(fullText);
              }
            } catch (_) {}
          }
        }
        
        let rcaData;
        try { 
          const firstBrace = fullText.indexOf('{');
          const lastBrace = fullText.lastIndexOf('}');
          if (firstBrace === -1 || lastBrace === -1) throw new Error('No JSON object found');
          const jsonStr = fullText.slice(firstBrace, lastBrace + 1);
          rcaData = JSON.parse(jsonStr); 
        } catch (err) {
          onError('Model returned malformed JSON — try re-analyzing'); return;
        }
        
        if (!rcaData.causes) rcaData.causes = [];
        if (!rcaData.fixes) rcaData.fixes = [];
        if (!rcaData.impact) rcaData.impact = { affected_services: '?', error_rate_peak: '?', time_to_detect: '?', estimated_mttr_reduction: '?' };
        if (!rcaData.confidence) rcaData.confidence = 0;
        if (!rcaData.summary) rcaData.summary = 'Analysis complete.';
        onComplete(rcaData);

      } catch (e) {
        onError(e.message?.includes('fetch') || e.name === 'TypeError'
          ? 'Network error — check connection'
          : (e.message || 'Unknown error occurred'));
      }
    }

    /* ── GRAPH DATA & COMPONENT ─────────────────────────────────────── */
    const SERVICE_GRAPH = {
      "api-gateway":       { dependsOn: [],                          tier: 0 },
      "auth-service":      { dependsOn: ["api-gateway"],             tier: 1 },
      "payment-gateway":   { dependsOn: ["auth-service"],            tier: 2 },
      "cart-api-v2":       { dependsOn: ["auth-service", "postgres-primary"], tier: 2 },
      "postgres-primary":  { dependsOn: [],                          tier: 0 },
      "rabbitmq-cluster":  { dependsOn: ["cart-api-v2"],             tier: 3 },
      "notification-svc":  { dependsOn: ["rabbitmq-cluster"],        tier: 4 },
    };

    function DependencyGraph({ incident }) {
      const statusMap = {};
      Object.keys(SERVICE_GRAPH).forEach(svc => statusMap[svc] = 'healthy');
      if (incident && incident.logs) {
        incident.logs.forEach(l => {
          if (!SERVICE_GRAPH[l.svc]) return;
          if (l.lvl === 'ERROR' || l.lvl === 'CRITICAL' || l.lvl === 'FATAL') statusMap[l.svc] = 'critical';
          else if (l.lvl === 'WARN' && statusMap[l.svc] !== 'critical') statusMap[l.svc] = 'affected';
        });
      }

      const tiers = [[], [], [], [], []];
      Object.keys(SERVICE_GRAPH).forEach(svc => tiers[SERVICE_GRAPH[svc].tier].push(svc));

      const NODE_W = 110, NODE_H = 32, X_SPACING = 140, Y_SPACING = 70;
      const START_Y = 30;

      const nodes = [];
      const positions = {};

      tiers.forEach((tierNodes, tIdx) => {
        const y = START_Y + tIdx * Y_SPACING;
        const totalW = tierNodes.length * X_SPACING;
        const startX = 160 - (totalW / 2) + (X_SPACING / 2);
        tierNodes.forEach((svc, nIdx) => {
          const x = startX + nIdx * X_SPACING;
          positions[svc] = { x, y };
          nodes.push({ id: svc, x, y, status: statusMap[svc] });
        });
      });

      const edges = [];
      Object.keys(SERVICE_GRAPH).forEach(svc => {
        SERVICE_GRAPH[svc].dependsOn.forEach(parent => {
          if (positions[parent] && positions[svc]) {
            const isAffected = (statusMap[svc] === 'critical' || statusMap[svc] === 'affected') && 
                               (statusMap[parent] === 'critical' || statusMap[parent] === 'affected');
            edges.push({
              id: \`\${parent}-\${svc}\`,
              x1: positions[parent].x, y1: positions[parent].y + NODE_H/2,
              x2: positions[svc].x, y2: positions[svc].y - NODE_H/2,
              isAffected
            });
          }
        });
      });

      let cCnt=0, aCnt=0, hCnt=0;
      Object.values(statusMap).forEach(s => { if(s==='critical') cCnt++; else if(s==='affected') aCnt++; else hCnt++; });

      return (
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', marginTop:20}}>
          <svg width="100%" height="380" viewBox="0 0 320 380">
            <g>
              {edges.map(e => (
                <path key={e.id} d={\`M \${e.x1} \${e.y1} C \${e.x1} \${e.y1 + 20}, \${e.x2} \${e.y2 - 20}, \${e.x2} \${e.y2}\`} 
                      className={\`dg-edge \${e.isAffected ? 'dg-edge-affected' : ''}\`} />
              ))}
            </g>
            <g>
              {nodes.map(n => (
                <g key={n.id} transform={\`translate(\${n.x}, \${n.y})\`} className={\`dg-node \${n.status}\`}>
                  <rect x={-NODE_W/2} y={-NODE_H/2} width={NODE_W} height={NODE_H} className="dg-node-rect" />
                  <circle cx={-NODE_W/2 + 10} cy={0} className="dg-node-dot" />
                  <text x={-NODE_W/2 + 18} y={1} className="dg-node-text">{n.id}</text>
                </g>
              ))}
            </g>
          </svg>
          <div className="dg-legend">
            <span style={{color:'var(--red)'}}>● CRITICAL</span>
            <span style={{color:'var(--amber)'}}>● AFFECTED</span>
            <span style={{color:'var(--tx-4)'}}>● HEALTHY</span>
          </div>
          <div className="dg-summary">
            <span style={{color:'var(--red)'}}>{cCnt} CRITICAL</span> <span style={{color:'var(--tx-4)'}}>|</span> <span style={{color:'var(--amber)'}}>{aCnt} AFFECTED</span> <span style={{color:'var(--tx-4)'}}>|</span> <span style={{color:'var(--tx-3)'}}>{hCnt} HEALTHY</span>
          </div>
        </div>
      );
    }

    const INITIAL_INCIDENTS = [
      {
        id:1, sev:"CRITICAL", ts:"14:32:07", title:"Payment Gateway Timeout Cascade",
        svc:"auth-service", status:"analyzing", prog:78, confidence:94, flashRed:false,
        tl:{ labels:["14:17","14:20","14:23","14:26","14:29","14:32"], lanes:[
          { name:"auth-service", ticks:[{pct:6.7,type:"high",t:"14:18",msg:"Latency spike: p95=1240ms"},{pct:100,type:"crit",t:"14:32",msg:"JWT validation timeout after 5000ms"}]},
          { name:"payment-gateway", ticks:[{pct:13.3,type:"high",t:"14:19",msg:"Elevated error rate: 12%"},{pct:73.3,type:"high",t:"14:28",msg:"Thread pool at 94%"},{pct:100,type:"crit",t:"14:32",msg:"Upstream auth call failed (retry 3/3)"}]},
          { name:"postgres-primary", ticks:[{pct:60,type:"crit",t:"14:26",msg:"Slow query: 14.2s"},{pct:86.7,type:"crit",t:"14:30",msg:"Max connections (100/100)"}]}
        ]},
        logs:[
          {ts:"14:32:07.441",lvl:"ERROR",svc:"auth-service",     msg:"JWT validation timeout after 5000ms — upstream unreachable"},
          {ts:"14:32:06.998",lvl:"ERROR",svc:"payment-gateway",  msg:"Upstream auth call failed: connection refused (retry 3/3)"},
          {ts:"14:32:06.112",lvl:"WARN", svc:"payment-gateway",  msg:"Thread pool utilization at 94% — approaching saturation"},
          {ts:"14:32:05.003",lvl:"ERROR",svc:"payment-gateway",  msg:"Upstream auth call failed: connection refused (retry 2/3)"},
          {ts:"14:32:03.774",lvl:"WARN", svc:"auth-service",     msg:"Response time degradation: p99=4821ms (threshold: 2000ms)"},
          {ts:"14:31:59.220",lvl:"ERROR",svc:"postgres-primary", msg:"Max connections reached (100/100) — new connections rejected"},
          {ts:"14:31:58.005",lvl:"WARN", svc:"postgres-primary", msg:"Connection pool at 98% capacity"},
          {ts:"14:31:44.612",lvl:"INFO", svc:"cart-api-v2",      msg:"Attempting DB connection (pool: 97/100)"},
          {ts:"14:30:11.889",lvl:"ERROR",svc:"postgres-primary", msg:"Slow query detected: 14.2s — SELECT * FROM orders WHERE..."},
          {ts:"14:28:44.001",lvl:"WARN", svc:"auth-service",     msg:"Elevated error rate: 12% (baseline: 0.4%)"},
          {ts:"14:18:33.776",lvl:"WARN", svc:"auth-service",     msg:"Latency spike detected: p95=1240ms"},
          {ts:"14:17:55.002",lvl:"INFO", svc:"deploy-bot",       msg:"Deployed auth-service v2.4.1 → production (canary: 20%)"}
        ],
        mockCauses: [
          {rank:"#1",conf:98,title:"PostgreSQL Database Connection Pool Exhaustion",desc:"Slow queries on postgres-primary exhausted the connection pool, causing new DB connection requests to be rejected.",evidence:"Max connections reached (100/100) — new connections rejected"},
          {rank:"#2",conf:90,title:"Regressive Auth Service Canary Deployment",desc:"Deployment of auth-service v2.4.1 triggered immediate latency spikes and subsequent connection leaks to the primary database.",evidence:"Deployed auth-service v2.4.1 → production (canary: 20%)"},
          {rank:"#3",conf:85,title:"Payment Gateway Thread Pool Saturation",desc:"Blocking downstream calls to failing auth-service saturated payment-gateway threads, resulting in connection refusals.",evidence:"Thread pool utilization at 94% — approaching saturation"}
        ],
        mockFixes: [
          {step:"01",action:"Rollback auth-service deployment to stable",cmd:"kubectl rollout undo deployment/auth-service"},
          {step:"02",action:"Terminate blocking slow database queries",cmd:"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'active' AND pid <> pg_backend_pid();"},
          {step:"03",action:"Temporarily scale up postgres connection pool",cmd:"ALTER SYSTEM SET max_connections = '200'; SELECT pg_reload_conf();"}
        ],
        metrics: [
          {label:"MTTR REDUCTION",val:"-68%",clr:"green"}, {label:"AFFECTED SERVICES",val:"3",clr:"amber"},
          {label:"ERROR RATE PEAK",val:"94%",clr:"red"}, {label:"TIME TO DETECT",val:"47s",clr:"blue"}
        ]
      },
      {id:2,sev:"HIGH",ts:"14:28:44",title:"Database Connection Pool Exhausted",svc:"postgres-primary",status:"pending",prog:45,confidence:88,tl:{labels:[],lanes:[]},logs:[],mockCauses:[],mockFixes:[],metrics:[]},
      {id:3,sev:"HIGH",ts:"14:15:22",title:"Cart Service Memory Leak",svc:"cart-api-v2",status:"resolved",prog:100,confidence:99,tl:{labels:[],lanes:[]},logs:[],mockCauses:[],mockFixes:[],metrics:[]},
      {id:4,sev:"MEDIUM",ts:"13:58:01",title:"Notification Queue Backlog",svc:"rabbitmq-cluster",status:"pending",prog:0,confidence:76,tl:{labels:[],lanes:[]},logs:[],mockCauses:[],mockFixes:[],metrics:[]}
    ];

    /* ── SETTINGS BAR ───────────────────────────────────────────────── */
    function SettingsBar({ apiKey, setApiKey, keyStatus, setKeyStatus }) {
      const [localKey, setLocalKey] = useState(apiKey);

      const handleConnect = () => {
        const k = localKey.trim();
        if (!k.startsWith('AIza')) {
          setKeyStatus('error');
          setTimeout(() => setKeyStatus('idle'), 2000);
          return;
        }
        setApiKey(k);
        setKeyStatus('connected');
        localStorage.setItem('incidentiq_gemini_key', k);
      };

      const statusLabel = keyStatus === 'connected' ? '✓ CONNECTED' : keyStatus === 'error' ? 'INVALID KEY FORMAT' : 'CONNECT';

      return (
        <div className="settings-bar">
          <div className="sb-label" title="Gemini API Key">🔑 GEMINI API KEY</div>
          <input
            type="password"
            className="sb-key-input"
            placeholder="AIzaSy••••••••••••••••••••••••••••"
            value={localKey}
            onChange={e => { setLocalKey(e.target.value); if (keyStatus !== 'idle') setKeyStatus('idle'); }}
            onKeyDown={e => e.key === 'Enter' && handleConnect()}
          />
          <button className={\`sb-connect \${keyStatus}\`} onClick={handleConnect}>{statusLabel}</button>
          {keyStatus === 'connected' && (
            <span className="sb-status">Key saved to localStorage</span>
          )}
        </div>
      );
    }

    /* ── INGEST LOGS PANEL ──────────────────────────────────────────── */
    function LogIngestionPanel({ onAnalyze }) {
      const [mode, setMode] = useState('PASTE');
      const [rawLogs, setRawLogs] = useState('');
      const [meta, setMeta] = useState({ name: '', sev: 'HIGH', svc: '' });
      const [parsedData, setParsedData] = useState(null);
      const [isHover, setIsHover] = useState(false);

      const handleParse = (text) => {
        const t = text || rawLogs;
        if (!t.trim()) return;
        const res = parseLogs(t);
        setParsedData(res);
        if (!meta.svc && res.services.length > 0) setMeta(p => ({...p, svc: res.services[0]}));
      };

      const handleFile = (e) => {
        const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const text = ev.target.result;
          setRawLogs(text);
          if (!meta.name) setMeta(p => ({...p, name: file.name.replace(/\\.[^/.]+$/, "")}));
          handleParse(text);
        };
        reader.readAsText(file);
      };

      const handleAnalyze = () => {
        if (!parsedData || parsedData.logs.length === 0) return;
        const incident = {
          id: Date.now(),
          sev: meta.sev,
          ts: parsedData.logs.length > 0 ? parsedData.logs[parsedData.logs.length-1].ts : new Date().toISOString(),
          title: meta.name || 'Custom Log Ingestion',
          svc: meta.svc || (parsedData.services[0] || 'unknown'),
          status: 'analyzing',
          prog: 0,
          confidence: 0,
          isNew: true,
          tl: { labels:[], lanes:[] },
          logs: parsedData.logs,
          mockCauses: [], mockFixes: [], metrics: []
        };
        onAnalyze(incident);
      };

      return (
        <div className="ingest-panel">
          <div className="ingest-header">
            <div className="ingest-tabs">
              <button className={\`ingest-tab \${mode==='PASTE'?'active':''}\`} onClick={()=>setMode('PASTE')}>PASTE LOGS</button>
              <button className={\`ingest-tab \${mode==='UPLOAD'?'active':''}\`} onClick={()=>setMode('UPLOAD')}>UPLOAD FILE</button>
            </div>
          </div>

          <div className="ingest-cols">
            <div className="ingest-col-left">
              <div className="ingest-hdr-text">RAW LOG INPUT</div>
              <div className="ingest-meta-row">
                <input className="meta-input" placeholder="e.g. Payment Gateway Timeout" value={meta.name} onChange={e=>setMeta({...meta, name:e.target.value})} />
                <select className="meta-select" value={meta.sev} onChange={e=>setMeta({...meta, sev:e.target.value})}>
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
                <input className="meta-input" placeholder="e.g. auth-service" value={meta.svc} onChange={e=>setMeta({...meta, svc:e.target.value})} />
              </div>

              {mode === 'PASTE' ? (
                <>
                  <textarea 
                    className="log-textarea" 
                    value={rawLogs} 
                    onChange={e=>setRawLogs(e.target.value)}
                    placeholder={"Paste your raw logs here. Supported formats:\\n\\n[ISO timestamp] [LEVEL] [service] message\\ntimestamp=... level=... service=... msg=...\\nJSON log objects: {\\"timestamp\\":\\"...\\",\\"level\\":\\"...\\",\\"service\\":\\"...\\",\\"message\\":\\"...\\"}\\n\\nExample:\\n2024-01-15T14:32:07.441Z ERROR auth-service JWT validation timeout after 5000ms\\n2024-01-15T14:32:06.998Z ERROR payment-gateway Upstream auth call failed"}
                  />
                  <div className="char-count">{rawLogs.length} / 50,000 chars</div>
                  <div className="btn-ingest-action">
                    <button className="btn-cyan" onClick={()=>handleParse()}>PARSE & PREVIEW →</button>
                    <button className="btn-muted" onClick={()=>{setRawLogs(''); setParsedData(null);}}>CLEAR</button>
                  </div>
                </>
              ) : (
                <label 
                  className={\`drop-zone \${isHover?'drag-over':''}\`}
                  onDragOver={(e)=>{e.preventDefault(); setIsHover(true);}}
                  onDragLeave={()=>setIsHover(false)}
                  onDrop={(e)=>{e.preventDefault(); setIsHover(false); handleFile(e);}}
                >
                  <input type="file" style={{display:'none'}} onChange={handleFile} accept=".log,.txt,.json,.ndjson" />
                  <div className="drop-icon">↑</div>
                  <div className="drop-title">DROP LOG FILE HERE</div>
                  <div className="drop-sub">or click to browse</div>
                  <div className="drop-sup">.log .txt .json .ndjson — max 5MB</div>
                </label>
              )}
            </div>

            <div className="ingest-col-right">
              <div className="ingest-hdr-text">PARSED LOG PREVIEW</div>
              <div className="parsed-preview">
                {!parsedData ? (
                  <div className="parsed-empty">Parsed logs will appear here</div>
                ) : (
                  <>
                    {parsedData.logs.slice(0,50).map((l,i) => (
                      <div key={i} className="log-line">
                        <span className="log-ts">{l.ts}</span>
                        <span className="log-lvl-w"><span className={\`log-lvl \${l.lvl}\`}>{l.lvl}</span></span>
                        <span className="log-svc">{l.svc}</span>
                        <span className="log-msg">{l.msg}</span>
                      </div>
                    ))}
                    {parsedData.logs.length > 50 && (
                      <div className="parsed-empty" style={{padding:'8px 0'}}>... and {parsedData.logs.length - 50} more lines</div>
                    )}
                  </>
                )}
              </div>
              {parsedData && (
                <div>
                  <div className="parsed-summary" style={{color: parsedData.parseErrors > 0 && parsedData.logs.length === 0 ? 'var(--red)' : 'var(--green)'}}>
                    ✓ {parsedData.logs.length} logs parsed | {parsedData.services.length} services detected: {parsedData.services.join(', ')}
                  </div>
                  {parsedData.parseErrors > 0 && (
                    <div className="parsed-err">⚠ {parsedData.parseErrors} lines skipped (unrecognized format)</div>
                  )}
                </div>
              )}
              <button className="btn-cyan" style={{width:'100%', marginTop:'auto'}} disabled={!parsedData || parsedData.logs.length === 0} onClick={handleAnalyze}>ANALYZE THIS INCIDENT →</button>
            </div>
          </div>
        </div>
      );
    }

    /* ── RUNBOOKS PANEL ─────────────────────────────────────────────── */
    function RunbooksPanel({ runbooks, setRunbooks, activeRunbookId, setActiveRunbookId, activeIncidents, onLinkIncident, fireToast }) {
      const [filter, setFilter] = useState('');
      const [showNew, setShowNew] = useState(false);
      const [newRb, setNewRb] = useState({ title:'', cat:'KUBERNETES', text:'' });
      const [showLinkMenu, setShowLinkMenu] = useState(false);
      const [linkSelected, setLinkSelected] = useState('');
      const [copiedCmd, setCopiedCmd] = useState(null);

      const activeRb = runbooks.find(r => r.id === activeRunbookId) || runbooks[0];

      const handleSaveNew = () => {
        if (!newRb.title || !newRb.text) return;
        const steps = newRb.text.split('\\n').filter(s=>s.trim()).map((s,i) => ({
          action: \`Step \${i+1}\`, desc: "Custom step", cmd: s.trim()
        }));
        const created = {
          id: Date.now(),
          cat: newRb.cat,
          title: newRb.title,
          lastUsed: 'Just now',
          tags: ['custom'],
          steps
        };
        const updated = [created, ...runbooks];
        setRunbooks(updated);
        setActiveRunbookId(created.id);
        setShowNew(false);
        setNewRb({ title:'', cat:'KUBERNETES', text:'' });
        localStorage.setItem('incidentiq_runbooks', JSON.stringify(updated));
      };

      const handleCopyAll = () => {
        if (!activeRb) return;
        const allCmds = activeRb.steps.map(s => s.cmd).join('\\n');
        navigator.clipboard.writeText(allCmds).catch(()=>{});
        fireToast('✓ All commands copied');
      };

      const handleCopySingle = (cmd, id) => {
        navigator.clipboard.writeText(cmd).catch(()=>{});
        setCopiedCmd(id);
        setTimeout(() => setCopiedCmd(null), 2000);
      };

      const handleLink = () => {
        if (!linkSelected) return;
        const inc = activeIncidents.find(i => String(i.id) === linkSelected);
        if (inc) {
          onLinkIncident(inc.id, activeRb.id);
          fireToast(\`Runbook linked to \${inc.title}\`);
        }
        setShowLinkMenu(false);
      };

      return (
        <div className="rb-panel">
          <div className="rb-left">
            <div className="rb-hdr">
              <span className="rb-hdr-title">RUNBOOKS</span>
              <button className="btn-outline" onClick={()=>setShowNew(!showNew)}>[+ NEW]</button>
            </div>
            <div style={{padding:'12px 12px 0'}}><input className="rb-search" placeholder="search runbooks..." value={filter} onChange={e=>setFilter(e.target.value)} /></div>
            <div className="rb-list">
              {showNew && (
                <div className="rb-new-form">
                  <input className="rb-new-input" placeholder="Runbook Title" value={newRb.title} onChange={e=>setNewRb({...newRb,title:e.target.value})}/>
                  <select className="rb-new-input" value={newRb.cat} onChange={e=>setNewRb({...newRb,cat:e.target.value})}>
                    <option value="KUBERNETES">KUBERNETES</option>
                    <option value="DATABASE">DATABASE</option>
                    <option value="NETWORK">NETWORK</option>
                    <option value="SECURITY">SECURITY</option>
                  </select>
                  <textarea className="rb-new-area" placeholder="Enter bash/kubectl commands (one per line)" value={newRb.text} onChange={e=>setNewRb({...newRb,text:e.target.value})}></textarea>
                  <div className="rb-new-btn-row">
                    <button className="btn-muted" style={{padding:'4px 8px',fontSize:'10px'}} onClick={()=>setShowNew(false)}>CANCEL</button>
                    <button className="btn-cyan" style={{padding:'4px 8px',fontSize:'10px'}} onClick={handleSaveNew}>SAVE</button>
                  </div>
                </div>
              )}
              {runbooks.filter(r => (r.title+r.cat+r.tags.join('')).toLowerCase().includes(filter.toLowerCase())).map(r => {
                const isAct = r.id === activeRunbookId;
                const catClass = r.cat==='KUBERNETES'?'cyan':r.cat==='DATABASE'?'amber':r.cat==='NETWORK'?'green':'red';
                return (
                  <div key={r.id} className={\`rb-card rb-cat-\${catClass} \${isAct?'active':''}\`} onClick={()=>setActiveRunbookId(r.id)}>
                    <div className="rb-card-meta">
                      <span className="rb-cat-badge">{r.cat}</span>
                      <span>{r.lastUsed}</span>
                    </div>
                    <div className="rb-card-title">{r.title} {r.linkedInc && <span className="inc-linked-badge">LINKED</span>}</div>
                    <div className="rb-tags">
                      {r.tags.map(t => <span key={t} className="rb-tag">{t}</span>)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="rb-right">
            {activeRb ? (
              <>
                <div className="rb-view-hdr">
                  <div className="rb-view-title">{activeRb.title}</div>
                  <div style={{display:'flex',gap:'10px',position:'relative'}}>
                    <button className="btn-muted" onClick={handleCopyAll}>[COPY ALL COMMANDS]</button>
                    <button className="btn-cyan" onClick={()=>setShowLinkMenu(!showLinkMenu)}>[RUN AGAINST INCIDENT ▶]</button>
                    {showLinkMenu && (
                      <div className="rb-link-pop">
                        <div style={{fontFamily:'var(--f-mono)',fontSize:'10px',color:'var(--tx-3)'}}>Apply to incident:</div>
                        <select className="rb-link-select" value={linkSelected} onChange={e=>setLinkSelected(e.target.value)}>
                          <option value="">-- Select active incident --</option>
                          {activeIncidents.map(i => <option key={i.id} value={i.id}>{i.title}</option>)}
                        </select>
                        <button className="btn-cyan" onClick={handleLink} disabled={!linkSelected}>CONFIRM & LINK</button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="rb-view-meta">
                  <span style={{color:activeRb.cat==='KUBERNETES'?'var(--teal)':activeRb.cat==='DATABASE'?'var(--amber)':activeRb.cat==='NETWORK'?'var(--green)':'var(--red)'}}>{activeRb.cat}</span> | Last updated: Jan 15, 2024 | Estimated time: ~3 min
                </div>
                
                <div>
                  {activeRb.steps.map((s,i) => (
                    <div key={i} className="rb-step">
                      <div className="rb-step-num">[{String(i+1).padStart(2,'0')}]</div>
                      <div className="rb-step-content">
                        <div className="rb-step-title">{s.action}</div>
                        <div className="rb-step-desc">{s.desc}</div>
                        <div className="rb-cmd-wrap">
                          <div className="rb-cmd"><span className="rb-cmd-prefix">$</span>{s.cmd}</div>
                          <button className={\`rb-cmd-copy \${copiedCmd===i?'done':''}\`} onClick={()=>handleCopySingle(s.cmd,i)}>
                            {copiedCmd===i?'COPIED ✓':'COPY'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{margin:'auto',fontFamily:'var(--f-mono)',color:'var(--tx-4)',fontSize:'12px'}}>Select a runbook to view steps</div>
            )}
          </div>
        </div>
      );
    }

    /* ── HISTORY PANEL ──────────────────────────────────────────────── */
    function HistoryPanel({ data, onViewRca }) {
      const [compMode, setCompMode] = useState(false);
      const [selected, setSelected] = useState([]);

      const handleCheck = (id) => {
        if (selected.includes(id)) setSelected(selected.filter(x=>x!==id));
        else if (selected.length < 2) setSelected([...selected, id]);
        else alert('Select max 2 incidents to compare');
      };

      if (compMode && selected.length === 2) {
        const i1 = data.find(d=>d.id===selected[0]);
        const i2 = data.find(d=>d.id===selected[1]);
        const compareVal = (v1, v2, higherIsBetter) => {
          const num1 = parseFloat(v1.toString().replace(/[^\\d.-]/g, ''));
          const num2 = parseFloat(v2.toString().replace(/[^\\d.-]/g, ''));
          if (isNaN(num1) || isNaN(num2)) return [null, null];
          if (num1 === num2) return [null, null];
          const v1Wins = higherIsBetter ? num1 > num2 : num1 < num2;
          return v1Wins ? ['val-better', 'val-worse'] : ['val-worse', 'val-better'];
        };
        
        const mttrCls = compareVal(i1.mttr, i2.mttr, false);
        const confCls = compareVal(i1.conf, i2.conf, true);
        const errCls = compareVal(i1.errPeak, i2.errPeak, false);

        return (
          <div className="hist-panel">
            <div className="hist-hdr">
              <span className="hist-hdr-title">INCIDENT COMPARISON</span>
              <button className="btn-outline" onClick={()=>{setCompMode(false); setSelected([]);}}>← BACK TO LIST</button>
            </div>
            <div className="comp-view">
              <div className="comp-col">
                <div className="comp-hdr">{i1.title} <span className="inc-sev-tag" style={{fontSize:'10px',marginLeft:'8px'}}>{i1.sev}</span></div>
                <div className="comp-row"><span className="comp-lbl">Service Affected</span><span className="comp-val">{i1.svc}</span></div>
                <div className="comp-row"><span className="comp-lbl">MTTR</span><span className={\`comp-val \${mttrCls[0]}\`}>{i1.mttr}m</span></div>
                <div className="comp-row"><span className="comp-lbl">RCA Confidence</span><span className={\`comp-val \${confCls[0]}\`}>{i1.conf}%</span></div>
                <div className="comp-row"><span className="comp-lbl">Error Rate Peak</span><span className={\`comp-val \${errCls[0]}\`}>{i1.errPeak}</span></div>
                <div className="comp-row"><span className="comp-lbl">Top Cause</span><span className="comp-val">{i1.topCause}</span></div>
                <div className="comp-row"><span className="comp-lbl">Top Fix</span><span className="comp-val">{i1.topFix}</span></div>
              </div>
              <div className="comp-col">
                <div className="comp-hdr">{i2.title} <span className="inc-sev-tag" style={{fontSize:'10px',marginLeft:'8px'}}>{i2.sev}</span></div>
                <div className="comp-row"><span className="comp-lbl">Service Affected</span><span className="comp-val">{i2.svc}</span></div>
                <div className="comp-row"><span className="comp-lbl">MTTR</span><span className={\`comp-val \${mttrCls[1]}\`}>{i2.mttr}m</span></div>
                <div className="comp-row"><span className="comp-lbl">RCA Confidence</span><span className={\`comp-val \${confCls[1]}\`}>{i2.conf}%</span></div>
                <div className="comp-row"><span className="comp-lbl">Error Rate Peak</span><span className={\`comp-val \${errCls[1]}\`}>{i2.errPeak}</span></div>
                <div className="comp-row"><span className="comp-lbl">Top Cause</span><span className="comp-val">{i2.topCause}</span></div>
                <div className="comp-row"><span className="comp-lbl">Top Fix</span><span className="comp-val">{i2.topFix}</span></div>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="hist-panel">
          <div className="hist-hdr">
            <span className="hist-hdr-title">INCIDENT HISTORY</span>
            <button className="btn-outline" onClick={()=>{setCompMode(!compMode); setSelected([]);}}>{compMode ? 'CANCEL COMPARE' : '[COMPARE MODE]'}</button>
          </div>
          <div className="hist-stats">
            <div className="metric-tile"><span className="metric-lbl">TOTAL INCIDENTS</span><span className="metric-val mono" style={{color:'var(--tx-1)'}}>7</span></div>
            <div className="metric-tile"><span className="metric-lbl">AVG MTTR</span><span className="metric-val mono" style={{color:'var(--teal)'}}>23 MIN</span></div>
            <div className="metric-tile"><span className="metric-lbl">CRITICAL THIS WEEK</span><span className="metric-val mono" style={{color:'var(--red)'}}>2</span></div>
            <div className="metric-tile"><span className="metric-lbl">RCA ACCURACY</span><span className="metric-val mono" style={{color:'var(--green)'}}>91%</span></div>
          </div>
          <div className="hist-table-wrap">
            <table className="hist-table">
              <thead>
                <tr>
                  {compMode && <th className="hist-th" style={{width:40}}></th>}
                  <th className="hist-th">Incident</th>
                  <th className="hist-th">Severity</th>
                  <th className="hist-th">Service</th>
                  <th className="hist-th">Detected</th>
                  <th className="hist-th">Resolved</th>
                  <th className="hist-th">MTTR</th>
                  <th className="hist-th">RCA Conf</th>
                  <th className="hist-th">Status</th>
                  <th className="hist-th" style={{textAlign:'right'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map(d => (
                  <tr key={d.id} className="hist-tr">
                    {compMode && <td className="hist-td"><input type="checkbox" checked={selected.includes(d.id)} onChange={()=>handleCheck(d.id)} /></td>}
                    <td className="hist-td" style={{fontWeight:500}}>{d.title}</td>
                    <td className="hist-td"><div className={\`sev-\${d.sev}\`} style={{display:'inline-block'}}><span className="inc-sev-tag">{d.sev}</span></div></td>
                    <td className="hist-td hist-td-mono">{d.svc}</td>
                    <td className="hist-td hist-td-mono">{d.detected}</td>
                    <td className="hist-td hist-td-mono">{d.resolved}</td>
                    <td className="hist-td hist-td-mono"><span className={d.mttr===0?'':d.mttr<20?'mttr-green':d.mttr<=40?'mttr-amber':'mttr-red'}>{d.mttr===0?'—':\`\${d.mttr}m\`}</span></td>
                    <td className="hist-td hist-td-mono">{d.conf}%</td>
                    <td className="hist-td"><span className={\`status-\${d.status}\`}>{d.status}</span></td>
                    <td className="hist-td" style={{textAlign:'right'}}>
                      <button className="btn-outline" style={{padding:'4px 8px'}} onClick={()=>onViewRca(d.id)}>VIEW RCA</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {compMode && (
              <div style={{padding:'16px 24px',borderTop:'1px solid var(--border)',textAlign:'right'}}>
                <button className="btn-cyan" disabled={selected.length!==2} onClick={()=>{}}>COMPARE SELECTED →</button>
              </div>
            )}
          </div>
        </div>
      );
    }

    /* ── RCA PANEL ──────────────────────────────────────────────────── */
    function RcaPanel({ keyStatus, isAnalyzing, rcaData, streamedText, errorMessage, analysisTime, tokenUsage, onRetry, onSlack, copied, onCopy, inc }) {
      const streamRef = useRef(null);
      const [rpTab, setRpTab] = useState('RCA REPORT');
      useEffect(() => { if (streamRef.current) streamRef.current.scrollTop = streamRef.current.scrollHeight; }, [streamedText]);

      if (keyStatus !== 'connected' && !rcaData && !isAnalyzing && !errorMessage && !inc.mockCauses) {
        return (
          <div className="right-panel">
            <div className="rca-idle">
              <div className="rca-idle-icon">🔒</div>
              <div className="rca-idle-title">CONNECT API KEY TO ENABLE RCA</div>
              <div className="rca-idle-sub">Enter your Gemini API key in the settings bar above, then select an incident or click RE-ANALYZE</div>
            </div>
          </div>
        );
      }

      if (errorMessage && !isAnalyzing) {
        return (
          <div className="right-panel">
            <div className="rca-error">
              <div className="error-icon">⚠️</div>
              <div className="error-title">ANALYSIS FAILED</div>
              <div className="error-msg mono">{errorMessage}</div>
              <button className="btn-retry" onClick={onRetry}>RETRY</button>
            </div>
          </div>
        );
      }

      if (isAnalyzing) {
        return (
          <div className="right-panel">
            <div className="rca-analyzing">
              <div className="analyzing-header">
                <span className="analyzing-title">ANALYZING INCIDENT</span>
                <span className="analyzing-timer mono">{analysisTime.toFixed(1)}s</span>
              </div>
              <div className="stream-box" ref={streamRef}>{streamedText || '{'}</div>
              <div className="skeleton-cards">
                {[1,2,3].map(n => (
                  <div key={n} className="skeleton-card">
                    <div className="skeleton-line w40"></div>
                    <div className="skeleton-line w80"></div>
                    <div className="skeleton-line w60"></div>
                  </div>
                ))}
              </div>
              <div className="progress-bar-wrap"><div className="progress-bar-fill"></div></div>
            </div>
          </div>
        );
      }

      const causes = rcaData ? rcaData.causes.map(c => ({ rank:\`#\${c.rank}\`, conf: c.confidence, title: c.title, desc: c.description, evidence: c.evidence })) : (inc.mockCauses || []);
      const fixes = rcaData ? rcaData.fixes.map(f => ({ step: String(f.step).padStart(2,'0'), action: f.action, cmd: f.command, rationale: f.rationale })) : (inc.mockFixes || []).map(f => ({...f, rationale: null}));
      const confidence = rcaData ? rcaData.confidence : (inc.confidence || 0);
      const impact = rcaData ? [
        { label:"MTTR REDUCTION",    val: rcaData.impact.estimated_mttr_reduction, clr:"green" },
        { label:"AFFECTED SERVICES", val: String(rcaData.impact.affected_services), clr:"amber" },
        { label:"ERROR RATE PEAK",   val: rcaData.impact.error_rate_peak, clr:"red" },
        { label:"TIME TO DETECT",    val: rcaData.impact.time_to_detect, clr:"blue" }
      ] : (inc.metrics || []);

      return (
        <div className="right-panel">
          <div className="rp-tabs">
            <button className={\`rp-tab \${rpTab==='RCA REPORT'?'active':''}\`} onClick={()=>setRpTab('RCA REPORT')}>RCA REPORT</button>
            <button className={\`rp-tab \${rpTab==='DEP GRAPH'?'active':''}\`} onClick={()=>setRpTab('DEP GRAPH')}>DEP GRAPH</button>
          </div>

          {rpTab === 'DEP GRAPH' ? (
            <DependencyGraph incident={inc} />
          ) : (
            <div className="rca-fade-in">
              <div>
                <div className="rp-section-hdr">
                  <span className="rp-title">Root Cause Analysis</span>
                  <span className="badge badge-blue">CONF: {confidence}%</span>
                </div>
                {rcaData && analysisTime > 0 && <div className="analyzed-in" style={{marginBottom:8}}>Analyzed in {analysisTime.toFixed(1)}s</div>}
                <div className="causes">
                  {causes.map((c,i) => (
                    <div key={i} className="cause-card">
                      <div className="cause-top">
                        <span className="cause-rank mono">{c.rank}</span>
                        <span className="cause-pct">{c.conf}%</span>
                      </div>
                      <div className="cause-bar"><div className="cause-bar-fill" style={{width:\`\${c.conf}%\`}}></div></div>
                      <div className="cause-title">{c.title}</div>
                      <div className="cause-desc">{c.desc}</div>
                      {c.evidence && <div className="cause-evidence mono">▸ {c.evidence}</div>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rp-divider"></div>

              <div>
                <div className="rp-section-hdr" style={{marginBottom:10}}><span className="rp-title">Recommended Fixes</span></div>
                <div className="fixes">
                  {fixes.map((f,i) => (
                    <div key={i}>
                      <div className="fix-head">
                        <span className="fix-step">[{f.step}]</span>
                        <span className="fix-action">{f.action}</span>
                      </div>
                      <div className="cmd-box">
                        <span className="cmd-text mono" title={f.cmd}>{f.cmd}</span>
                        <button className={\`btn-copy \${copied === f.step ? 'done' : 'idle'}\`} onClick={() => onCopy(f.cmd, f.step)}>
                          {copied === f.step ? 'COPIED ✓' : 'COPY'}
                        </button>
                      </div>
                      {f.rationale && <div className="fix-rationale">{f.rationale}</div>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rp-divider"></div>

              <div>
                <div className="rp-section-hdr" style={{marginBottom:10}}><span className="rp-title">Impact Summary</span></div>
                <div className="metrics-grid">
                  {impact.map(m => (
                    <div key={m.label} className="metric-tile">
                      <div className="metric-lbl">{m.label}</div>
                      <div className={\`metric-val mono \${m.clr}\`}>{m.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {rcaData?.summary && (
                <>
                  <div className="rp-divider"></div>
                  <div className="summary-box">
                    <div className="summary-title">AI Summary</div>
                    <div className="summary-text">{rcaData.summary}</div>
                  </div>
                  {tokenUsage && (tokenUsage.input || tokenUsage.output) ? (
                    <div className="token-row mono">TOKENS: {tokenUsage.input||0} in / {tokenUsage.output||0} out</div>
                  ) : null}
                </>
              )}
            </div>
          )}

          {rpTab === 'RCA REPORT' && <button className="btn-slack mono" onClick={onSlack}>↗ SEND TO SLACK #incidents</button>}
        </div>
      );
    }

    /* ── LOADING SCREEN COMPONENT ───────────────────────────────────── */
    function LoadingScreen() {
      return (
        <div className="loading-overlay">
          <div className="loading-ascii">
╔══════════════════════════════╗
║  INCIDENTIQ  v1.0.0-phase4   ║
╚══════════════════════════════╝
          </div>
          <div className="loading-sub">Initializing SRE Intelligence Engine...</div>
          <div className="loading-bar-wrap"><div className="loading-bar"></div></div>
        </div>
      );
    }

    /* ── APP ────────────────────────────────────────────────────────── */
    function App() {
      const savedKey = localStorage.getItem('incidentiq_gemini_key') || 'AIzaSyAWiw_6Qck4pfXtF0Qn6jwIfkbpmaSgC0g';
      const hasVisitedIngest = localStorage.getItem('incidentiq_ingest_visited') === 'true';
      const savedRb = JSON.parse(localStorage.getItem('incidentiq_runbooks') || 'null') || HARDCODED_RUNBOOKS;

      const [showLoading, setShowLoading] = useState(true);
      const [showKbHint,  setShowKbHint]  = useState(true);
      
      const [incidents,   setIncidents]   = useState(INITIAL_INCIDENTS);
      const [activeId,    setActiveId]    = useState(1);
      const [activeTab,   setActiveTab]   = useState("ANALYZER");
      const [filter,      setFilter]      = useState("");
      const [alerts,      setAlerts]      = useState(3);
      const [copied,      setCopied]      = useState(null);
      const [toast,       setToast]       = useState({show:false,msg:'',type:'success'});
      const [progresses,  setProgresses]  = useState({1:78,2:45,3:100,4:0});
      const [apiKey,      setApiKey]      = useState(savedKey);
      const [keyStatus,   setKeyStatus]   = useState(savedKey ? 'connected' : 'idle');
      
      const [isAnalyzing, setIsAnalyzing] = useState(false);
      const [rcaData,     setRcaData]     = useState(null);
      const [streamedText,setStreamedText]= useState('');
      const [errorMessage,setErrorMessage]= useState(null);
      const [analysisTime,setAnalysisTime]= useState(0);
      const [tokenUsage,  setTokenUsage]  = useState(null);
      const [cooldown,    setCooldown]    = useState(0);
      const [showNewBadge,setShowNewBadge]= useState(!hasVisitedIngest);
      const [exportMenu,  setExportMenu]  = useState(false);
      
      // Phase 4 States
      const [runbooks,    setRunbooks]    = useState(savedRb);
      const [activeRbId,  setActiveRbId]  = useState(runbooks[0]?.id);
      const [demoState,   setDemoState]   = useState(false);

      const toastRef  = useRef(null);
      const timerRef  = useRef(null);
      const cdRef     = useRef(null);
      const demoTimeoutsRef = useRef([]);

      useEffect(() => {
        setTimeout(() => setShowLoading(false), 1200);
        setTimeout(() => setShowKbHint(false), 8000);
        const id = setInterval(() => setAlerts(p => demoState ? p : Math.max(1,Math.min(9,p+(Math.random()>.5?1:-1)))), 8000);
        return () => clearInterval(id);
      }, [demoState]);

      useEffect(() => {
        const handleKeyDown = (e) => {
          if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
            if (e.key === 'Escape') {
              if (exportMenu) setExportMenu(false);
            }
            return;
          }
          switch(e.key) {
            case 'd': case 'D': toggleDemoMode(); break;
            case '1': switchTab('ANALYZER'); break;
            case '2': switchTab('INCIDENTS'); break;
            case '3': switchTab('RUNBOOKS'); break;
            case '4': switchTab('HISTORY'); break;
            case '/': e.preventDefault(); if (activeTab==='ANALYZER') document.querySelector('.filter-input')?.focus(); break;
            case 'Escape': 
              if (demoState) toggleDemoMode(); 
              if (exportMenu) setExportMenu(false);
              break;
          }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
      }, [demoState, activeTab, exportMenu]);

      useEffect(() => {
        if (!demoState) {
          const id = setInterval(() => {
            setProgresses(p => {
              const n={...p};
              incidents.forEach(inc => { if(inc.status==='analyzing') n[inc.id]=Math.min(99,(p[inc.id]||0)+0.3); });
              return n;
            });
          }, 600);
          return () => clearInterval(id);
        }
      }, [incidents, demoState]);

      useEffect(() => {
        if (isAnalyzing && !demoState) {
          setAnalysisTime(0);
          timerRef.current = setInterval(() => setAnalysisTime(p => +(p+0.1).toFixed(1)), 100);
        } else if (!isAnalyzing && !demoState) {
          clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
      }, [isAnalyzing, demoState]);

      useEffect(() => {
        if (cooldown <= 0) return;
        cdRef.current = setTimeout(() => setCooldown(p => p-1), 1000);
        return () => clearTimeout(cdRef.current);
      }, [cooldown]);

      const fireToast = useCallback((msg, type='success') => {
        setToast({show:false,msg:'',type});
        if (toastRef.current) clearTimeout(toastRef.current);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          setToast({show:true,msg,type});
          toastRef.current = setTimeout(() => setToast({show:false,msg:'',type}), 3000);
        }));
      }, []);

      const clearDemoTimeouts = () => {
        demoTimeoutsRef.current.forEach(t => clearTimeout(t) || clearInterval(t));
        demoTimeoutsRef.current = [];
      };

      const toggleDemoMode = () => {
        if (demoState) {
          // STOP DEMO
          clearDemoTimeouts();
          setDemoState(false);
          setIsAnalyzing(false);
          setAlerts(3);
          setIncidents(INITIAL_INCIDENTS);
          setProgresses({1:78,2:45,3:100,4:0});
          fireToast('Demo stopped', 'warn');
        } else {
          // START DEMO
          setDemoState(true);
          switchTab('ANALYZER');
          setActiveId(1);
          setRcaData(null);
          setStreamedText('');
          setErrorMessage(null);
          setAnalysisTime(0);
          setProgresses(p => ({...p, 1:0}));
          
          let curInc = { ...INITIAL_INCIDENTS[0], logs: [], tl: { labels:[], lanes:[] } };
          setIncidents(prev => prev.map(i => i.id === 1 ? curInc : i));
          
          // Show overlay using CSS transition handled purely by state flag if we want, but doing a manual DOM injected overlay is easier
          const overlay = document.createElement('div');
          overlay.className = 'demo-overlay';
          overlay.innerHTML = '<h1>DEMO MODE ACTIVE</h1><p>Simulating live production incident...</p>';
          document.body.appendChild(overlay);
          
          requestAnimationFrame(() => {
            overlay.classList.add('show');
          });

          demoTimeoutsRef.current.push(setTimeout(() => {
            overlay.classList.remove('show');
            setTimeout(() => overlay.remove(), 300);
          }, 1500));

          // T=1.5s: INCIDENT DETECTED
          demoTimeoutsRef.current.push(setTimeout(() => {
            setProgresses(p => ({...p, 1:15}));
            setAlerts(4);
            const l1 = { ts:"14:17:55.002", lvl:"INFO", svc:"deploy-bot", msg:"Deployed auth-service v2.4.1 → production (canary: 20%)" };
            curInc = { ...curInc, logs: [l1] };
            setIncidents(prev => prev.map(i => i.id === 1 ? curInc : i));
            // trigger log flash handled by setting a class in render
          }, 1500));

          // T=4s: ANOMALY DETECTED
          demoTimeoutsRef.current.push(setTimeout(() => {
            setProgresses(p => ({...p, 1:30}));
            const l2 = { ts:"14:18:33.776", lvl:"WARN", svc:"auth-service", msg:"Latency spike detected: p95=1240ms" };
            const l3 = { ts:"14:28:44.001", lvl:"WARN", svc:"auth-service", msg:"Elevated error rate: 12% (baseline: 0.4%)" };
            curInc = { ...curInc, logs: [...curInc.logs, l2] };
            setIncidents(prev => prev.map(i => i.id === 1 ? curInc : i));
            demoTimeoutsRef.current.push(setTimeout(() => {
              curInc = { ...curInc, logs: [...curInc.logs, l3] };
              setIncidents(prev => prev.map(i => i.id === 1 ? curInc : i));
            }, 300));
          }, 4000));

          // T=8s: ESCALATION
          demoTimeoutsRef.current.push(setTimeout(() => {
            setProgresses(p => ({...p, 1:55}));
            const lx = [
              {ts:"14:31:58.005",lvl:"WARN", svc:"postgres-primary", msg:"Connection pool at 98% capacity"},
              {ts:"14:31:59.220",lvl:"ERROR",svc:"postgres-primary", msg:"Max connections reached (100/100)"},
              {ts:"14:32:03.774",lvl:"WARN", svc:"auth-service",     msg:"Response time degradation: p99=4821ms"}
            ];
            curInc = { ...curInc, logs: [...curInc.logs, ...lx] };
            setIncidents(prev => prev.map(i => i.id === 1 ? curInc : i));
          }, 8000));

          // T=13s: CRITICAL
          demoTimeoutsRef.current.push(setTimeout(() => {
            setProgresses(p => ({...p, 1:78}));
            const lx = [
              {ts:"14:32:05.003",lvl:"ERROR",svc:"payment-gateway", msg:"Upstream auth call failed (retry 2/3)"},
              {ts:"14:32:06.112",lvl:"WARN", svc:"payment-gateway", msg:"Thread pool utilization at 94%"},
              {ts:"14:32:06.998",lvl:"ERROR",svc:"payment-gateway", msg:"Upstream auth call failed (retry 3/3)"},
              {ts:"14:32:07.441",lvl:"ERROR",svc:"auth-service",    msg:"JWT validation timeout after 5000ms"}
            ];
            curInc = { ...curInc, flashRed:true };
            setIncidents(prev => prev.map(i => i.id === 1 ? curInc : i));
            
            lx.forEach((l, idx) => {
              demoTimeoutsRef.current.push(setTimeout(() => {
                curInc = { ...curInc, logs: [...curInc.logs, l] };
                setIncidents(prev => prev.map(i => i.id === 1 ? curInc : i));
              }, idx * 200));
            });
          }, 13000));

          // T=18s: AI ANALYSIS BEGINS
          demoTimeoutsRef.current.push(setTimeout(() => {
            setIsAnalyzing(true);
            setAnalysisTime(0);
            
            const tr = setInterval(() => setAnalysisTime(p => +(p+0.1).toFixed(1)), 100);
            demoTimeoutsRef.current.push(tr);
            
            let charIndex = 0;
            const strLen = DEMO_RCA_JSON.length;
            const typeIt = setInterval(() => {
              if (charIndex < strLen) {
                charIndex += 40 + Math.floor(Math.random() * 20); // typing speed
                setStreamedText(DEMO_RCA_JSON.slice(0, charIndex));
              } else {
                clearInterval(typeIt);
              }
            }, 100);
            demoTimeoutsRef.current.push(typeIt);
          }, 18000));

          // T=38s: ANALYSIS COMPLETE
          demoTimeoutsRef.current.push(setTimeout(() => {
            setIsAnalyzing(false);
            setRcaData(JSON.parse(DEMO_RCA_JSON));
            setProgresses(p => ({...p, 1:100}));
            setAlerts(3);
            fireToast('✓ RCA complete — 94% confidence in 20.3s');
          }, 38300));
          
          // T=43s: DEMO ENDS
          demoTimeoutsRef.current.push(setTimeout(() => {
            setDemoState(false);
            // Show completion banner
            const ban = document.createElement('div');
            ban.className = 'demo-banner';
            ban.id = 'demo-banner-elem';
            ban.innerHTML = '<span>DEMO MODE COMPLETE — Data shown is simulated for demonstration purposes</span><span class="demo-banner-close" onclick="this.parentElement.remove()">✕</span>';
            document.querySelector('.navbar').insertAdjacentElement('afterend', ban);
          }, 43000));
        }
      };

      const handleCopy = (cmd, step) => {
        navigator.clipboard.writeText(cmd).catch(()=>{});
        setCopied(step); setTimeout(() => setCopied(null), 2000);
      };

      const runAnalysis = useCallback((incident) => {
        if (!apiKey || keyStatus !== 'connected') {
          fireToast('Connect your API key first', 'warn'); return;
        }
        if (isAnalyzing || cooldown > 0 || demoState) return;
        setIsAnalyzing(true);
        setRcaData(null);
        setStreamedText('');
        setErrorMessage(null);
        setTokenUsage(null);

        callGeminiStream({
          incident,
          apiKey,
          onChunk: (full) => setStreamedText(full),
          onComplete: (data) => {
            setRcaData(data);
            setIsAnalyzing(false);
            setProgresses(p => ({...p, [incident.id]: 100}));
            setCooldown(10);
            fireToast('✓ RCA complete', 'success');
          },
          onError: (msg) => {
            setErrorMessage(msg);
            setIsAnalyzing(false);
          },
          onTokens: (tokens) => {
            setTokenUsage(prev => typeof tokens === 'function' ? tokens(prev) : {...(prev||{}), ...tokens});
          }
        });
      }, [apiKey, keyStatus, isAnalyzing, cooldown, fireToast, demoState]);

      const inc = incidents.find(d => d.id === activeId);
      const liveInc = d => ({...d, prog: progresses[d.id] ?? d.prog});

      const handleIncidentClick = (id) => {
        setActiveId(id);
        setFilter('');
        setRcaData(null);
        setErrorMessage(null);
        setStreamedText('');
        if (keyStatus === 'connected' && !demoState) {
          const clicked = incidents.find(d => d.id === id);
          runAnalysis(clicked);
        }
        setActiveTab("ANALYZER");
      };

      const handleReanalyze = () => runAnalysis(inc);

      const handleIngestAnalyze = (newInc) => {
        setIncidents(prev => [newInc, ...prev]);
        setActiveId(newInc.id);
        setActiveTab("ANALYZER");
        if (keyStatus === 'connected') {
          setTimeout(() => runAnalysis(newInc), 100);
        }
        setTimeout(() => {
          setIncidents(prev => prev.map(i => i.id === newInc.id ? {...i, isNew: false} : i));
        }, 60000);
      };

      const handleLinkRunbook = (incId, rbId) => {
        setRunbooks(prev => prev.map(r => r.id === rbId ? {...r, linkedInc: incId} : r));
        setIncidents(prev => prev.map(i => i.id === incId ? {...i, linkedRb: rbId} : i));
      };

      const switchTab = (t) => {
        setActiveTab(t);
        if (t === 'INGEST LOGS' && showNewBadge) {
          setShowNewBadge(false);
          localStorage.setItem('incidentiq_ingest_visited', 'true');
        }
      };

      const doExportJSON = () => {
        setExportMenu(false);
        if (!rcaData && !demoState && !inc.mockCauses) {
          fireToast('Run analysis first before exporting', 'warn'); return;
        }
        const obj = {
          exported_at: new Date().toISOString(),
          incident: { name: inc.title, severity: inc.sev, service: inc.svc, timestamp: inc.ts },
          rca: rcaData || { causes: inc.mockCauses, fixes: inc.mockFixes, impact: inc.metrics },
          logs: inc.logs,
          model: "gemini-3.5-flash"
        };
        const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = \`\${inc.title.replace(/\\s+/g, '-').toLowerCase()}-rca.json\`;
        a.click();
        URL.revokeObjectURL(url);
        fireToast('✓ JSON exported');
      };

      const doExportPDF = () => {
        setExportMenu(false);
        if (!rcaData && !demoState && !inc.mockCauses) {
          fireToast('Run analysis first before exporting', 'warn'); return;
        }
        const causes = rcaData ? rcaData.causes : inc.mockCauses;
        const fixes = rcaData ? rcaData.fixes : inc.mockFixes;
        const sum = rcaData ? rcaData.summary : "Analysis summary exported.";

        const printDiv = document.createElement('div');
        printDiv.id = 'print-target';
        printDiv.innerHTML = \`
          <style>
            @media print {
              body * { visibility: hidden; }
              #print-target, #print-target * { visibility: visible; }
              #print-target { position: absolute; left: 0; top: 0; width: 100%; font-family: Arial, sans-serif; color: #000; background: #fff; padding: 20px; }
              .pt-hdr { font-size: 24px; font-weight: bold; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
              .pt-meta { margin-bottom: 30px; font-size: 14px; }
              .pt-sec { font-size: 18px; font-weight: bold; margin-top: 20px; margin-bottom: 10px; }
              .pt-card { border: 1px solid #ccc; padding: 10px; margin-bottom: 10px; border-radius: 4px; }
              .pt-code { font-family: monospace; background: #f4f4f4; padding: 5px; border-radius: 3px; display: block; margin-top: 5px; }
              .pt-footer { margin-top: 40px; font-size: 10px; color: #666; border-top: 1px solid #ccc; padding-top: 10px; }
            }
          </style>
          <div class="pt-hdr">INCIDENTIQ — Root Cause Analysis Report</div>
          <div class="pt-meta">
            <strong>Incident:</strong> \${inc.title}<br/>
            <strong>Severity:</strong> \${inc.sev}<br/>
            <strong>Service:</strong> \${inc.svc}<br/>
            <strong>Time:</strong> \${inc.ts}
          </div>
          <div class="pt-sec">Summary</div>
          <p>\${sum}</p>
          <div class="pt-sec">Root Causes</div>
          \${causes.map(c => \`<div class="pt-card"><strong>\${c.title} (Conf: \${c.conf||c.confidence}%)</strong><br/>\${c.desc||c.description}<br/><em>Evidence: \${c.evidence}</em></div>\`).join('')}
          <div class="pt-sec">Recommended Fixes</div>
          \${fixes.map(f => \`<div class="pt-card"><strong>Step \${f.step}: \${f.action}</strong><code class="pt-code">\${f.cmd||f.command}</code>\${f.rationale ? \`<br/>Rationale: \${f.rationale}\` : ''}</div>\`).join('')}
          <div class="pt-footer">Generated by INCIDENTIQ | \${new Date().toLocaleString()} | Model: gemini-3.5-flash</div>
        \`;
        document.body.appendChild(printDiv);
        window.print();
        window.onafterprint = () => { printDiv.remove(); window.onafterprint = null; };
      };

      const handleViewRca = (id) => {
        // Find in history and switch to analyzer
        const histInc = HISTORY_DATA.find(h => h.id === id);
        if (histInc) {
          const mockInc = {
            id: histInc.id, sev: histInc.sev, ts: histInc.detected, title: histInc.title,
            svc: histInc.svc, status: "resolved", prog: 100, confidence: histInc.conf,
            tl: { labels:[], lanes:[] }, logs: [],
            mockCauses: [{rank:1, conf:histInc.conf, title:histInc.topCause, desc:"Resolved historical incident", evidence:"Historical data"}],
            mockFixes: [{step:1, action:histInc.topFix, cmd:"# Historical command"}],
            metrics: [
              {label:"MTTR", val:histInc.mttr+"m", clr:"green"}, {label:"ERROR PEAK", val:histInc.errPeak, clr:"amber"}
            ]
          };
          // Temporarily inject into active list if not there
          if (!incidents.find(i => i.id === id)) setIncidents(p => [mockInc, ...p]);
          setActiveId(id);
          switchTab("ANALYZER");
        }
      };

      if (showLoading) return <LoadingScreen />;

      return (
        <div style={{display:'flex',flexDirection:'column',height:'100vh',width:'100vw'}}>
          {/* NAVBAR */}
          <nav className="navbar">
            <div className="logo">
              <div className="logo-dot"></div>
              <span className="logo-text">INCIDENTIQ</span>
            </div>
            <div className="tabs">
              {["ANALYZER","INCIDENTS","RUNBOOKS","HISTORY","INGEST LOGS"].map(t => (
                <button key={t} className={\`tab\${activeTab===t?' active':''}\`} onClick={()=>switchTab(t)}>
                  {t} {t==='INGEST LOGS' && showNewBadge && <span className="badge-new-nav">+NEW</span>}
                </button>
              ))}
            </div>
            <div className="nav-right">
              <button className={\`btn-demo \${demoState ? 'active' : ''}\`} onClick={toggleDemoMode}>
                {demoState ? '■ STOP DEMO' : '▶ DEMO MODE'}
              </button>
              <div className="status-pill pill-green"><span className="pill-dot g"></span>SERVICES: 24 HEALTHY</div>
              <div className="status-pill pill-amber"><span className="pill-dot a"></span>ALERTS: {alerts} ACTIVE</div>
              <div className="status-pill pill-muted">MTTR: 18 MIN</div>
              <div className="avatar">RJ</div>
            </div>
          </nav>

          {/* SETTINGS BAR */}
          <SettingsBar apiKey={apiKey} setApiKey={setApiKey} keyStatus={keyStatus} setKeyStatus={setKeyStatus} />

          {/* BODY */}
          <div className="body-layout">
            
            {activeTab !== 'RUNBOOKS' && activeTab !== 'HISTORY' && activeTab !== 'INCIDENTS' && (
              <aside className="sidebar">
                <div className="side-section-hdr">Live Incidents</div>
                <div className="inc-list">
                  {incidents.map(d => {
                    const ip = liveInc(d);
                    const isRes = ip.status === 'resolved' || ip.prog === 100;
                    return (
                      <div key={d.id} className={\`inc-card sev-\${d.sev}\${activeId===d.id?' active':''}\${d.flashRed?' flash-red':''}\${isRes?' resolved-green':''}\`} onClick={()=>handleIncidentClick(d.id)}>
                        <div className="inc-top">
                          <div>
                            <span className="inc-sev-tag">{d.sev}</span>
                            {d.isNew && <span className="inc-new-badge">NEW</span>}
                            {d.linkedRb && <span className="inc-linked-badge">LINKED</span>}
                          </div>
                          <span className="inc-ts">{d.ts}</span>
                        </div>
                        <div className="inc-title">{d.title}</div>
                        <div className="inc-svc mono">{d.svc}</div>
                        {ip.prog > 0 && ip.prog < 100 && (
                          <div className="pbar-bg"><div className={\`pbar-fill \${ip.status==='analyzing'?'analyzing':''}\`} style={{width:\`\${ip.prog}%\`}}></div></div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="sidebar-divider"></div>
                <div className="sources-block">
                  <div className="side-section-hdr" style={{padding:'0 0 10px 0'}}>Connected Sources</div>
                  <div className="src-row"><div className="src-left"><div className="src-dot live"></div>Datadog</div><div className="src-badge live">LIVE</div></div>
                  <div className="src-row"><div className="src-left"><div className="src-dot live"></div>Grafana</div><div className="src-badge live">LIVE</div></div>
                  <div className="src-row"><div className="src-left"><div className="src-dot live"></div>Prometheus</div><div className="src-badge live">LIVE</div></div>
                  <div className="src-row"><div className="src-left"><div className="src-dot live"></div>PagerDuty</div><div className="src-badge live">LIVE</div></div>
                  <div className="src-row"><div className="src-left"><div className="src-dot warn"></div>Loki</div><div className="src-badge warn">WARN</div></div>
                </div>
              </aside>
            )}

            {/* MAIN ZONE */}
            {activeTab === 'INGEST LOGS' ? (
              <LogIngestionPanel onAnalyze={handleIngestAnalyze} />
            ) : activeTab === 'RUNBOOKS' ? (
              <RunbooksPanel runbooks={runbooks} setRunbooks={setRunbooks} activeRunbookId={activeRbId} setActiveRunbookId={setActiveRbId} activeIncidents={incidents} onLinkIncident={handleLinkRunbook} fireToast={fireToast} />
            ) : activeTab === 'HISTORY' ? (
              <HistoryPanel data={HISTORY_DATA} onViewRca={handleViewRca} />
            ) : activeTab === 'INCIDENTS' ? (
              <div className="hist-panel">
                <div className="hist-hdr">
                  <span className="hist-hdr-title">ACTIVE INCIDENTS</span>
                  <button className="btn-outline" onClick={()=>switchTab('HISTORY')}>→ VIEW IN HISTORY</button>
                </div>
                <div style={{padding:'20px 24px', fontFamily:'var(--f-mono)', fontSize:'11px', color:'var(--tx-3)'}}>
                  1 active incident | 6 resolved in last 7 days
                </div>
                <HistoryPanel data={HISTORY_DATA.filter(h => h.status === 'OPEN')} onViewRca={handleViewRca} />
              </div>
            ) : (
              <main className="main">
                <div className="subhead">
                  <div className="subhead-title">{inc?.title || 'No Incident Selected'}</div>
                  <div className="btn-row">
                    <button className={\`btn-outline \${cooldown>0?'cooldown':''}\`} onClick={handleReanalyze} disabled={isAnalyzing || cooldown>0 || demoState}>
                      {cooldown>0 ? \`COOLDOWN (\${cooldown}s)\` : 'RE-ANALYZE ↺'}
                    </button>
                    <div style={{position:'relative'}}>
                      <button className="btn-outline" onClick={()=>setExportMenu(!exportMenu)}>EXPORT PDF/JSON ↓</button>
                      {exportMenu && (
                        <div className="export-dropdown">
                          <button className="export-opt" onClick={doExportJSON}>↓ Export as JSON</button>
                          <button className="export-opt" onClick={doExportPDF}>↓ Export as PDF (print)</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="analyzer-meta">Model: gemini-3.5-flash | Temp: 0.2 | Max tokens: 8192 | Stream: ON {rcaData && analysisTime > 0 && \`| Analyzed in: \${analysisTime.toFixed(1)}s\`}</div>

                <div className="panels">
                  <div className="panel tl-panel">
                    <div className="panel-header">
                      <span className="panel-label">Event Timeline</span>
                      <span className="badge badge-blue">LAST 15 MIN</span>
                    </div>
                    <div className="tl-body">
                      {inc?.tl?.lanes?.length ? (
                        <>
                          <div className="swimlanes">
                            {inc.tl.lanes.map((l, i) => (
                              <div key={i} className="swimlane">
                                <div className="sl-label" title={l.name}>{l.name}</div>
                                <div className="sl-track">
                                  <div className="sl-baseline"></div>
                                  <div className="detect-line"></div>
                                  <div className="detect-lbl">DETECTED</div>
                                  {l.ticks.map((t, j) => (
                                    <div key={j} className={\`tick \${t.type}\`} style={{left:\`\${t.pct}%\`}}>
                                      <div className="tick-tip"><span className="tip-time">{t.t}</span>{t.msg}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="tl-axis">
                            <div className="tl-axis-inner">
                              {inc.tl.labels.map((lbl, i) => (
                                <div key={i} className="tl-lbl" style={{left:\`\${(i/(inc.tl.labels.length-1))*100}%\`}}>{lbl}</div>
                              ))}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="log-empty">No timeline data available</div>
                      )}
                    </div>
                  </div>

                  <div className="panel logs-panel">
                    <div className="panel-header">
                      <div className="log-hdr-left">
                        <span className="panel-label">Log Stream</span>
                        <div className="badge-live"><div className="badge-live-dot"></div>LIVE</div>
                      </div>
                      <input className="filter-input" placeholder="filter logs..." value={filter} onChange={e=>setFilter(e.target.value)} />
                    </div>
                    <div className="log-view">
                      {inc?.logs?.filter(l => (l.msg+l.svc+l.lvl).toLowerCase().includes(filter.toLowerCase())).length > 0 ? (
                        inc.logs.filter(l => (l.msg+l.svc+l.lvl).toLowerCase().includes(filter.toLowerCase())).map((l, i) => (
                          <div key={i} className={\`log-line \${l.flashHighlight?'flash-highlight':''}\`}>
                            <span className="log-ts">{l.ts}</span>
                            <span className="log-lvl-w"><span className={\`log-lvl \${l.lvl}\`}>{l.lvl}</span></span>
                            <span className="log-svc">{l.svc}</span>
                            <span className="log-msg">{l.msg}</span>
                          </div>
                        ))
                      ) : (
                        <div className="log-empty">No logs match current filter</div>
                      )}
                    </div>
                  </div>
                </div>
              </main>
            )}

            {/* RIGHT PANEL (only on Analyzer / Ingest) */}
            {(activeTab === 'ANALYZER' || activeTab === 'INGEST LOGS') && (
              <RcaPanel keyStatus={keyStatus} isAnalyzing={isAnalyzing} rcaData={rcaData} streamedText={streamedText} errorMessage={errorMessage} analysisTime={analysisTime} tokenUsage={tokenUsage} onRetry={handleReanalyze} onSlack={()=>fireToast('Report sent to #incidents')} copied={copied} onCopy={handleCopy} inc={inc} />
            )}
          </div>

          {/* TOASTS */}
          <div className="toast-container">
            {toast.show && (
              <div className={\`toast t-\${toast.type}\`}>
                <div className="toast-icon">{toast.type==='success'?'✓':toast.type==='warn'?'⚠️':'×'}</div>
                <div className="toast-msg">{toast.msg}</div>
              </div>
            )}
          </div>

          <div className={\`kb-hint \${showKbHint?'show':''}\`}>Press D for demo | 1–4 for tabs | / to search</div>
        </div>
      );
    }

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
  </script>
</body>
</html>`;

fs.writeFileSync('index.html', finalHtml, 'utf8');
console.log('Build Phase 4 completed!');
