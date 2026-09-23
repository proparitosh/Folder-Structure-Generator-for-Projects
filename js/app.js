(function(){
  "use strict";

  const FOLDER_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"></path></svg>';
  const ICONS = {
    rename:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>',
    add:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"></path></svg>',
    del:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path></svg>',
    up:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"></path></svg>',
    down:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12l7 7 7-7"></path></svg>'
  };

  let idCounter = 1;
  const uid = () => 'n' + (idCounter++);

  function mk(name, children){
    return { id: uid(), name: name, open: true, children: children || [] };
  }
  function fromLines(spec){
    // spec: array of {name, children:[names...]}
    return spec.map(item => mk(item.name, (item.children||[]).map(c => mk(c))));
  }

  const TEMPLATES = {
    "Video Editing": fromLines([
      {name:"01_RAW", children:["VIDEO","AUDIO","PHOTOS"]},
      {name:"02_PROJECT"},
      {name:"03_ASSETS", children:["GRAPHICS","MUSIC","SFX","FONTS"]},
      {name:"04_EXPORTS"},
      {name:"05_REVISIONS"},
      {name:"06_FINAL"}
    ]),
    "YouTube": fromLines([
      {name:"01_IDEAS"},
      {name:"02_PROJECTS"},
      {name:"03_RAW", children:["VIDEO","AUDIO","SCREEN_RECORDINGS"]},
      {name:"04_ASSETS", children:["THUMBNAILS","GRAPHICS","MUSIC","SFX"]},
      {name:"05_EXPORTS"},
      {name:"06_PUBLISHED"}
    ]),
    "Photography": fromLines([
      {name:"01_RAW", children:["CAMERA_A","CAMERA_B"]},
      {name:"02_SELECTS"},
      {name:"03_EDITED"},
      {name:"04_EXPORTS", children:["WEB","PRINT"]},
      {name:"05_DELIVERED"}
    ]),
    "Podcast": fromLines([
      {name:"01_RECORDINGS", children:["HOST","GUEST"]},
      {name:"02_PROJECT"},
      {name:"03_MUSIC"},
      {name:"04_SFX"},
      {name:"05_ARTWORK"},
      {name:"06_EXPORTS"},
      {name:"07_PUBLISHED"}
    ]),
    "Freelance": fromLines([
      {name:"01_BRIEF"},{name:"02_CONTRACT"},{name:"03_ASSETS"},
      {name:"04_WORKING"},{name:"05_REVISIONS"},{name:"06_FINAL"},{name:"07_INVOICES"}
    ]),
    "Web Development": fromLines([
      {name:"01_PROJECT"},{name:"02_DESIGN"},{name:"03_ASSETS"},
      {name:"04_SOURCE"},{name:"05_TESTING"},{name:"06_DOCUMENTATION"},{name:"07_RELEASE"}
    ]),
    "Software": fromLines([
      {name:"01_SOURCE"},{name:"02_DOCUMENTATION"},{name:"03_DESIGN"},
      {name:"04_TESTS"},{name:"05_BUILDS"},{name:"06_RELEASES"}
    ]),
    "Music": fromLines([
      {name:"01_RECORDINGS"},{name:"02_PROJECT"},
      {name:"03_AUDIO", children:["VOCALS","INSTRUMENTS","DRUMS"]},
      {name:"04_MIDI"},{name:"05_SAMPLES"},{name:"06_MIX"},{name:"07_MASTER"},{name:"08_EXPORTS"}
    ]),
    "College": fromLines([
      {name:"01_RESEARCH"},{name:"02_NOTES"},{name:"03_DATA"},
      {name:"04_DRAFTS"},{name:"05_ASSETS"},{name:"06_FINAL"},{name:"07_REFERENCES"}
    ]),
    "Business": fromLines([
      {name:"01_DOCUMENTS"},{name:"02_DATA"},{name:"03_ASSETS"},
      {name:"04_WORKING"},{name:"05_REPORTS"},{name:"06_FINAL"}
    ]),
    "Blank": fromLines([{name:"PROJECT"}])
  };
  const TEMPLATE_NAMES = Object.keys(TEMPLATES);

  let tree = JSON.parse(JSON.stringify(TEMPLATES["Video Editing"]));
  let activeTemplate = "Video Editing";

  const treeEl = document.getElementById('tree');
  const tplListEl = document.getElementById('tplList');
  const tplMobile = document.getElementById('tplSelectMobile');
  const autoNumberEl = document.getElementById('autoNumber');
  const projectNameEl = document.getElementById('projectName');
  const modalRoot = document.getElementById('modalRoot');

  function cloneWithIds(nodes){
    return nodes.map(n => ({ id: uid(), name: n.name, open: n.open !== false, children: cloneWithIds(n.children||[]) }));
  }

  function findNode(nodes, id, parent){
    for(let i=0;i<nodes.length;i++){
      if(nodes[i].id === id) return {node:nodes[i], list:nodes, index:i, parent};
      const found = findNode(nodes[i].children, id, nodes[i]);
      if(found) return found;
    }
    return null;
  }

  function renderTemplateList(){
    tplListEl.innerHTML = '';
    tplMobile.innerHTML = '';
    TEMPLATE_NAMES.forEach(name => {
      const b = document.createElement('button');
      b.textContent = name;
      if(name === activeTemplate) b.classList.add('active');
      b.onclick = () => loadTemplate(name);
      tplListEl.appendChild(b);

      const opt = document.createElement('option');
      opt.value = name; opt.textContent = name;
      if(name === activeTemplate) opt.selected = true;
      tplMobile.appendChild(opt);
    });
  }
  tplMobile.onchange = (e) => loadTemplate(e.target.value);

  function loadTemplate(name){
    activeTemplate = name;
    tree = cloneWithIds(TEMPLATES[name]);
    if(name !== "Blank") projectNameEl.value = name.replace(/\s+/g,' ') + " Project";
    renderTemplateList();
    renderTree();
  }

  function numberedName(name, index, useAuto){
    if(!useAuto) return name;
    const stripped = name.replace(/^\d+_?/, '');
    const num = String(index+1).padStart(2,'0');
    return num + '_' + stripped;
  }

  function renderTree(){
    treeEl.innerHTML = '';
    const auto = autoNumberEl.checked;
    treeEl.appendChild(renderLevel(tree, auto, 0));
  }

  function renderLevel(nodes, auto, depth){
    const wrap = document.createElement('div');
    nodes.forEach((node, i) => {
      const nodeWrap = document.createElement('div');
      nodeWrap.className = 'node';

      const row = document.createElement('div');
      row.className = 'node-row';

      const caret = document.createElement('span');
      caret.className = 'caret';
      caret.textContent = node.children.length ? (node.open ? '▾' : '▸') : '';
      caret.onclick = () => { node.open = !node.open; renderTree(); };
      row.appendChild(caret);

      const icon = document.createElement('span');
      icon.className = 'folder-icon';
      icon.innerHTML = FOLDER_SVG;
      row.appendChild(icon);

      const nameSpan = document.createElement('span');
      nameSpan.className = 'name';
      nameSpan.textContent = depth === 0 && nodes === tree ? numberedName(node.name, i, auto) : (depth === 0 ? numberedName(node.name,i,auto) : (auto ? numberedName(node.name, i, true) : node.name));
      row.appendChild(nameSpan);

      const ctrls = document.createElement('span');
      ctrls.className = 'ctrls';

      const upBtn = document.createElement('button'); upBtn.innerHTML = ICONS.up; upBtn.title='Move up';
      upBtn.onclick = () => { if(i>0){ [nodes[i-1],nodes[i]] = [nodes[i],nodes[i-1]]; renderTree(); } };
      const downBtn = document.createElement('button'); downBtn.innerHTML = ICONS.down; downBtn.title='Move down';
      downBtn.onclick = () => { if(i<nodes.length-1){ [nodes[i+1],nodes[i]] = [nodes[i],nodes[i+1]]; renderTree(); } };
      const renameBtn = document.createElement('button'); renameBtn.innerHTML = ICONS.rename; renameBtn.title='Rename';
      renameBtn.onclick = () => startRename(node, row, nameSpan);
      const addBtn = document.createElement('button'); addBtn.innerHTML = ICONS.add; addBtn.title='Add child';
      addBtn.onclick = () => { node.children.push(mk('NEW_FOLDER')); node.open = true; renderTree(); };
      const delBtn = document.createElement('button'); delBtn.innerHTML = ICONS.del; delBtn.title='Delete';
      delBtn.onclick = () => { if(confirm('Delete "'+node.name+'" and everything inside it?')){ nodes.splice(i,1); renderTree(); } };

      ctrls.append(upBtn, downBtn, renameBtn, addBtn, delBtn);
      row.appendChild(ctrls);
      nodeWrap.appendChild(row);

      if(node.children.length && node.open){
        const childWrap = document.createElement('div');
        childWrap.className = 'children';
        childWrap.appendChild(renderLevel(node.children, auto, depth+1));
        nodeWrap.appendChild(childWrap);
      }
      wrap.appendChild(nodeWrap);
    });
    return wrap;
  }

  function startRename(node, row, nameSpan){
    const input = document.createElement('input');
    input.className = 'rename-input';
    input.value = node.name;
    row.replaceChild(input, nameSpan);
    input.focus();
    input.select();
    function commit(){
      node.name = input.value.trim() || node.name;
      renderTree();
    }
    input.onblur = commit;
    input.onkeydown = (e) => { if(e.key==='Enter') commit(); if(e.key==='Escape') renderTree(); };
  }

  autoNumberEl.onchange = renderTree;

  // Add folder dialog
  document.getElementById('addFolderBtn').onclick = () => {
    const flat = [];
    (function walk(nodes, prefix){
      flat.push({id:null, label: prefix + '(top level)'});
      nodes.forEach(n => {
        flat.push({id:n.id, label: prefix + n.name});
        walk(n.children, prefix + '— ');
      });
    })(tree, '');

    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML = `
      <div class="dialog">
        <h3>Add folder</h3>
        <label>Folder name</label>
        <input type="text" id="newFolderName" value="NEW_FOLDER">
        <label>Parent</label>
        <select id="newFolderParent"></select>
        <div class="dialog-actions">
          <button class="btn-ghost" id="cancelAdd">Cancel</button>
          <button class="btn-primary" id="confirmAdd">Add</button>
        </div>
      </div>`;
    modalRoot.appendChild(overlay);
    const sel = overlay.querySelector('#newFolderParent');
    flat.forEach(f => {
      const opt = document.createElement('option');
      opt.value = f.id || '';
      opt.textContent = f.label;
      sel.appendChild(opt);
    });
    overlay.querySelector('#cancelAdd').onclick = () => overlay.remove();
    overlay.querySelector('#confirmAdd').onclick = () => {
      const name = overlay.querySelector('#newFolderName').value.trim() || 'NEW_FOLDER';
      const parentId = sel.value;
      const newNode = mk(name);
      if(!parentId){ tree.push(newNode); }
      else {
        const found = findNode(tree, parentId, null);
        if(found){ found.node.children.push(newNode); found.node.open = true; }
      }
      overlay.remove();
      renderTree();
    };
  };

  document.getElementById('resetBtn').onclick = () => {
    if(confirm('Reset the folder structure? This will discard your changes.')){
      loadTemplate("Blank");
      projectNameEl.value = 'My Project';
    }
  };

  // ZIP generation, preserving structure incl. empty folders
  document.getElementById('downloadBtn').onclick = async () => {
    const auto = autoNumberEl.checked;
    const zip = new JSZip();
    const projName = (projectNameEl.value.trim() || 'My Project');

    function addNodes(nodes, zipFolder){
      nodes.forEach((n, i) => {
        const fname = numberedName(n.name, i, auto).replace(/[\\/:*?"<>|]/g, '_') || 'folder';
        const f = zipFolder.folder(fname);
        if(n.children.length){
          addNodes(n.children, f);
        }
      });
    }
    addNodes(tree, zip);

    const blob = await zip.generateAsync({type:'blob'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = projName.replace(/\s+/g,'_').replace(/[\\/:*?"<>|]/g,'') + '.zip';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  renderTemplateList();
  renderTree();
})();
