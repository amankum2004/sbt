import {chromium, FullConfig} from '@playwright/test';
import fs, { stat } from 'fs';
import path from 'path';

const AUTH_PATH=path.join(process.cwd(),'storage','auth.json');

const Session_validity_hours = 6;
const session_ttl = Session_validity_hours*60*60*1000;

function isSessionValid():boolean{
    if(!fs.existsSync(AUTH_PATH)) return false;
    
    const stats = fs.statSync(AUTH_PATH);
    const age = Date.now()-stats.mtimeMs;
    
    return age<session_ttl;
}


export default async function globalSetup(config:FullConfig){
    if(isSessionValid()){
        console.log("auth.json still valid -> reusing session");
        return;
    }

    console.log('auth.json is missing/expired -> manual login req.');

    const browser = await chromium.launch({headless:false, slowMo:10});

    const context = await browser.newContext({ignoreHTTPSErrors:true, 
        // proxy:{
        //     server:'http://192.168.144.147:3128'
        // },
    });

    const page = await context.newPage();

    // await page.goto('http://localhost:5173/login',
    await page.goto('https://www.salonhub.co.in/login',
        {
        waitUntil:'domcontentloaded',
    });

    console.log("please login manually");
    console.log("wait until dashboard is loaded");

    await page.waitForURL(/salonhub.co.in/,{timeout:0});
    // await page.waitForURL(/localhost:5173/,{timeout:0});

    await page.waitForLoadState('networkidle');

    await context.storageState({path:AUTH_PATH});

    console.log("auth.json saved successfully");

    await browser.close();
}