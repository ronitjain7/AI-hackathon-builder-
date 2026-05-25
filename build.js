const fs = require('fs');

const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
    :root {
      --bg-base:#0C0F14; --bg-surface:#111620; --bg-card:#161C27; --bg-input:#0A0D12;
      --border:rgba(255,255,255,0.07); --border-focus:rgba(99,179,237,0.4);
      --blue:#63B3ED; --teal:#4FD1C5; --amber:#F6AD55; --red:#FC8181; --green:#68D391; --purple:#B794F4;
      --tx-1:#E8EDF3; --tx-2:#A0AABA; --tx-3:#5C6878; --tx-4:#3A4455;
      --f-ui:'Inter',sans-serif; --f-mono:'JetBrains Mono',monospace;
      --r-sm:4px; --r-md:6px; --t-fast:0.15s ease; --t-med:0.25s ease;
    }
    *{box-sizing:border-box;margin:0;padding:0;}
    body{background:var(--bg-base);color:var(--tx-1);font-family:var(--f-ui);height:100vh;overflow:hidden;display:flex;flex-direction:column;-webkit-font-smoothing:antialiased;background-image:radial-gradient(circle,rgba(255,255,255,0.025) 1px,transparent 1px);background-size:28px 28px;}
    ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:var(--tx-4);border-radius:2px;}
    .mono{font-family:var(--f-mono);font-variant-numeric:tabular-nums;} .truncate{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}

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
    .avatar{width:30px;height:30px;border-radius:50%;border:1px solid rgba(99,179,237,.3);background:rgba(99,179,237,.1);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:var(--blue);cursor:pointer;margin-left:4px;transition:border-color var(--t-fast);}

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
    .inc-top{display:flex;justify-content:space-between;align-items:center;}
    .inc-sev-tag{font-family:var(--f-mono);font-size:9px;font-weight:600;letter-spacing:.08em;padding:2px 6px;border-radius:3px;}
    .sev-CRITICAL .inc-sev-tag{color:var(--red);background:rgba(252,129,129,.12);}
    .sev-HIGH .inc-sev-tag{color:var(--amber);background:rgba(246,173,85,.12);}
    .sev-MEDIUM .inc-sev-tag{color:var(--blue);background:rgba(99,179,237,.12);}
    .sev-LOW .inc-sev-tag{color:var(--tx-3);background:rgba(255,255,255,.08);}
    .inc-ts{font-family:var(--f-mono);font-size:10px;color:var(--tx-3);}
    .inc-title{font-size:12px;font-weight:500;line-height:1.35;color:var(--tx-1);}
    .inc-svc{font-family:var(--f-mono);font-size:10px;color:var(--tx-3);}
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
    .btn-row{display:flex;gap:8px;}
    .btn-outline{background:transparent;border:1px solid rgba(99,179,237,.3);color:var(--blue);font-family:var(--f-mono);font-size:10px;font-weight:500;padding:5px 12px;cursor:pointer;border-radius:var(--r-sm);transition:background var(--t-fast),border-color var(--t-fast);letter-spacing:.06em;}
    .btn-outline:hover{background:rgba(99,179,237,.08);border-color:rgba(99,179,237,.5);}
    .btn-outline:active{transform:scale(.98);} .btn-outline:disabled{opacity:.45;cursor:default;}
    .btn-outline.cooldown{color:var(--tx-3);border-color:rgba(255,255,255,.1);}
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
    .log-ts{color:var(--tx-4);width:88px;flex-shrink:0;}
    .log-lvl-w{width:44px;flex-shrink:0;}
    .log-lvl{font-size:9px;font-weight:600;padding:1px 5px;border-radius:3px;letter-spacing:.04em;}
    .log-lvl.ERROR{background:rgba(252,129,129,.2);color:var(--red);}
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
    .causes{display:flex;flex-direction:column;gap:12px;}
    .cause-card{display:flex;flex-direction:column;gap:5px;}
    .cause-top{display:flex;justify-content:space-between;align-items:flex-end;}
    .cause-rank{font-size:10px;color:var(--tx-4);}
    .cause-pct{font-family:var(--f-mono);font-size:11px;font-weight:600;color:var(--blue);}
    .cause-bar{height:2px;background:rgba(255,255,255,.05);border-radius:1px;overflow:hidden;}
    .cause-bar-fill{height:100%;background:var(--blue);border-radius:1px;}
    .cause-title{font-size:12px;font-weight:500;color:var(--tx-1);line-height:1.4;margin-top:2px;}
    .cause-desc{font-size:11px;color:var(--tx-3);line-height:1.5;}
    .cause-evidence{font-size:10px;color:var(--amber);background:rgba(246,173,85,.08);padding:4px 8px;border-radius:3px;margin-top:4px;}
    .fixes{display:flex;flex-direction:column;gap:14px;}
    .fix-head{display:flex;gap:6px;align-items:baseline;margin-bottom:6px;}
    .fix-step{font-family:var(--f-mono);font-size:10px;color:var(--blue);font-weight:600;}
    .fix-action{font-size:12px;font-weight:500;color:var(--tx-1);line-height:1.3;}
    .cmd-box{background:var(--bg-input);border:1px solid var(--border);border-radius:3px;display:flex;justify-content:space-between;align-items:center;padding:4px 4px 4px 10px;}
    .cmd-text{font-size:10.5px;color:var(--green);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding-right:10px;}
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

    /* METADATA ROW */
    .analyzer-meta { background:var(--bg-surface); border-bottom:1px solid var(--border); padding:4px 20px; font-family:var(--f-mono); font-size:10px; color:var(--tx-4); display:flex; gap:16px; align-items:center; }

    /* DEP GRAPH */
    .rp-tabs { display:flex; gap:8px; margin-bottom:14px; }
    .rp-tab { font-family:var(--f-mono); font-size:10px; font-weight:600; color:var(--tx-3); padding:4px 10px; border:1px solid var(--border); border-radius:12px; background:transparent; cursor:pointer; transition:all var(--t-fast); }
    .rp-tab.active { color:var(--tx-1); border-color:var(--tx-3); background:rgba(255,255,255,.05); }

    /* GRAPH SVG */
    .dg-node-rect { fill:#161C27; stroke:rgba(255,255,255,0.1); stroke-width:1; rx:4; transition:all var(--t-fast); }
    .dg-node-text { font-family:var(--f-mono); font-size:10px; fill:var(--tx-1); text-anchor:middle; dominant-baseline:middle; }
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

    @keyframes shimmerFill{0%{background-position:-200% 0;} 100%{background-position:200% 0;}}
    @keyframes shimmerBorder{0%{border-color:rgba(246,173,85,.25);} 50%{border-color:rgba(246,173,85,.6);} 100%{border-color:rgba(246,173,85,.25);}}
    @keyframes breathe{0%{transform:scale(1);opacity:0.8;} 50%{transform:scale(1.3);opacity:1;} 100%{transform:scale(1);opacity:0.8;}}
    @keyframes pulse{0%{opacity:1;} 50%{opacity:0.5;} 100%{opacity:1;}}
    @keyframes slideIn{from{transform:translateY(20px);opacity:0;} to{transform:translateY(0);opacity:1;}}
`;

const js = `
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

  /* ── LOG PARSER ─────────────────────────────────────────────────── */
  function parseLogs(rawText) {
    const lines = rawText.split('\\n');
    const logs = [];
    let parseErrors = 0;
    
    const isoRegex = /^(\\d{4}-\\d{2}-\\d{2}T[\\d:.Z+-]+)\\s+(ERROR|WARN|WARNING|INFO|DEBUG)\\s+(\\S+)\\s+(.+)$/i;
    const shortRegex = /^(\\d{2}:\\d{2}:\\d{2}\\.\\d+)\\s+(ERROR|WARN|WARNING|INFO|DEBUG)\\s+(\\S+)\\s+(.+)$/i;
    
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
          const r = new RegExp(\`(?:^|\\\\s)\${key}=("([^"]+)"|(\\\\S+))\`, 'i');
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

  /* ── BUILD USER MESSAGE ─────────────────────────────────────────── */
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
      const resp = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=\${apiKey}\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: buildUserMessage(incident) }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 1024, responseMimeType: "application/json" }
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
        let clean = fullText.trim();
        if (clean.startsWith('\`\`\`json')) clean = clean.slice(7);
        else if (clean.startsWith('\`\`\`')) clean = clean.slice(3);
        if (clean.endsWith('\`\`\`')) clean = clean.slice(0, -3);
        rcaData = JSON.parse(clean.trim()); 
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

  /* ── GRAPH DATA ─────────────────────────────────────────────────── */
  const SERVICE_GRAPH = {
    "api-gateway":       { dependsOn: [],                          tier: 0 },
    "auth-service":      { dependsOn: ["api-gateway"],             tier: 1 },
    "payment-gateway":   { dependsOn: ["auth-service"],            tier: 2 },
    "cart-api-v2":       { dependsOn: ["auth-service", "postgres-primary"], tier: 2 },
    "postgres-primary":  { dependsOn: [],                          tier: 0 },
    "rabbitmq-cluster":  { dependsOn: ["cart-api-v2"],             tier: 3 },
    "notification-svc":  { dependsOn: ["rabbitmq-cluster"],        tier: 4 },
  };

  /* ── DEPENDENCY GRAPH COMPONENT ─────────────────────────────────── */
  function DependencyGraph({ incident }) {
    // Determine status from incident logs
    const statusMap = {};
    Object.keys(SERVICE_GRAPH).forEach(svc => statusMap[svc] = 'healthy');
    if (incident && incident.logs) {
      incident.logs.forEach(l => {
        if (!SERVICE_GRAPH[l.svc]) return;
        if (l.lvl === 'ERROR' || l.lvl === 'CRITICAL') statusMap[l.svc] = 'critical';
        else if (l.lvl === 'WARN' && statusMap[l.svc] !== 'critical') statusMap[l.svc] = 'affected';
      });
    }

    const tiers = [[], [], [], [], []];
    Object.keys(SERVICE_GRAPH).forEach(svc => tiers[SERVICE_GRAPH[svc].tier].push(svc));

    const NODE_W = 100, NODE_H = 32, X_SPACING = 140, Y_SPACING = 70;
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
                <text x={4} y={1} className="dg-node-text">{n.id}</text>
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

  /* ── INITIAL INCIDENT DATA ───────────────────────────────────────── */
  const INITIAL_INCIDENTS = [
    {
      id:1, sev:"CRITICAL", ts:"14:32:07", title:"Payment Gateway Timeout Cascade",
      svc:"auth-service", status:"analyzing", prog:78, confidence:94,
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
        <div className="sb-label">🔑 GEMINI API KEY</div>
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

  /* ── RCA PANEL ──────────────────────────────────────────────────── */
  function RcaPanel({ keyStatus, isAnalyzing, rcaData, streamedText, errorMessage, analysisTime, tokenUsage, onRetry, onSlack, copied, onCopy, inc }) {
    const streamRef = useRef(null);
    const [rpTab, setRpTab] = useState('RCA REPORT');
    useEffect(() => { if (streamRef.current) streamRef.current.scrollTop = streamRef.current.scrollHeight; }, [streamedText]);

    if (keyStatus !== 'connected' && !rcaData && !isAnalyzing && !errorMessage) {
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

    const causes = rcaData ? rcaData.causes.map(c => ({ rank:\`#\${c.rank}\`, conf: c.confidence, title: c.title, desc: c.description, evidence: c.evidence })) : inc.mockCauses;
    const fixes = rcaData ? rcaData.fixes.map(f => ({ step: String(f.step).padStart(2,'0'), action: f.action, cmd: f.command, rationale: f.rationale })) : inc.mockFixes.map(f => ({...f, rationale: null}));
    const confidence = rcaData ? rcaData.confidence : inc.confidence;
    const impact = rcaData ? [
      { label:"MTTR REDUCTION",    val: rcaData.impact.estimated_mttr_reduction, clr:"green" },
      { label:"AFFECTED SERVICES", val: String(rcaData.impact.affected_services), clr:"amber" },
      { label:"ERROR RATE PEAK",   val: rcaData.impact.error_rate_peak, clr:"red" },
      { label:"TIME TO DETECT",    val: rcaData.impact.time_to_detect, clr:"blue" }
    ] : inc.metrics;

    return (
      <div className="right-panel">
        <div className="rp-tabs">
          <button className={\`rp-tab \${rpTab==='RCA REPORT'?'active':''}\`} onClick={()=>setRpTab('RCA REPORT')}>RCA REPORT</button>
          <button className={\`rp-tab \${rpTab==='DEP GRAPH'?'active':''}\`} onClick={()=>setRpTab('DEP GRAPH')}>DEP GRAPH</button>
        </div>

        {rpTab === 'DEP GRAPH' ? (
          <DependencyGraph incident={inc} />
        ) : (
          <>
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
          </>
        )}

        <button className="btn-slack mono" onClick={onSlack}>↗ SEND TO SLACK #incidents</button>
      </div>
    );
  }

  /* ── APP ────────────────────────────────────────────────────────── */
  function App() {
    const savedKey = localStorage.getItem('incidentiq_gemini_key') || 'AIzaSyAWiw_6Qck4pfXtF0Qn6jwIfkbpmaSgC0g';
    const hasVisitedIngest = localStorage.getItem('incidentiq_ingest_visited') === 'true';

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

    const toastRef  = useRef(null);
    const timerRef  = useRef(null);
    const cdRef     = useRef(null);

    useEffect(() => {
      const id = setInterval(() => setAlerts(p => Math.max(1,Math.min(9,p+(Math.random()>.5?1:-1)))), 8000);
      return () => clearInterval(id);
    }, []);

    useEffect(() => {
      const id = setInterval(() => {
        setProgresses(p => {
          const n={...p};
          incidents.forEach(inc => { if(inc.status==='analyzing') n[inc.id]=Math.min(99,(p[inc.id]||0)+0.3); });
          return n;
        });
      }, 600);
      return () => clearInterval(id);
    }, [incidents]);

    useEffect(() => {
      if (isAnalyzing) {
        setAnalysisTime(0);
        timerRef.current = setInterval(() => setAnalysisTime(p => +(p+0.1).toFixed(1)), 100);
      } else {
        clearInterval(timerRef.current);
      }
      return () => clearInterval(timerRef.current);
    }, [isAnalyzing]);

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

    const handleCopy = (cmd, step) => {
      navigator.clipboard.writeText(cmd).catch(()=>{});
      setCopied(step); setTimeout(() => setCopied(null), 2000);
    };

    const runAnalysis = useCallback((incident) => {
      if (!apiKey || keyStatus !== 'connected') {
        fireToast('Connect your API key first', 'warn'); return;
      }
      if (isAnalyzing || cooldown > 0) return;
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
    }, [apiKey, keyStatus, isAnalyzing, cooldown, fireToast]);

    const inc = incidents.find(d => d.id === activeId);
    const liveInc = d => ({...d, prog: progresses[d.id] ?? d.prog});

    const handleIncidentClick = (id) => {
      setActiveId(id);
      setFilter('');
      setRcaData(null);
      setErrorMessage(null);
      setStreamedText('');
      if (keyStatus === 'connected') {
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
      // Remove NEW badge after 60s
      setTimeout(() => {
        setIncidents(prev => prev.map(i => i.id === newInc.id ? {...i, isNew: false} : i));
      }, 60000);
    };

    const switchTab = (t) => {
      setActiveTab(t);
      if (t === 'INGEST LOGS' && showNewBadge) {
        setShowNewBadge(false);
        localStorage.setItem('incidentiq_ingest_visited', 'true');
      }
    };

    return (
      <div style={{display:'flex',flexDirection:'column',height:'100vh',width:'100vw'}}>
        {/* NAVBAR */}
        <nav className="navbar">
          <div className="logo">
            <div className="logo-dot"></div>
            <span className="logo-text">INCIDENTIQ</span>
          </div>
          <div className="tabs">
            {["ANALYZER","INCIDENTS","RUNBOOKS","INGEST LOGS"].map(t => (
              <button key={t} className={\`tab\${activeTab===t?' active':''}\`} onClick={()=>switchTab(t)}>
                {t} {t==='INGEST LOGS' && showNewBadge && <span className="badge-new-nav">+NEW</span>}
              </button>
            ))}
          </div>
          <div className="nav-right">
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
          {/* SIDEBAR */}
          <aside className="sidebar">
            <div className="side-section-hdr">Live Incidents</div>
            <div className="inc-list">
              {incidents.map(d => {
                const ip = liveInc(d);
                return (
                  <div key={d.id} className={\`inc-card sev-\${d.sev}\${activeId===d.id?' active':''}\`} onClick={()=>handleIncidentClick(d.id)}>
                    <div className="inc-top">
                      <div>
                        <span className="inc-sev-tag">{d.sev}</span>
                        {d.isNew && <span className="inc-new-badge">NEW</span>}
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

          {/* MAIN ZONE */}
          {activeTab === 'INGEST LOGS' ? (
            <LogIngestionPanel onAnalyze={handleIngestAnalyze} />
          ) : (
            <main className="main">
              <div className="subhead">
                <div className="subhead-title">{inc?.title || 'No Incident Selected'}</div>
                <div className="btn-row">
                  <button className={\`btn-outline \${cooldown>0?'cooldown':''}\`} onClick={handleReanalyze} disabled={isAnalyzing || cooldown>0}>
                    {cooldown>0 ? \`COOLDOWN (\${cooldown}s)\` : 'RE-ANALYZE ↺'}
                  </button>
                  <button className="btn-outline">EXPORT PDF ↓</button>
                </div>
              </div>
              <div className="analyzer-meta">Model: gemini-2.0-flash | Temp: 0.2 | Max tokens: 1024 | Stream: ON {rcaData && analysisTime > 0 && \`| Analyzed in: \${analysisTime.toFixed(1)}s\`}</div>

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
                        <div key={i} className="log-line">
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

          {/* RIGHT PANEL */}
          <RcaPanel keyStatus={keyStatus} isAnalyzing={isAnalyzing} rcaData={rcaData} streamedText={streamedText} errorMessage={errorMessage} analysisTime={analysisTime} tokenUsage={tokenUsage} onRetry={handleReanalyze} onSlack={()=>fireToast('Report sent to #incidents')} copied={copied} onCopy={handleCopy} inc={inc} />
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
      </div>
    );
  }

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App />);
\`;

const html = \`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>INCIDENTIQ — AI Incident Root Cause Analyzer</title>
  <style>\${css}</style>
</head>
<body>
  <div id="root"></div>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script type="text/babel">\${js}</script>
</body>
</html>\`;

fs.writeFileSync('index.html', html);
console.log('Successfully wrote index.html');
