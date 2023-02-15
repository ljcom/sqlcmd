//SQLCMD
//PARAMETERS: 
//  -U:user -P:pwd -S:server -D:database -E integrated security -N encrypt -C trust certificate -q query -i input file
//node index -S:localhost,1433 -U:sa -P:SA_Passw0rd -D:master -C -N -q:selet name from sys.databases
//node index -S:localhost,1433 -U:sa -P:SA_Passw0rd -D:master -C -N -i:./filldata.sql

const sql = require('mssql');
var fs = require('fs');
var path = require('path');
const readline = require("readline");
const { isContext } = require('vm');


var args = process.argv.slice(2);   //args -U:user -P:pwd -S:server -D:database -E -N -C -q -i
var output='';
var u='',p='',s='',d='',e='',n='',c='';
var constr;
var retry=10;

async function run() {
    var q,i;
    var lastcmd;
    const sqlConfig = {
        //user: process.env.DB_USER,
        //password: process.env.DB_PWD,
        //database: process.env.DB_NAME,
        //server: 'localhost',
        requestTimeout:150000,
        pool: {
          max: 10,
          min: 0,
          idleTimeoutMillis: 30000
        },
        options: {
          //encrypt: true, // for azure
          //trustServerCertificate: false // change to true for local dev / self-signed certs
        }
      }
    for(a of args) {
        var ax=a.split(':');
        if(ax[0]=='-U') {u='User Id='+ax[1]+';'; sqlConfig.user=ax[1];lastcmd=ax[0];} //userid
        else if(ax[0]=='-P') {p='Password='+ax[1]+';'; sqlConfig.password=ax[1]; lastcmd=ax[0];}    //pwd
        else if(ax[0]=='-S') {s='Server='+ax[1]+';'; 
            sqlConfig.server=ax[1]; 
            //sqlConfig.port=1433;
            lastcmd=ax[0];}//server
        else if(ax[0]=='-D') {
            d='Database='+ax[1]+';'; 
            sqlConfig.database=ax[1]; 
            lastcmd=ax[0];}//database
        else if(ax[0]=='-E') {e='Integrated Security=true;'; lastcmd=ax[0];}//trust connection
        else if(ax[0]=='-N') {n='Encrypt=true;'; 
            sqlConfig.options.encrypt=true; 
            lastcmd=ax[0];}//encrypt
        else if(ax[0]=='-C') {c='trustServerCertificate=true;Connection Timeout=300;Command Timeout=120;'; 
            sqlConfig.options.trustServerCertificate=true;
            lastcmd=ax[0];} //trust server certification
        else if(ax[0]=='-q') {q=ax[1]; lastcmd=ax[0];}  //query
        else if(ax[0]=='-i') {i=ax[1]; lastcmd=ax[0];}  //input
        else if(ax[0]=='-o') {output=ax[1]; lastcmd=ax[0];}  //output

        // if(ax[0]=='-U') {u='User Id='+ax[1]+';'; lastcmd=ax[0];} //userid
        // else if(ax[0]=='-P') {p='Password='+ax[1]+';'; lastcmd=ax[0];}    //pwd
        // else if(ax[0]=='-S') {s='Server='+ax[1]+';'; lastcmd=ax[0];}//server
        // else if(ax[0]=='-D') {d='Database='+ax[1]+';'; lastcmd=ax[0];}//database
        // else if(ax[0]=='-E') {e='Integrated Security=true;'; lastcmd=ax[0];}//trust connection
        // else if(ax[0]=='-N') {n='Encrypt=true;'; lastcmd=ax[0];}//encrypt
        // else if(ax[0]=='-C') {c='trustServerCertificate=true;Connection Timeout=300;Command Timeout=120;'; lastcmd=ax[0];} //trust server certification
        // else if(ax[0]=='-q') {q=ax[1]; lastcmd=ax[0];}  //query
        // else if(ax[0]=='-i') {i=ax[1]; lastcmd=ax[0];}  //input
        // else if(ax[0]=='-o') {output=ax[1]; lastcmd=ax[0];}  //output
        else {
            if(lastcmd=='-q') q+=' '+ax[0];            
            if(lastcmd=='-i') i+=' '+ax[0];
            if(lastcmd=='-o') output=' '+ax[0];
        }
    }
    constr=s+u+p+d+c+n;
    establishConnection(q,i, sqlConfig);
}
async function establishConnection(q,i,sqlConfig) {
    try{
    console.log('Try to connect: '+constr);
    //await sql.connect(constr);
    await sql.connect(sqlConfig);
    mainRoutine(q,i);
    } catch(err) {
        console.error(err);
        retry--;
       // I suggest using some variable to avoid the infinite loop.
        if(retry>=0) setTimeout(function(){establishConnection(q,i,sqlConfig);}, 5000);
        else process.exit();
   }
};

async function mainRoutine(q,i) {
    if(q!=undefined) {
        //const result = await sql.query(`${q}`);
        //showRecordset(result);
        runquery(q);
    }
    if(i!=undefined) {
        result=await processFile(i);
        //runquery(result);
        showRecordset(result);
        // console.log('x');
    }
    interactiveLoop();

}
async function runquery(script) {
    try {
        const result = await sql.query(script);
        showRecordset(result);
    } catch (err) {
        // ... error checks
        writeLog(err.message);
    }

}

function showRecordset(r) {
    var hasheader=false;
    if(r.recordsets!=undefined && r.recordsets.length>0) {
        writeLog('Results:\n');

        for(i of r.recordsets) {
            hasheader=false;
            header='';
            for(ix of i) {
                line='';    
                var header='', line='';
                for(j of Object.entries(ix)) {
                    if(!hasheader) {
                        header+=j[0]+'\t';
                    }
                    line+=j[1]+'\t';
                }
                if(!hasheader) {
                    writeLog(header);
                    writeLog('-'.repeat(header.length));
                    hasheader=true;
                }
                writeLog(line);
            }
            writeLog('\n');
        }  
    }
}

async function processFile(filePath) {
    var data=fs.readFileSync(path.join(__dirname, filePath));//, {encoding: 'utf-8'}, function(err,data){
    writeLog('loading '+filePath);
    //if (!err) {
    //console.log('received data: ' + data);
    return await sql.query(data.toString());

    // } else {
    //     console.log(err);
    // }
    //});
}

function writeLog(txt, noshow) {
    if(output!=undefined && output!='') {
        var pathx=path.join(__dirname, output);
        fs.appendFileSync(pathx, txt+'\r');//, function (err) {
            if (!noshow && txt!=undefined) console.log(txt);
    } else {
        console.log(txt);
    }
};

function prompt(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}

async function interactiveLoop() {
    var script='';
    while(true) {
        var r=await prompt('>');
        if(r.toString().toLowerCase()=='go') {
            await runquery(script);
            //var result=await sql.query(script);
            //await showRecordset(result);
            script='';
        } else if(r.toString().toLowerCase()=='exit') {
            process.exit();
        } else {
            script+=r+'\n';
        }
    }
}

///FINALLY

run();
