// ==UserScript==
// @name         TPT Best Chat
// @version      1.0
// @description  Script to change how the chat is handled
// @author       Bobby
// @namespace    https://github.com/BobbyFischa/BobbyFischa.github.io
// @include http://www.tpt-revised.co.uk/*
// ==/UserScript==

/*
User Manual

This script will parse the old chat and sort the messages into public, clan, trade, and global chats.

Every time you change channels, the chat history of the tabs will be deleted to prevent using too much memory,
but it won't delete the chat history if you stay in the same chat channel.

Clicking either the Public, Clan, or Trade channels will also change the dropdown menu value for the channel selection.

Change Chat Limit:
Enter a number between 10-50 into the text box, and click the "New Chat Limit" button to increase/decrease
the # of total lines shown in the chat.

Change Font Size: +/- increase/decrease the size of the fonts

Change Colors of Elements:
Select an element in the dropdown, then select a color using the color palette.

Reset:
Resets all elements to their defaults, including font size, colors, chat history, chat limits, and current channel.
*/

var chat = function(){
    let data;

    let getOldChatID = 0;
    let oldChatNode = null;
    let chatChannelSelect = null;
    let newChatNode = document.createElement("div");

    let chatButtons = document.createElement("div");
    let publicBtn = document.createElement("button");
    let tradeBtn = document.createElement("button");
    let globalBtn = document.createElement("button");
    let allBtn = document.createElement("button");
    let clanBtn = document.createElement("button");
    let limitInput = document.createElement("input");
    let limitBtn = document.createElement("button");
    let limitCurrent = document.createTextNode(" Current: ");
    let resetBtn = document.createElement("button");
    let fontUpBtn = document.createElement("button");
    let fontDnBtn = document.createElement("button");
    let colorPicker = document.createElement("input");
    let colorDropDn = document.createElement("button");
    let colorSelect = document.createElement("select");

    function saveTPTData(){
        if(typeof(Storage) !== "undefined")
            localStorage.setItem("TPTsaveData", JSON.stringify(data));
    }

    function loadData(){
        //localStorage.removeItem("TPTsaveData"); // Use to remove the item when changes to the data object are made
        if(typeof(Storage) !== "undefined" && localStorage.getItem("TPTsaveData") !== null){
            data = JSON.parse(localStorage.getItem("TPTsaveData"));
        }
        else{
            data = { // Default values
                public: [],
                trade: [],
                global: [],
                clan: [],
                all: [],

                publicColor: "green",
                tradeColor: "red",
                globalColor: "red",
                allColor: "red",
                clanColor: "red",

                selectChat: 0,
                chatLim: 25,
                fontSize: 15,
                chatChannelNum: 0,

                tradeChatColor: "#00FF00", // lime
                globalChatColor: "#1E90FF", // dodgerblue
                clanChatColor: "#FF8C00", // dark orange
                PMToChatColor: "#008000", // green
                PMFromChatColor: "#008000",
                chatLine1Color: "#000000", // black
                chatLine2Color: "#1F1F1F" // very dark grey
            };

            localStorage.setItem("TPTsaveData", JSON.stringify(data));
        }
    }

    function setFontSize(ftSize){
        data.fontSize = ftSize;
        saveTPTData();
        changeChatLimits(data.chatLim);
    }

    function getColorFromColorSelect(){
        let sel = colorSelect.value;
        if(sel === "Global")  return data.globalChatColor;
        if(sel === "Clan")    return data.clanChatColor;
        if(sel === "Trade")   return data.tradeChatColor;
        if(sel === "PM TO")   return data.PMToChatColor;
        if(sel === "PM FROM") return data.PMFromChatColor;
        if(sel === "Line 1")  return data.chatLine1Color;
        if(sel === "Line 2")  return data.chatLine1Color;
    }

    function setupBtns(){
        globalBtn.innerHTML = "Globals";
        tradeBtn.innerHTML = "Trade";
        publicBtn.innerHTML = "Public";
        clanBtn.innerHTML = "Clan";
        allBtn.innerHTML = "All";
        limitBtn.innerHTML = "New Chat Limit";
        resetBtn.innerHTML = "Reset";
        fontUpBtn.innerHTML = "FtS+";
        fontDnBtn.innerHTML = "FtS-";
        limitCurrent.nodeValue = " Current: " + data.chatLim;

        chatButtons.id = "newChatBtns";
        newChatNode.id = "newChat";
        limitBtn.id = "limitBtn";

        globalBtn.style.color = data.globalColor;
        tradeBtn.style.color = data.tradeColor;
        publicBtn.style.color = data.publicColor;
        allBtn.style.color = data.allColor;
        clanBtn.style.color = data.clanColor;
        resetBtn.style.color = "red";

        limitInput.setAttribute("type", "text");
        limitInput.setAttribute("id", "inputLimit");
        limitInput.setAttribute("name", "inputLimit");
        limitInput.setAttribute("size", "3");
        colorPicker.setAttribute("type", "color");

        colorSelect.options.add(new Option("Global"));
        colorSelect.options.add(new Option("Trade"));
        colorSelect.options.add(new Option("Clan"));
        colorSelect.options.add(new Option("PM TO"));
        colorSelect.options.add(new Option("PM FROM"));
        colorSelect.options.add(new Option("Line 1"));
        colorSelect.options.add(new Option("Line 2"));

        let frag = document.createDocumentFragment();
        frag.appendChild(colorSelect);

        chatButtons.appendChild(publicBtn);
        chatButtons.appendChild(clanBtn);
        chatButtons.appendChild(tradeBtn);
        chatButtons.appendChild(globalBtn);
        chatButtons.appendChild(allBtn);
        chatButtons.appendChild(document.createTextNode("\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"));
        chatButtons.appendChild(limitInput);
        chatButtons.appendChild(limitBtn);
        chatButtons.appendChild(limitCurrent);
        chatButtons.appendChild(document.createTextNode("\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"));
        chatButtons.appendChild(resetBtn);
        chatButtons.appendChild(document.createTextNode("\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"));
        chatButtons.appendChild(fontUpBtn);
        chatButtons.appendChild(fontDnBtn);
        chatButtons.appendChild(document.createTextNode("\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"));
        chatButtons.appendChild(colorPicker);
        chatButtons.appendChild(frag);

        colorPicker.value = getColorFromColorSelect();

        colorSelect.addEventListener("input", function() {
            if(colorSelect.value === "Global")  colorPicker.value = data.globalChatColor;
            else if(colorSelect.value === "Clan")    colorPicker.value = data.clanChatColor;
            else if(colorSelect.value === "Trade")   colorPicker.value = data.tradeChatColor;
            else if(colorSelect.value === "PM TO")   colorPicker.value = data.PMToChatColor;
            else if(colorSelect.value === "PM FROM") colorPicker.value = data.PMFromChatColor;
            else if(colorSelect.value === "Line 1")  colorPicker.value = data.chatLine1Color;
            else if(colorSelect.value === "Line 2")  colorPicker.value = data.chatLine2Color;
        });

        colorPicker.addEventListener("input", function() {
            if(colorSelect.value === "Global")  data.globalChatColor = colorPicker.value;
            else if(colorSelect.value === "Clan")    data.clanChatColor = colorPicker.value;
            else if(colorSelect.value === "Trade")   data.tradeChatColor = colorPicker.value;
            else if(colorSelect.value === "PM TO")   data.PMToChatColor = colorPicker.value;
            else if(colorSelect.value === "PM FROM") data.PMFromChatColor = colorPicker.value;
            else if(colorSelect.value === "Line 1")  data.chatLine1Color = colorPicker.value;
            else if(colorSelect.value === "Line 2")  data.chatLine2Color = colorPicker.value;

            changeChatLimits(data.chatLim); // Reset chats
            parseChat(null);
        }, false);

        fontUpBtn.addEventListener("click", function(){
            if(data.fontSize < 30) setFontSize(data.fontSize + 1);
        });

        fontDnBtn.addEventListener("click", function(){
            if(data.fontSize > 10) setFontSize(data.fontSize - 1);
        });

        resetBtn.addEventListener("click", function(){
            if(confirm("Will reset colors, font size, chat limits, and tabs, continue?")) resetChat();
        });

        limitBtn.addEventListener("click", function(){
            let node = document.getElementById("inputLimit");

            if(node !== null){
                let numb = limitInput.value.match(/\d/g);
                limitInput.value = ""; // Clear chat box
                numb = (numb === null) ? null : numb.join("");

                if(numb === null || numb.length > 3 || numb.length < 1){
                    alert("Invalid input. Enter a number between 10 and 50");
                    return;
                }
                let num = parseInt(numb);

                if(!num || num < 10 || num > 50){
                    alert("Invalid input. Enter a number between 10 and 50");
                    return;
                }

                if(confirm("Set chat size limit to: " + num + "?")) changeChatLimits(num);
            }
        });

        clanBtn.addEventListener("click", function(){
            data.allColor = allBtn.style.color = data.globalColor = globalBtn.style.color =
                data.tradeColor = tradeBtn.style.color = data.publicColor = publicBtn.style.color = "red";
            data.clanColor = clanBtn.style.color = "green";
            data.selectChat = 4;
            chatChannelSelect.value = 1;
            saveTPTData();
            changeChatLimits(data.chatLim);
        });

        allBtn.addEventListener("click", function(){
            data.tradeColor = tradeBtn.style.color = data.globalColor = globalBtn.style.color =
                data.publicColor = publicBtn.style.color = data.clanColor = clanBtn.style.color = "red";
            data.allColor = allBtn.style.color = "green";
            data.selectChat = 3;
            chatChannelSelect.value = 0;
            saveTPTData();
            changeChatLimits(data.chatLim);
        });

        globalBtn.addEventListener("click", function(){
            data.allColor = allBtn.style.color = data.tradeColor = tradeBtn.style.color =
                data.publicColor = publicBtn.style.color = data.clanColor = clanBtn.style.color = "red";
            data.globalColor = globalBtn.style.color = "green";
            data.selectChat = 2;
            chatChannelSelect.value = 0;
            saveTPTData();
            changeChatLimits(data.chatLim);
        });

        tradeBtn.addEventListener("click", function(){
            data.allColor = allBtn.style.color = data.globalColor = globalBtn.style.color =
                data.publicColor = publicBtn.style.color = data.clanColor = clanBtn.style.color = "red";
            data.tradeColor = tradeBtn.style.color = "green";
            data.selectChat = 1;
            chatChannelSelect.value = 2;
            saveTPTData();
            changeChatLimits(data.chatLim);
        });

        publicBtn.addEventListener("click", function(){
            data.allColor = allBtn.style.color = data.globalColor = globalBtn.style.color =
                data.tradeColor = tradeBtn.style.color = data.clanColor = clanBtn.style.color = "red";
            data.publicColor = publicBtn.style.color = "green";
            data.selectChat = 0;
            chatChannelSelect.value = 0;
            saveTPTData();
            changeChatLimits(data.chatLim);
        });
    }

    function changeChatLimits(newLimit){
        data.chatLim = newLimit;
        limitCurrent.nodeValue = " Current: " + data.chatLim;

        // Delete old chats
        data.public = [];
        data.global = [];
        data.trade = [];
        data.clan = [];
        data.all = [];
        saveTPTData();
        parseChat(null);
    }

    function resetChat(){
        localStorage.removeItem("TPTsaveData"); // Reset the data object
        loadData();

        allBtn.style.color = tradeBtn.style.color = globalBtn.style.color = clanBtn.style.color = "red";
        publicBtn.style.color = "green";
        colorSelect.value = "Global";
        chatChannelSelect.value = 0;
        colorPicker.value = getColorFromColorSelect();
        parseChat(null);
    }

    function parseMsg(msg, chat){
        if(chat === "public"){
            if(!isInArray(msg, data.public)){
                data.public.splice(0, 0, msg);
                if(data.public.length > 200)data.public = data.public.slice(0, 100);
            }
        }
        else if(chat === "clan"){
            if(!isInArray(msg, data.clan)){
                data.clan.splice(0, 0, msg);
                if(data.clan.length > 200) data.clan = data.clan.slice(0, 100);
            }
        }
        else if(chat === "trade"){
            if(!isInArray(msg, data.trade)){
                data.trade.splice(0, 0, msg);
                if(data.trade.length > 200) data.trade = data.trade.slice(0, 100);
            }
        }
        else if(chat === "global"){
            if(!isInArray(msg, data.global)){
                data.global.splice(0, 0, msg);
                if(data.global.length > 200) data.global = data.global.slice(0, 100);
            }
        }
    }

    function parseChat(mut){
        let messages = oldChatNode.innerHTML.split("<br>");
        data.all = [];

        // Sort messages into their respective chats
        for(let i = messages.length - 1; i >= 0; i -= 1){
            let msg = "";

            if(messages[i].includes("<a href=\"")) // Change font sizes of urls/usernames in chat
                messages[i] = messages[i].replace(/<a href=\"/gi, "<a style=\"font-size: " + data.fontSize + "px;\" href=\"");

            // Give global / trade / PM messages their colors back
            if(messages[i].includes("<span class=\"global\">Global</span>")){
                msg = messages[i].replace(/class=\"global\"/g, "style=\"color: " + data.globalChatColor + "\" class = \"global\"");
                parseMsg(msg, "global");
            }
            else if(messages[i].includes("<span class=\"clan\">Clan</span>")){
                msg = messages[i].replace(/class=\"clan\"/g, "style=\"color: " + data.clanChatColor + "\" class = \"clan\"");
                parseMsg(msg, "clan");
            }
            else if(messages[i].includes("<span class=\"trade\">Trade</span>")){
                msg = messages[i].replace(/class=\"trade\"/g, "style=\"color: " + data.tradeChatColor + "\" class = \"trade\"");
                parseMsg(msg, "trade");
            }
            else if(messages[i].includes("<span class=\"unknown\">PM TO</span>")){
                msg = messages[i].replace(/class=\"unknown\"/g, "style=\"color: " + data.PMToChatColor + "\" class = \"unknown\"");
                parseMsg(msg, "public");
            }
            else if(messages[i].includes("<span class=\"unknown\">PM FROM</span>")){
                msg = messages[i].replace(/class=\"unknown\"/g, "style=\"color: " + data.PMFromChatColor + "\" class = \"unknown\"");
                parseMsg(msg, "public");
            }
            else{
                msg = messages[i];
                parseMsg(msg, "public");
            }

            data.all.splice(0, 0, msg); // Insert message into All chat
        }
        updateChat();
    }

    function printChat(arr, chat){
        let msg = "";
        let alternate = true;
        let div1 = "<div style=\"background-color: " + data.chatLine1Color + "; font-size: " + data.fontSize + "px;\">";
        let div2 = "<div style=\"background-color: " + data.chatLine2Color + "; font-size: " + data.fontSize + "px;\">";

        for(let i = 0, len1 = arr.length, len2 = data.chatLim; (i < len1) && (i < len2); i += 1){
            if(alternate) msg += div1 + arr[i] + "</div>";
            else          msg += div2 + arr[i] + "</div>";
            alternate = !alternate;
        }
        newChatNode.innerHTML = msg;
    }

    function updateChat(){
        if(data.selectChat === 0) printChat(data.public);
        else if(data.selectChat === 1) printChat(data.trade);
        else if(data.selectChat === 2) printChat(data.global);
        else if(data.selectChat === 3) printChat(data.all);
        else if(data.selectChat === 4) printChat(data.clan);
    }

    function observeChatNode(){
        if(oldChatNode === null) oldChatNode = document.getElementById("chat");
        else{
            oldChatNode.style.display = "none"; // Hide the old chat box, make new one visible
            newChatNode.style.visibility = "visible";

            chatChannelSelect = document.getElementById("chat-channel");
            chatChannelSelect.value = data.chatChannelNum;

            let parent = document.getElementById("chat-area");
            parent.appendChild(chatButtons);
            parent.appendChild(newChatNode);

            let observer = new MutationObserver(parseChat);

            // Start monitoring any changes done to the old chat html
            observer.observe(oldChatNode, {
                attributes: true,
                childList: true,
                characterData: true
            });

            clearInterval(getOldChatID);
            parseChat(null); // Call immediately to avoid waiting for the chatbox to fill
        }
    }

    function init(){
        getOldChatID = setInterval(observeChatNode, 50);
        loadData();
        setupBtns();
    }

    function isInArray(item, msgs){
        for(let i = 0, len = msgs.length; i < len; i += 1)
            if(item === msgs[i]) return true;
        return false;
    }

    return {
        init: init
    };

}();

$(document).ready(function(){
    chat.init();
});