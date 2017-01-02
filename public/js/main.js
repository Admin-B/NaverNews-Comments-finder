var socket=io.connect("http://localhost");
var url, oid, aid, sortType="new";
var searchType=0;
var ID=undefined;

$(document).ready(function(){
	var toggle=false;

	$("#search-news-btn").bind("click",search_news);
	$(".sort-box").click(function(){
		var th=$(this);
		if(th.hasClass("active")){
			return;
		}
		sortType=th.attr("data-type");
		$(".sort-box").removeClass("active");
		th.addClass("active");
		search_news();
	});

	function getOid(str){return (str.split("oid=")[1] || "").split("&")[0] || undefined;}
	function getAid(str){return (str.split("aid=")[1] || "").split("&")[0] || undefined;}

	function search_news(){
		if(toggle){
			return;
		}
		url=$("#search-news-input").val();
		oid=getOid(url),
		aid=getAid(url);

		if(isNaN(oid) || isNaN(aid)){
			return;
		}else{
			toggle=true;
			socket.emit("getCommentsData",{'oid':oid,'aid':aid,'sortType':sortType});
		}
	}
	socket.on("sendCommentsData",function(body){
		var data=JSON.parse(body.body.substr(10,body.body.length-12));
		var commentList=data.result.commentList;
		var DOM_content_box=$(".content-box");
		DOM_content_box.html('');

		if(url.indexOf("entertain.naver.com") != -1){
			var temp="http://entertain.naver.com/comment/list";
		}else{
			var temp="http://news.naver.com/main/read.nhn";
		}
		if(commentList.length==0){
			DOM_content_box.append("<h3>검색된 댓글이 없습니다.</h3>");
		}
		if(searchType===1){
			if(ID){
				for(var i=0; i<commentList.length; i++){
					var userID=commentList[i].userIdNo;
					if(userID!=ID){
						continue;
					}
					var contents=commentList[i].contents;
					var nickname=commentList[i].maskedUserId;
					var curl=temp+"?commentNo="+commentList[i].commentNo+"&oid="+oid+"&aid="+aid;
					var date=commentList[i].regTime;

					DOM_content_box.append("<a data-index="+userID+" href='"+curl+"' target='blank'><b>"+nickname+"</b> "+date+"<br/>"+contents+"</a>");
				}	
			}else{
				for(var i=0; i<commentList.length; i++){
					var contents=commentList[i].contents;
					var nickname=commentList[i].maskedUserId;
					var userID=commentList[i].userIdNo;
					var date=commentList[i].regTime;
					var curl="#"+userID;

					DOM_content_box.append("<a data-index="+userID+" href='"+curl+"'><b>"+nickname+"</b> "+date+"<br/>"+contents+"</a>");
				}				
			}
	
		}else{
			for(var i=0; i<commentList.length; i++){
				var contents=commentList[i].contents;
				var nickname=commentList[i].maskedUserId;
				var userID=commentList[i].userIdNo;
				var curl=temp+"?commentNo="+commentList[i].commentNo+"&oid="+oid+"&aid="+aid;
				var date=commentList[i].regTime;

				DOM_content_box.append("<a data-index="+userID+" href='"+curl+"' target='blank'><b>"+nickname+"</b> "+date+"<br/>"+contents+"</a>");
			}
		}
		toggle=false;
	});

	if(searchType===1){
		applyID();
	}
});