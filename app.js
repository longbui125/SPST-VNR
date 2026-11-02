(function () {
  'use strict';
  const $ = (s, parent = document) => parent.querySelector(s);
  const $$ = (s, parent = document) => [...parent.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const sourceReference = page => `<span class="source-reference">Nguồn: tr. ${Number(page)}</span>`;
  const routeMode = document.body.dataset.page || 'quiz';
  const params = new URLSearchParams(location.search);
  const routeHref = (mode, values={}) => '/' + ({quiz:'on-tap',map:'mindmap'}[mode] || 'on-tap') + '/?' + new URLSearchParams(values);
  const chapters = window.SU_DANG_DATA.chapters;
  const P = window.SuDangProgress;
  const allQuestions = chapters.flatMap(c => c.questions);
  let storage;
  try { storage = window.localStorage; } catch { storage = { getItem() { throw Error(); }, setItem() { throw Error(); } }; }
  const loaded = P.load(storage, chapters);
  let state = loaded.state;
  let chapterId = 'c1', activeTab = routeMode, session = [], position = 0, retryId = null;
  let mapZoom = .85, mapHeight = 600, mapOutline = false, expanded = new Set(), selectedNode = null;
  let quizQuery = '', quizFilter = 'all', quizSection = 'all', toastTimer, pendingResetId = null;
  const c = () => chapters.find(x => x.id === chapterId);
  const user = () => state.profiles.find(x => x.id === state.active);
  const normalized = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().replace(/\s+/g, ' ').trim();
  function toast(text) { $('#toast').textContent = text; $('#toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3400); }
  function warn(text) { $('#storage-warning').textContent = text; $('#storage-warning').hidden = false; }
  function persist() { if (!P.save(storage, state)) warn('Không lưu được tiến độ trên trình duyệt này. Hãy dùng Xuất tiến độ để giữ lại buổi học.'); }
  if (loaded.warning) warn(loaded.warning);
  function refreshIdentity() {
    $('#profile-name').textContent = user().name;
    document.title = ({quiz:'Phòng ôn tập',map:'Bản đồ tri thức'}[routeMode]) + ' · Sử Đảng';
  }
  function renderChapterNav() {
    $('#chapter-nav').innerHTML = chapters.map(ch => { const s = P.stats(user(), ch.questions); return `<button class="chapter-nav-item" data-chapter="${ch.id}" aria-current="${ch.id === chapterId}"><span>${esc(ch.label)}</span><small>${esc(ch.period)} · ${ch.questions.length} câu hỏi</small><span class="mini-track" aria-label="Đã trả lời đúng ${s.correct} trên ${s.total} câu"><i style="width:${s.percent}%"></i></span></button>`; }).join('');
    $('#chapter-select').innerHTML = chapters.map(ch => `<option value="${ch.id}" ${ch.id === chapterId ? 'selected' : ''}>${esc(ch.label)} — ${esc(ch.period)}</option>`).join('');
  }
  function selectChapter(id, tab = activeTab) {
    if (!chapters.some(ch => ch.id === id)) id='c1';
    chapterId = id; retryId = null; quizSection = 'all'; quizQuery = '';
    $('#quiz-search').value = ''; quizFilter = 'all'; $('#quiz-filter').value = 'all';
    expanded = new Set(); selectedNode = null;
    $('#chapter-period').textContent = c().period;
    $('#chapter-title').textContent = c().title;
    $('#chapter-pages').textContent = `${c().label} · Trang ${c().startPage}–${c().endPage} · ${c().questions.length} câu hỏi biên soạn`;
    $('#quiz-section').innerHTML = '<option value="all">Toàn chương</option>' + c().sections.map(s => `<option value="${esc(s.id)}">${esc(s.title)}</option>`).join('');
    renderChapterNav(); renderOverview(); buildSession(true); setTab(tab);
  }
  function setTab(tab, focus = false) {
    if(tab === 'overview') tab = routeMode;
    if(tab !== routeMode){ location.href = routeHref(tab,{chuong:chapterId}); return; }
    activeTab = routeMode;
    for(const mode of ['quiz','map']) $('#panel-'+mode).hidden = mode !== routeMode;
    $('#review-drawer').hidden = routeMode !== 'quiz';
    $('#chapter-nav').closest('aside').hidden = routeMode === 'map';
    if(activeTab === 'quiz') renderQuiz();
    if(activeTab === 'map'){ renderMap(); if(!selectedNode) showMapDetail({title:c().mindmap.title,summary:c().summary,page:c().startPage}); }
    user().lastChapter = chapterId; user().lastTab = activeTab; persist();
  }
  function renderOverview() {
    const ch = c(), s = P.stats(user(), ch.questions);
    $('#panel-overview').innerHTML = `<p class="summary-intro">${esc(ch.summary)}</p><div class="overview-actions"><button class="button primary" data-start-quiz="all">${s.answered ? 'Tiếp tục luyện tập' : 'Luyện tập chương này'} ${icon('arrow')}</button><button class="button subtle" data-tab-go="map">${icon('map')} Xem mindmap</button></div><div class="chapter-progress-line"><span>Đã làm <strong>${s.answered}/${s.total}</strong> câu</span><span>Trả lời đúng <strong>${s.correct}</strong> câu</span><span>Cần ôn lại <strong>${s.wrong}</strong> câu</span></div>${ch.sections.map((sec, i) => `<details class="section-item" ${i === 0 ? 'open' : ''}><summary><span>${esc(sec.title)} <small>tr. ${sec.pages[0]}–${sec.pages[1]}</small></span></summary><p>${esc(sec.summary)}</p><ul>${sec.points.map(point => `<li>${esc(point)}</li>`).join('')}</ul><div class="section-actions">${sourceReference(sec.pages[0])}<button data-study-section="${esc(sec.id)}">Luyện câu hỏi chủ đề</button></div></details>`).join('')}${ch.timeline?.length ? `<div class="timeline-list"><h4>Các mốc cần kết nối</h4>${ch.timeline.map(t => `<div class="timeline-event"><span>${esc(t.year)}</span><div><h5>${esc(t.title)}</h5><p>${esc(t.description)}</p>${sourceReference(t.page)}</div></div>`).join('')}</div>` : ''}${ch.reviewPrompts?.length ? `<div class="review-prompts"><h4>Câu hỏi tự luận trong giáo trình</h4><p>Giữ riêng các câu hỏi gốc, để bạn luyện trình bày sau khi tự kiểm tra kiến thức.</p><ol>${ch.reviewPrompts.map(q => `<li>${esc(q.prompt)} ${sourceReference(q.page)}</li>`).join('')}</ol></div>` : ''}`;
  }
  function buildSession(restore = false) {
    session = c().questions.filter(q => {
      const a = user().answers[q.id];
      return (quizFilter === 'all' || quizFilter === 'new' && !a || quizFilter === 'wrong' && a && !a.correct || quizFilter === 'saved' && user().bookmarks.includes(q.id)) && (quizSection === 'all' || q.section === quizSection) && (!quizQuery || normalized(q.prompt + ' ' + q.options.join(' ')).includes(normalized(quizQuery)));
    });
    const cursor = restore ? session.findIndex(q => q.id === user().cursors[chapterId]) : -1;
    position = cursor >= 0 ? cursor : 0; retryId = null;
  }
  function renderQuiz() {
    if (!session.length) { $('#quiz-area').innerHTML = `<div class="empty-state"><h4>${quizFilter === 'wrong' ? 'Không có câu cần ôn lại' : quizFilter === 'saved' ? 'Chưa có câu được đánh dấu' : 'Không có câu hỏi trong bộ lọc này'}</h4><p>${quizFilter === 'wrong' ? 'Những câu trả lời sai sẽ xuất hiện ở đây. Bạn có thể luyện tiếp các câu chưa làm.' : quizFilter === 'saved' ? 'Dùng nút Đánh dấu bên cạnh câu hỏi để lưu câu muốn xem lại.' : 'Thử bỏ từ khóa hoặc đổi phạm vi, chủ đề.'}</p><button class="button subtle" data-start-quiz="all">Xem toàn bộ câu hỏi</button></div>`; return; }
    const q = session[position], saved = user().bookmarks.includes(q.id), record = retryId === q.id ? null : user().answers[q.id];
    const sec = c().sections.find(s => s.id === q.section);
    const pages = [...new Set(q.sourcePages || [q.page])];
    $('#quiz-area').innerHTML = `<article class="quiz-card" aria-labelledby="question-title"><div class="quiz-top"><span>Câu ${position + 1} / ${session.length}${sec ? ' · ' + esc(sec.title) : ''}</span><button class="bookmark-button" aria-pressed="${saved}" data-bookmark="${q.id}" aria-label="${saved ? 'Bỏ đánh dấu câu hỏi' : 'Đánh dấu câu hỏi'}">${icon('save')} ${saved ? 'Đã đánh dấu' : 'Đánh dấu'}</button></div><h4 id="question-title" tabindex="-1">${esc(q.prompt)}</h4><div class="answers" role="group" aria-labelledby="question-title">${q.options.map((option, i) => { const correct = record && i === q.answer, wrong = record && i === record.selected && !record.correct; return `<button class="answer ${correct ? 'correct' : ''} ${wrong ? 'incorrect' : ''}" data-answer="${i}" ${record ? 'disabled' : ''}><span class="answer-letter">${'ABCD'[i]}</span><span>${esc(option)}</span>${correct ? `<span class="answer-state">Đáp án đúng ${icon('check')}</span>` : wrong ? `<span class="answer-state">Bạn đã chọn ${icon('close')}</span>` : ''}</button>`; }).join('')}</div>${record ? `<div class="feedback ${record.correct ? '' : 'wrong'}" role="status"><h5>${icon(record.correct ? 'check' : 'close')}${record.correct ? 'Chính xác' : 'Chưa đúng. Cùng xem lại.'}</h5><p>${esc(q.explanation)}</p><div class="feedback-actions">${pages.map(page => sourceReference(page)).join('')}<button data-retry="${q.id}">Trả lời lại</button></div></div>` : `<p class="reader-note">Chọn một đáp án. Kết quả và giải thích xuất hiện ngay sau khi chọn.</p>`}</article><div class="quiz-navigation"><button class="small-button" data-question-step="-1" ${position === 0 ? 'disabled' : ''}>Câu trước</button><label class="quiz-jump">Đến câu<select id="quiz-jump" aria-label="Chuyển đến câu hỏi">${session.map((question, i) => `<option value="${i}" ${i === position ? 'selected' : ''}>${i + 1}${user().answers[question.id] ? user().answers[question.id].correct ? ' ✓' : ' ×' : ''}</option>`).join('')}</select></label>${position < session.length - 1 ? `<button class="button ${record ? 'primary' : 'subtle'}" data-question-step="1">${record ? 'Câu tiếp theo' : 'Bỏ qua'} ${icon('arrow')}</button>` : '<button class="button primary" id="finish-session">Xem tiến độ</button>'}</div>`;
  }
  function moveQuestion(step) { position = Math.max(0, Math.min(session.length - 1, position + step)); retryId = null; user().cursors[chapterId] = session[position].id; persist(); renderQuiz(); $('#question-title')?.focus({ preventScroll: true }); }
  function startQuiz(filter = 'all', section = 'all') { quizFilter = filter; quizSection = section; quizQuery = ''; $('#quiz-filter').value = filter; $('#quiz-section').value = section; $('#quiz-search').value = ''; buildSession(filter === 'all' && section === 'all'); setTab('quiz'); }
  function renderMap() {
    const ch=c(), colors=['#8d3e3f','#476756','#485f78','#997b3c'];
    const focus=ch.mindmap.branches.find(b=>expanded.has(b.id));
    const layout=focus?SuDangMapLayout.focus(focus.children.length):SuDangMapLayout.overview(ch.mindmap.branches.length);
    mapHeight=layout.height;const root=layout.root,cx=root.x+root.w/2,cy=root.y+root.h/2;
    let nodes=`<button class="map-node root" style="left:${root.x}px;top:${root.y}px;width:${root.w}px;height:${root.h}px" data-map-root>${esc(ch.label)}<small>${esc(ch.period)}<br>${focus?'Về toàn chương':'Mạch kiến thức'}</small></button>`;
    let paths=`<circle cx="${cx}" cy="${cy}" r="145" fill="none" stroke="#b69a6140" stroke-width="1"/><circle cx="${cx}" cy="${cy}" r="155" fill="none" stroke="#b69a6125" stroke-width="1" stroke-dasharray="2 9"/>`;
    const branchNode=(b,box,index)=>`<button class="map-node branch" style="left:${box.x}px;top:${box.y}px;width:${box.w}px;min-height:${box.h}px;--branch-color:${colors[index%4]}" aria-expanded="${focus?.id===b.id}" data-map-branch="${esc(b.id)}">${esc(b.title)}<small>${b.children.length} ý nhỏ · tr. ${b.page}</small></button>`;
    if(focus){
      const b=layout.branch,by=b.y+b.h/2;paths+=`<path d="M${cx+100} ${cy} C340 ${cy} 340 ${by} ${b.x} ${by}" style="stroke:${colors[0]}"/>`;nodes+=branchNode(focus,b,ch.mindmap.branches.indexOf(focus));
      focus.children.forEach((n,i)=>{const box=layout.children[i],y=box.y+box.h/2;paths+=`<path d="M${b.x+b.w} ${by} C770 ${by} 780 ${y} ${box.x} ${y}" style="stroke:${colors[i%4]}"/>`;nodes+=`<button class="map-node child" style="left:${box.x}px;top:${box.y}px;width:${box.w}px;min-height:${box.h}px;border-color:${colors[i%4]}80" data-map-child="${esc(focus.id)}" data-child-index="${i}">${esc(n.title)}<small>${user().learned.includes(focus.id+'-'+i)?'Đã ghi nhớ · ':''}tr. ${n.page}</small></button>`;});
    }else{
      ch.mindmap.branches.forEach((b,i)=>{const box=layout.branches[i],y=box.y+box.h/2,left=box.side==='left',sx=left?cx-100:cx+100,ex=left?box.x+box.w:box.x,curve=left?cx-200:cx+200;paths+=`<path d="M${sx} ${cy} C${curve} ${cy} ${curve} ${y} ${ex} ${y}" style="stroke:${colors[i%4]};opacity:.7"/>`;nodes+=branchNode(b,box,i);});
    }
    $('#map-content').innerHTML=`<svg class="map-lines" width="1320" height="${mapHeight}" aria-hidden="true">${paths}</svg>${nodes}`;
    $('#map-content').style.width='1320px';$('#map-content').style.height=mapHeight+'px';
    applyMapZoom();
    if(innerWidth<760&&!mapOutline){const v=$('#map-viewport');v.scrollLeft=Math.max(0,(focus?550:cx)*mapZoom-v.clientWidth/2);v.scrollTop=Math.max(0,cy*mapZoom-v.clientHeight/2);}
    $('#map-outline').innerHTML=ch.mindmap.branches.map(b=>`<details class="map-outline-branch"><summary>${esc(b.title)}</summary><p>${esc(b.summary)} ${sourceReference(b.page)}</p><ul>${b.children.map((n,i)=>`<li><strong>${esc(n.title)}</strong><p>${esc(n.note)}</p>${sourceReference(n.page)}<label class="learned-check"><input type="checkbox" data-learned="${esc(b.id)}-${i}" ${user().learned.includes(b.id+'-'+i)?'checked':''}>Đã ghi nhớ ý này</label></li>`).join('')}</ul></details>`).join('');
    $('#map-visual').hidden=mapOutline;$('#map-outline').hidden=!mapOutline;$('#map-view').setAttribute('aria-pressed',mapOutline);$('#map-view').textContent=mapOutline?'Xem sơ đồ':'Dạng đề cương';
    let select=$('#map-topic');if(!select){select=document.createElement('select');select.id='map-topic';select.className='map-focus-select';select.setAttribute('aria-label','Chọn nhánh mindmap');$('.map-toolbar').prepend(select);}
    select.innerHTML='<option value="">Toàn bộ sơ đồ chương</option>'+ch.mindmap.branches.map(b=>`<option value="${esc(b.id)}" ${focus?.id===b.id?'selected':''}>${esc(b.title)}</option>`).join('');
  }
  function applyMapZoom(){ $('#map-scale').style.width=(1320*mapZoom)+'px';$('#map-scale').style.height=(mapHeight*mapZoom)+'px';$('#map-content').style.transform=`scale(${mapZoom})`;$('#map-zoom').value=Math.round(mapZoom*100)+'%'; }
  function showMapDetail(node,nodeId){if(!node)return;selectedNode={node,nodeId};$('#map-detail').innerHTML=`<h4>${esc(node.title)}</h4><p>${esc(node.note||node.summary||'')}</p><div class="map-detail-actions">${sourceReference(node.page||c().startPage)}${nodeId?`<label class="learned-check"><input type="checkbox" data-learned="${esc(nodeId)}" ${user().learned.includes(nodeId)?'checked':''}>Đã ghi nhớ ý này</label>`:''}</div>${node.children?`<div class="map-leaf-notes">${node.children.map((n,i)=>`<article><h5>${esc(n.title)}</h5><p>${esc(n.note)}</p>${sourceReference(n.page)}<label class="learned-check"><input type="checkbox" data-learned="${esc(node.id)}-${i}" ${user().learned.includes(node.id+'-'+i)?'checked':''}>Đã ghi nhớ ý này</label></article>`).join('')}</div>`:''}`;}
  function renderProfile() {
    pendingResetId = null; $('#reset-confirmation').hidden = true;
    const p = user(), s = P.stats(p, allQuestions);
    $('#profile-content').innerHTML = `<div class="profile-select-row"><label for="profile-select">Hồ sơ trên máy này<select id="profile-select">${state.profiles.map(pr => `<option value="${esc(pr.id)}" ${pr.id === state.active ? 'selected' : ''}>${esc(pr.name)}</option>`).join('')}</select></label><button class="button subtle" id="new-profile-toggle">Thêm người học</button></div><form id="profile-create-form" class="profile-create" hidden><label>Tên hồ sơ<input id="new-profile-name" maxlength="40" placeholder="Tên hoặc biệt danh" required autocomplete="off"></label><button class="button primary" type="submit">Tạo hồ sơ</button></form><div class="profile-metrics"><p><strong>${s.answered}<small> / ${s.total}</small></strong>Câu đã làm</p><p><strong>${s.correct}</strong>Câu trả lời đúng</p><p><strong>${s.wrong}</strong>Câu cần ôn lại</p></div>${chapters.map(ch => { const st = P.stats(p, ch.questions); return `<div class="progress-row"><div><span>${esc(ch.label)}</span><span>${st.correct} / ${st.total} câu đúng</span></div><span class="mini-track"><i style="width:${st.percent}%"></i></span><div><small>Đã làm ${st.answered} câu · Cần ôn lại ${st.wrong}</small><button data-resume-chapter="${ch.id}">Tiếp tục học</button></div></div>`; }).join('')}`;
  }
  function showProfile() { renderProfile(); $('#profile-dialog').showModal(); }
  function syncProgress() { persist(); renderChapterNav(); renderOverview(); refreshIdentity(); }
  function exportProgress() { const data = JSON.stringify({ app: 'su-dang', version: 1, exportedAt: new Date().toISOString(), profile: user() }, null, 2); const url = URL.createObjectURL(new Blob([data], { type: 'application/json' })); const link = document.createElement('a'); link.href = url; link.download = `su-dang-tien-do-${new Date().toISOString().slice(0, 10)}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast('Đã xuất tệp tiến độ của hồ sơ hiện tại.'); }
  async function importProgress(file) { if (!file) return; try { if (file.size > 2 * 1024 * 1024) throw Error('Tệp quá lớn. Hãy chọn tệp tiến độ dưới 2 MB.'); if (state.profiles.length >= 20) throw Error('Đã đạt 20 hồ sơ trên trình duyệt này.'); const p = P.importProfile(await file.text(), chapters); state.profiles.push(p); state.active = p.id; syncProgress(); selectChapter(chapterId); renderProfile(); toast('Đã nhập thành hồ sơ mới, giữ nguyên các hồ sơ cũ.'); } catch (e) { toast(e.message || 'Không đọc được tệp tiến độ.'); } finally { $('#import-progress').value = ''; } }
  document.addEventListener('click', e => {
    const b = e.target.closest('button, a'); if (!b) return;
    if (b.dataset.chapter) selectChapter(b.dataset.chapter);
    else if (b.dataset.tab) setTab(b.dataset.tab);
    else if (b.dataset.tabGo) setTab(b.dataset.tabGo);
    else if (b.dataset.startQuiz) startQuiz(b.dataset.startQuiz);
    else if (b.dataset.studySection) startQuiz('all', b.dataset.studySection);
    else if (b.dataset.answer !== undefined) { const q = session[position]; if (!q || user().answers[q.id] && retryId !== q.id) return; P.record(user(), q, Number(b.dataset.answer)); user().cursors[chapterId] = q.id; retryId = null; syncProgress(); renderQuiz(); }
    else if (b.dataset.retry) { retryId = b.dataset.retry; renderQuiz(); $('.answer')?.focus({ preventScroll: true }); }
    else if (b.dataset.bookmark) { const id = b.dataset.bookmark, arr = user().bookmarks; user().bookmarks = arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]; persist(); renderQuiz(); toast(user().bookmarks.includes(id) ? 'Đã đánh dấu câu hỏi.' : 'Đã bỏ đánh dấu.'); }
    else if (b.dataset.questionStep) moveQuestion(Number(b.dataset.questionStep));
    else if (b.dataset.mapBranch) { const id = b.dataset.mapBranch, branch = c().mindmap.branches.find(n => n.id === id); expanded.has(id) ? expanded.clear() : expanded=new Set([id]); renderMap(); showMapDetail(branch, id); }
    else if (b.dataset.mapChild) { const branch = c().mindmap.branches.find(n => n.id === b.dataset.mapChild), i = Number(b.dataset.childIndex); showMapDetail(branch.children[i], `${branch.id}-${i}`); }
    else if (b.hasAttribute('data-map-root')) {expanded.clear();renderMap();showMapDetail({ title: c().mindmap.title, summary: c().summary, page: c().startPage });}
    else if (b.dataset.resumeChapter) { $('#profile-dialog').close(); selectChapter(b.dataset.resumeChapter, routeMode); $('#hoc-tap').scrollIntoView({ behavior: 'smooth' }); }
    else if (b.dataset.journeyChapter) { selectChapter(b.dataset.journeyChapter, 'overview'); $('#hoc-tap').scrollIntoView({ behavior: 'smooth' }); }
    else if (b.id === 'new-profile-toggle') { $('#profile-create-form').hidden = !$('#profile-create-form').hidden; if (!$('#profile-create-form').hidden) $('#new-profile-name').focus(); }
    else if (b.id === 'finish-session') showProfile();
  });
  document.addEventListener('change', e => {
    const t = e.target;
    if(t.id==='map-topic'){expanded=t.value?new Set([t.value]):new Set();renderMap();showMapDetail(c().mindmap.branches.find(b=>b.id===t.value)||{title:c().mindmap.title,summary:c().summary,page:c().startPage});}
    if (t.id === 'chapter-select') selectChapter(t.value);
    if (t.id === 'quiz-filter' || t.id === 'quiz-section') { quizFilter = $('#quiz-filter').value; quizSection = $('#quiz-section').value; buildSession(); renderQuiz(); }
    if (t.id === 'quiz-jump') { position = Number(t.value); retryId = null; user().cursors[chapterId] = session[position].id; persist(); renderQuiz(); }
    if (t.dataset.learned) { const id = t.dataset.learned; user().learned = t.checked ? [...new Set([...user().learned, id])] : user().learned.filter(x => x !== id); persist(); toast(t.checked ? 'Đã ghi nhớ ý này.' : 'Đã bỏ dấu ghi nhớ.'); }
    if (t.id === 'profile-select') { state.active = t.value; syncProgress(); selectChapter(user().lastChapter || chapterId, routeMode); renderProfile(); }
    if (t.id === 'import-progress') importProgress(t.files[0]);
  });
  $('#profile-dialog').addEventListener('submit', e => { if (e.target.id !== 'profile-create-form') return; e.preventDefault(); const name = $('#new-profile-name').value.trim(); if (!name) return; if (state.profiles.length >= 20) { toast('Đã đạt 20 hồ sơ trên trình duyệt này.'); return; } const p = P.profile(name); state.profiles.push(p); state.active = p.id; syncProgress(); selectChapter(chapterId); renderProfile(); toast('Hồ sơ mới đã sẵn sàng.'); });
  $('#quiz-search').addEventListener('input', e => { quizQuery = e.target.value.trim(); buildSession(); renderQuiz(); });
  $('#profile-open').addEventListener('click', showProfile); $('#progress-open').addEventListener('click', showProfile); $('#profile-close').addEventListener('click', () => $('#profile-dialog').close());
  $('#profile-dialog').addEventListener('click', e => { if (e.target === $('#profile-dialog')) { const r = e.target.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) e.target.close(); } });
  $('#export-progress').addEventListener('click', exportProgress);
  $('#reset-progress').addEventListener('click', () => {
    pendingResetId = user().id;
    $('#reset-profile-name').textContent = user().name;
    $('#reset-confirmation').hidden = false;
    $('#reset-cancel').focus();
  });
  $('#reset-cancel').addEventListener('click', () => {
    pendingResetId = null; $('#reset-confirmation').hidden = true; $('#reset-progress').focus();
  });
  $('#reset-confirm').addEventListener('click', () => {
    if (pendingResetId !== state.active) return;
    const name = user().name;
    const next = { ...state, profiles: state.profiles.map(p => p.id === pendingResetId ? P.reset(p) : p) };
    if (!P.save(storage, next)) { toast('Chưa xóa được tiến độ. Hãy thử lại.'); return; }
    state = next;
    refreshIdentity(); selectChapter(chapterId, routeMode); renderProfile();
    $('#reset-progress').focus(); toast('Đã xóa tiến độ của ' + name + '.');
  });
  $('#map-plus').addEventListener('click', () => { mapZoom = Math.min(1.4, mapZoom + .1); applyMapZoom(); }); $('#map-minus').addEventListener('click', () => { mapZoom = Math.max(.35, mapZoom - .1); applyMapZoom(); });
  $('#map-fit').addEventListener('click', () => { mapZoom = Math.max(.25, Math.min(1, ($('#map-viewport').clientWidth - 18) / 1320)); applyMapZoom(); $('#map-viewport').scrollTo(0, 0); });
  $('#map-view').addEventListener('click', () => { mapOutline = !mapOutline; renderMap(); });
  let drag = null;
  $('#map-viewport').addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' || e.target.closest('button')) return; drag = { x: e.clientX, y: e.clientY, left: e.currentTarget.scrollLeft, top: e.currentTarget.scrollTop }; e.currentTarget.setPointerCapture(e.pointerId); e.currentTarget.classList.add('dragging'); });
  $('#map-viewport').addEventListener('pointermove', e => { if (!drag) return; e.currentTarget.scrollLeft = drag.left - e.clientX + drag.x; e.currentTarget.scrollTop = drag.top - e.clientY + drag.y; });
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) $('#map-viewport').addEventListener(event, () => { drag = null; $('#map-viewport').classList.remove('dragging'); });
  window.addEventListener('storage', e => { if (e.key !== P.KEY) return; const next = P.load(storage, chapters); if (next.warning) return; state = next.state; refreshIdentity(); selectChapter(chapterId); if ($('#profile-dialog').open) renderProfile(); toast('Đã cập nhật tiến độ từ thẻ khác.'); });
  if(routeMode==='map')$('.study-heading').append($('.mobile-chapter'));
  if(routeMode==='quiz')$('.study-canvas').append($('#review-drawer'));
  refreshIdentity(); selectChapter(params.get('chuong') || user().lastChapter || chapterId, routeMode); persist();
  if(params.get('tien-do')==='1') showProfile();
})();
