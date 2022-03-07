var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("database.db");

module.exports = {
    setup: function() {
        db.run("CREATE TABLE channels (channel TEXT, region TEXT, role TEXT, last TEXT)")
    },
    getChannels: function(callback:any){
        db.all("SELECT * FROM channels", function(err:any, res:any){
            callback(res);
        });
    },
    addChannel: function(channelid:String, region:String, role:String){
        // Add a task to the todo list.
        db.run("INSERT INTO channels VALUES ($channel, $region, $role, $last)", {
            $channel: channelid,
            $region: region,
            $role: role,
            $last: '-1'
        });
    },
    removeChannel: function(channelid:string){
        // Delete the task from the todo list.
        db.run("DELETE FROM channels WHERE channel=$channel", {
            $channel: channelid
        });
    },
    updateLast: function(last:string, channel:string) {
        db.run("UPDATE channels SET last=$last WHERE channel=$channel", {
            $channel: channel,
            $last: last
        });
    }
};