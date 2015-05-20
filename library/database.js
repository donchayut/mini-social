module.exports = new function(){
    var db = null;
    
    this.createLogin = function(loginname, password, displayname, callbackOK, callbackError){ 
        var ifOK = function(){            
            var sql = "insert into member(loginname, password, displayname)";
            sql+= " values('"+loginname+"', '"+password+"', '"+displayname+"')";
            db.query(sql, function(err, rows, fields){
                if(err){
                    console.log(err);
                    callbackError(err.message);
                }else if(rows.length==0){
                    callbackError("Error Create new Login.");    
                }else{                
                    callbackOK(rows.insertId);                
                }
            });    
        }        
        var ifError = function(message){
            callbackError(message);
        }
        var ifDuplicate = function(){
            callbackError("login นี้ไม่สามารถใช้ได้");
        }                
        this.checkLoginDuplicate(loginname, ifOK, ifDuplicate, ifError);
    }
    this.checkLoginDuplicate = function(login, callbackOK, callbackDuplicate, callbackError){
        var sql = "select id from member where loginname = '"+login+"'";
        
        db.query(sql, function(err, rows, fields){
            if(err){
                callbackError(err.message);    
            }else if(rows.length>0){
                callbackDuplicate();    
            }else{
                callbackOK();
            }
        });
    }
    this.listHeader = function(callbackError, callbackSuccess){
        var sql = "select * from webboard_header where status = 'A' order by id desc";
        db.query(sql, function(err, rows, fields){
            if(err){
                console.log("Error listHeader");
                console.log(err);
                callbackError("Error");
            }else{
                var datas = [];
                for(var r in rows){
                    var row_data = rows[r];
                    datas.push({
                        id : row_data.id,
                        title : row_data.title
                    });    
                }
                callbackSuccess(datas);
            }
        });
    }
    this.getHeader = function(header_id, callbackOK, callbackError){
        var sql = "select * from webboard_header where id = "+header_id;
        
        db.query(sql, function(err, rows, fields){
            if(err){
                console.log(err);
                callbackError(err.message);
            }else if(rows.length==0){
                callbackError("Header No Found.");
            }else{
                var result = {
                    id : rows[0].id,
                    title : rows[0].title,
                    content : rows[0].content
                 } 
                callbackOK(result);
            }
        });
    }
    
    this.saveHeader = function(user_id, title, content, callbackOK, callbackError){
        var cleanContent = this.replaceHTML(content);
        var sql = "insert into webboard_header(title, content, status, postby_member)";
        sql+=" values('"+title+"', '"+cleanContent+"', 'A', "+user_id+")";
        
        db.query(sql, function(err, rows, fields){
            if(err){
                console.log(err);
                callbackError(err.message);    
            }else if(rows.length==0){
                callbackError("ไม่สามารถบันทึกกระทู้ที่ตั้งได้");
            }else{                
                callbackOK(rows.insertId);
            }
        });
    }
    
    this.getReply = function(header_id, callbackOK, callbackError){
        var sql = "select * from webboard_reply";
        sql+= " where header_id = "+header_id+" and status = 'A'";   
        db.query(sql, function(err, rows, fields){
            if(err){
                callbackError(err.message);    
            }else{
                var details = [];                
                for(var i=0; i<rows.length; i++){
                    details.push({
                        id : rows[i].id,
                        content : rows[i].content,
                        post_date : rows[i].post_date
                    });
                }                
                callbackOK(details);
            }
        });    
    }
    
    this.saveReply = function(user_id, header_id, content, callbackOK, callbackError){
        var cleanContent = this.replaceHTML(content);
        var sql = "insert into webboard_reply(header_id, replyby_member, content, status)";
        sql+= " values("+header_id+", "+user_id+", '"+cleanContent+"', 'A')";
        
        db.query(sql, function(err, rows, fields){
            if(err){
                callbackError(err.message);    
            }else{
                callbackOK(rows.insertId);    
            }
        });    
    }
    
    this.checkLogin = function(login, pass, callbackOK, callbackError){
        var sql = "select * from member";
        sql+= " where loginname = '"+login+"' and password = '"+pass+"'";           
        db.query(sql, function(err, rows, fields){                 
            if(err){
                console.log(err);
                callbackError(err.message);
            }else if(rows.length==0){
                callbackError("Invalid Login");    
            }else{                
                callbackOK(rows[0].id);                
            }                 
        });        
    }
    
    this.loadProfile = function(id, callbackOK, callbackError){
        var sql = "select * from member where id ="+id;
            db.query(sql, function(err, rows, fields){
                if(err){
                    console.log(err);
                    callbackError(err.message);
                }else if(rows.length==0){
                    callbackError("Member Profile not found.");
                }else{
                    var result = {
                        id : rows[0].id,
                        loginname : rows[0].loginname,
                        displayname : rows[0].displayname
                    }
                    callbackOK(result);
                }
            });
    }
    
    this.init = function(){
        var mysql = require("mysql");        
        db = mysql.createConnection({
            host     : "localhost",
			user     : "root",
			password : "",
			database : "minisocial"
        });
        db.connect(function(err){
            if(err){
                console.log("Error Connect DB.");
                console.log(err);
            }else{
                console.log("Connect DB Success.");    
            }
        });        
    
    }
    this.replaceHTML = function(data){    
        var result = data;
        result = result.replace(/</g,"&lt");
        result = result.replace(/>/g,"&gt");
        result = result.replace(/(?:\r\n|\r|\n)/g, "<br />");
        return result;
    }
}