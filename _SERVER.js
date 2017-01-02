var cheerio = require("cheerio");
var request = require("request");

var express = require("express");
var fs      = require("fs");

var app     = express();
app.use(express.static('public'));
var HTTP_SERVER = app.listen(80,function(){
	console.log("서버에 정상적으로 접속 하였습니다.\n");
});

var io  = require("socket.io").listen(HTTP_SERVER);
var gSocket;

io.sockets.on('connection',function(socket){
	gSocket=socket;
	OnSocket();
});


app.get("/:TYPE",function(request,response){
	var TYPE=request.params.TYPE;
	if(TYPE=="user"){
		fs.readFile(__dirname+'/public/search_user.html',function(err, data){
			response.writeHead(200,{'Content-Type':'text/html'});
			response.end(data);
		});	
		return;
	}
	fs.readFile(__dirname+'/public/index.html',function(err, data){
		response.writeHead(200,{'Content-Type':'text/html'});
		response.end(data);
	});	
});



var List=[];

function getOid(str){return (str.split("oid=")[1] || "").split("&")[0] || undefined;}
function getAid(str){return (str.split("aid=")[1] || "").split("&")[0] || undefined;}


function OnSocket(){
	function getCommentsData_by_url(url,sortType){
		var oid=getOid(url);
		var aid=getAid(url);

		getCommentsData_by_id(oid,aid,sortType);
	}

	function getCommentsData_by_id(oid,aid,sortType){
		if(isNaN(oid) || isNaN(aid)){
			return;
		}

		if(sortType != "new" && sortType!="favorite"){
			sortType="new";
		}

		var url="https://apis.naver.com/commentBox/cbox/web_naver_list_jsonp.json?ticket=news&templateId=default_politics&pool=cbox5&lang=ko&country=KR&objectId=news"+oid+"%2C"+aid+"&categoryId=&pageSize=10000&indexSize=10&groupId=&page=1&initialize=true&userType=&useAltSort=true&replyPageSize=20&moveTo=&sort="+sortType
		var option={
			'url':url,
			'headers':{
				'Referer':url
			}
		};
		request(option,function(err,response,body){
			if(err){
				throw err;
			}
			gSocket.emit("sendCommentsData",{'body':body});
		});
	}

	gSocket.on("getCommentsData",function(data){
		getCommentsData_by_id(data.oid, data.aid,data.sortType);
	});

}