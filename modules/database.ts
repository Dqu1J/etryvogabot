var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("database.db");

module.exports = {
    setup: function() {
        db.run("CREATE TABLE channels (channel TEXT, region TEXT, role TEXT, last TEXT, announced TEXT)")
    },
    getChannels: function(callback:any){
        db.all("SELECT * FROM channels", function(err:any, res:any){
            callback(res);
        });
    },
    addChannel: function(channelid:String, region:String, role:String){
        // Add a task to the todo list.
        db.run("INSERT INTO channels VALUES ($channel, $region, $role, $a, $b)", {
            $channel: channelid,
            $region: region,
            $role: role,
            $a: '-1',
            $b: ''
        });
    },
    removeChannel: function(channelid:string){
        // Delete the task from the todo list.
        db.run("DELETE FROM channels WHERE channel=$channel", {
            $channel: channelid
        });
    },
    updateLast: function(last:string, channel:string, announced:string) {
        db.run("UPDATE channels SET last=$last, announced=$announced WHERE channel=$channel", {
            $channel: channel,
            $last: last,
            $announced: announced
        });
    }
};