var Imap = require("imap");
var MailParser = require("mailparser").MailParser;
var Promise = require("bluebird");
Promise.longStackTraces();
var catchme;
var parser = new MailParser();
var imapConfig = {
  user: 'fwxlz1rpi@vivaldi.net',
  password: 'Imbx34nV6NpC',
  host: 'imap.vivaldi.net',
  port: 993,
  tls: true
};
var imap = new Imap(imapConfig);



function execute() {
    imap.openBox("INBOX", false, function(err, mailBox) {
        if (err) {
            console.error(err);
            return;
        }
        imap.search(["UNSEEN"], function(err, results) {
            if(!results || !results.length){console.log("[email-utils.js] No unread mails");imap.end();return;}
        
            imap.setFlags(results, ['\\Seen'], function(err) {
                if (!err) {
                    console.log("[email-utils.js] marked as read");
                } else {
                    console.log(JSON.stringify(err, null, 2));
                }
            });

            var f = imap.fetch(results, { bodies: "" });
            f.on("message", processMessage);
            f.once("error", function(err) {
                return Promise.reject(err);
            });
            f.once("end", function() {
                console.log("[email-utils.js] Done fetching all unseen messages.");
                imap.end();
            });
        });
    });
}
function processMessage(msg, seqno) {
    console.log("[email-utils.js] Processing msg #" + seqno);
    parser.on("headers", function(headers) {
        console.log("[email-utils.js] Header: " + JSON.stringify(headers));
    });

    parser.on('data', data => {
        if (data.type === 'text') {
            catchme+=data.html;
        }
     });

    msg.on("body", function(stream) {
        stream.on("data", function(chunk) {
            parser.write(chunk.toString("utf8"));
        });
    });
    msg.once("end", function() {
        parser.end();
    });

}

exports.getMessages = function(callback){
  Promise.promisifyAll(imap);

  imap.once("ready", execute);
  imap.once("error", function(err) {
      log.error("Connection error: " + err.stack);
  });
  imap.connect();
  parser.on("end",function(){
    console.log('[email-utils.js] Done, passing email');
    callback(catchme);
  });
}
