var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("database.db");

module.exports = {
    setup: function() {
        db.run("CREATE TABLE channels (channel TEXT, region TEXT, role TEXT)")
    },
    getChannels: function(callback:any){
        db.all("SELECT * FROM channels", function(err:any, res:any){
            callback(res);
        });
    },
    addChannel: function(channelid:String, region:String, role:String){
        // Add a task to the todo list.
        db.run("INSERT INTO channels VALUES ($channel, $region, $role)", {
            $channel: channelid,
            $region: region,
            $role: role
        });
    },
    removeChannel: function(channelid:string){
        // Delete the task from the todo list.
        db.run("DELETE FROM channels WHERE channel=$channel", {
            $channel: channelid
        });
    }
};