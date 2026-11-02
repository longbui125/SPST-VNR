(function(root){
  function overview(count){
    const rows=Math.ceil(count/2),height=Math.max(760,rows*132+92);
    return {width:1320,height,root:{x:560,y:height/2-100,w:200,h:200},branches:Array.from({length:count},(_,i)=>({x:i<rows?40:1000,y:52+(i%rows)*132,w:280,h:112,side:i<rows?'left':'right'}))};
  }
  function focus(count){const height=Math.max(720,count*116+80);return {width:1320,height,root:{x:50,y:height/2-100,w:200,h:200},branch:{x:415,y:height/2-64,w:270,h:128},children:Array.from({length:count},(_,i)=>({x:890,y:40+i*116,w:370,h:96}))};}
  const api={overview,focus};root.SuDangMapLayout=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
