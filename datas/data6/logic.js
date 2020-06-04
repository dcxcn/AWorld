[/*{
	type:'avatar',
	name:'human5',
	logic:function(){
		var cmds=[];
		var pts = [[31,31],[20,15]];
		for(var i=0;i<pts.length;i++){
			cmds.push({type:'move',
			action:i%2==0?'run':'walk_f',
			pos:pts[i]});
		}
		cmds.push({type:'play',action:'prejump',interval:1000});
		cmds.push({type:'play',action:'jump',interval:1000});
		return cmds;
}}*/];