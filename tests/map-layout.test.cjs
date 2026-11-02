const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Layout=require('../map-layout.js');
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
for(const name of ['intro','chapter1','chapter2','chapter3','conclusion']){
 const ch=JSON.parse(fs.readFileSync(path.join(__dirname,'../data',name+'.json'),'utf8'));
 const views=[Layout.overview(ch.mindmap.branches.length),...ch.mindmap.branches.map(b=>Layout.focus(b.children.length))];
 for(const view of views){const boxes=[view.root,...(view.branches||[]),...(view.branch?[view.branch]:[]),...(view.children||[])];
  for(const box of boxes)assert(box.x>=0&&box.y>=0&&box.x+box.w<=view.width&&box.y+box.h<=view.height,`${name}: clipped node`);
  boxes.forEach((a,i)=>boxes.slice(i+1).forEach(b=>assert(!overlap(a,b),`${name}: overlapping nodes`)));
 }
}
console.log('PASS: all five chapter overview and branch-focus layouts fit without node overlap.');
