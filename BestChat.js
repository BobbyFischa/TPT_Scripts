// ==UserScript==
// @name         TPT Best Chat
// @version      1.0
// @description  Script to change how the chat is handled
// @author       Bobby
// @namespace    https://github.com/BobbyFischa/BobbyFischa.github.io
// @include http://www.tpt-revised.co.uk/*
// ==/UserScript==

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
        //localStorage.removeItem("TPTsaveData"); // Use to remove the item when changes to object are made

        if(typeof(Storage) !== "undefined" && localStorage.getItem("TPTsaveData") !== null){
            data = JSON.parse(localStorage.getItem("TPTsaveData"));
        }
        else{
            data = { // Default values
                public: [],
                trade: [],
                global: [],
                all: [],

                publicColor: "green",
                tradeColor: "red",
                globalColor: "red",
                allColor: "red",

                selectChat: 0,
                chatLim: 25,
                fontSize: 15,
                chatChannelNum: 0,

                tradeChatColor: "#00FF00", // lime
                globalChatColor: "#1E90FF", // dodgerblue
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
        if(sel === "Global"){
            return data.globalChatColor;
        }
        if(sel === "Trade"){
            return data.tradeChatColor;
        }
        if(sel === "PM TO"){
            return data.PMToChatColor;
        }
        if(sel === "PM FROM"){
            return data.PMFromChatColor;
        }
        if(sel === "Line 1"){
            return data.chatLine1Color;
        }
        if(sel === "Line 2"){
            return data.chatLine1Color;
        }

    }

    function setupBtns(){
        globalBtn.innerHTML = "Globals";
        tradeBtn.innerHTML = "Trade";
        publicBtn.innerHTML = "Public";
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
        resetBtn.style.color = "red";

        limitInput.setAttribute("type", "text");
        limitInput.setAttribute("id", "inputLimit");
        limitInput.setAttribute("name", "inputLimit");
        limitInput.setAttribute("size", "3");
        colorPicker.setAttribute("type", "color");

        let frag = document.createDocumentFragment();
        colorSelect.options.add(new Option("Global"));
        colorSelect.options.add(new Option("Trade"));
        colorSelect.options.add(new Option("PM TO"));
        colorSelect.options.add(new Option("PM FROM"));
        colorSelect.options.add(new Option("Line 1"));
        colorSelect.options.add(new Option("Line 2"));

        frag.appendChild(colorSelect);

        chatButtons.appendChild(publicBtn);
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
            if(colorSelect.value === "Global"){
                colorPicker.value = data.globalChatColor;
            }
            else if(colorSelect.value === "Trade"){
                colorPicker.value = data.tradeChatColor;
            }
            else if(colorSelect.value === "PM TO"){
                colorPicker.value = data.PMToChatColor;
            }
            else if(colorSelect.value === "PM FROM"){
                colorPicker.value = data.PMFromChatColor;
            }
            else if(colorSelect.value === "Line 1"){
                colorPicker.value = data.chatLine1Color;
            }
            else if(colorSelect.value === "Line 2"){
                colorPicker.value = data.chatLine2Color;
            }
        });

        colorPicker.addEventListener("input", function() {
            if(colorSelect.value === "Global"){
                data.globalChatColor = colorPicker.value;
                changeChatLimits(data.chatLim); // Reset chats
                parseChat(null);
            }
            else if(colorSelect.value === "Trade"){
                data.tradeChatColor = colorPicker.value;
                changeChatLimits(data.chatLim);
                parseChat(null);
            }
            else if(colorSelect.value === "PM TO"){
                data.PMToChatColor = colorPicker.value;
                changeChatLimits(data.chatLim);
                parseChat(null);
            }
            else if(colorSelect.value === "PM FROM"){
                data.PMFromChatColor = colorPicker.value;
                changeChatLimits(data.chatLim);
                parseChat(null);
            }
            else if(colorSelect.value === "Line 1"){
                data.chatLine1Color = colorPicker.value;
                changeChatLimits(data.chatLim);
                parseChat(null);
            }
            else if(colorSelect.value === "Line 2"){
                data.chatLine2Color = colorPicker.value;
                changeChatLimits(data.chatLim);
                parseChat(null);
            }

        }, false);

        fontUpBtn.addEventListener("click", function(){
            if(data.fontSize < 30)
                setFontSize(data.fontSize + 1);
        });

        fontDnBtn.addEventListener("click", function(){
            if(data.fontSize > 10)
                setFontSize(data.fontSize - 1);
        });

        resetBtn.addEventListener("click", function(){
            resetChat();
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

        allBtn.addEventListener("click", function(){
            data.allColor = allBtn.style.color = "green";
            data.globalColor = globalBtn.style.color = "red";
            data.tradeColor = tradeBtn.style.color = "red";
            data.publicColor = publicBtn.style.color = "red";
            data.selectChat = 3;
            chatChannelSelect.value = 0;
            saveTPTData();
            changeChatLimits(data.chatLim);
        });

        globalBtn.addEventListener("click", function(){
            data.allColor = allBtn.style.color = "red";
            data.globalColor = globalBtn.style.color = "green";
            data.tradeColor = tradeBtn.style.color = "red";
            data.publicColor = publicBtn.style.color = "red";
            data.selectChat = 2;
            chatChannelSelect.value = 0;
            saveTPTData();
            changeChatLimits(data.chatLim);
        });

        tradeBtn.addEventListener("click", function(){
            data.allColor = allBtn.style.color = "red";
            data.globalColor = globalBtn.style.color = "red";
            data.tradeColor = tradeBtn.style.color = "green";
            data.publicColor = publicBtn.style.color = "red";
            data.selectChat = 1;
            chatChannelSelect.value = 2;
            saveTPTData();
            changeChatLimits(data.chatLim);
        });

        publicBtn.addEventListener("click", function(){
            data.allColor = allBtn.style.color = "red";
            data.globalColor = globalBtn.style.color = "red";
            data.tradeColor = tradeBtn.style.color = "red";
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

        data.public = []; // Delete old chats
        data.global = [];
        data.trade = [];
        data.all = [];
        saveTPTData();
        parseChat(null);
    }

    function resetChat(){
        localStorage.removeItem("TPTsaveData"); // Use to remove the item when changes to object are made
        loadData();

        allBtn.style.color = tradeBtn.style.color = globalBtn.style.color = "red";
        publicBtn.style.color = "green";
        colorSelect.value = "Global";
        chatChannelSelect.value = 0;
        colorPicker.value = getColorFromColorSelect();
        parseChat(null);
    }

    function parseChat(mut){
        let messages = oldChatNode.innerHTML.split("<br>");
        data.all = [];

        // Sort messages into their respective chats
        for(let i = messages.length - 1; i >= 0; i -= 1){
            if(messages[i] === "Loading...") continue;
            let isTrade = messages[i].includes("<span class=\"trade\">Trade</span>");
            let isGlobal = messages[i].includes("<span class=\"global\">Global</span>");
            let isPMTO = messages[i].includes("<span class=\"unknown\">PM TO</span>");
            let isPMFROM = messages[i].includes("<span class=\"unknown\">PM FROM</span>");
            let msg = "";

            // Give global / trade / PM messages their colors back
            if(isGlobal && !isTrade)
                msg = messages[i].replace(/class=\"global\"/g, "style=\"color: " + data.globalChatColor + "\" class = \"global\"");
            else if(isTrade && !isGlobal)
                msg = messages[i].replace(/class=\"trade\"/g, "style=\"color: " + data.tradeChatColor + "\" class = \"trade\"");
            else if(isPMTO)
                msg = messages[i].replace(/class=\"unknown\"/g, "style=\"color: " + data.PMToChatColor + "\" class = \"unknown\"");
            else if(isPMFROM)
                msg = messages[i].replace(/class=\"unknown\"/g, "style=\"color: " + data.PMFromChatColor + "\" class = \"unknown\"");
            else msg = messages[i];

            if(msg.includes("<a href=\"")) // Change font sizes of urls/usernames in chat
                msg = msg.replace(/<a href=\"/gi, "<a style=\"font-size: " + data.fontSize + "px;\" href=\"");

            // Insert message into All chat
            data.all.splice(0, 0, msg);

            // Sort the messages
            if(isGlobal && !isTrade && !isInArray(msg, data.global)){
                data.global.splice(0, 0, msg);
                if(data.global.length > 200) data.global = data.global.slice(0, 100);
            }
            else if(!isGlobal && !isTrade && !isInArray(msg, data.public)){
                data.public.splice(0, 0, msg);
                if(data.public.length > 200)data.public = data.public.slice(0, 100);
            }
            else if(isTrade && !isGlobal && !isInArray(msg, data.trade)){
                data.trade.splice(0, 0, msg);
                if(data.trade.length > 200) data.trade = data.trade.slice(0, 100);
            }
        }
        updateChat();
    }

    function updateChat(){
        let msg = "";
        let alternate = true;
        let div1 = "<div style=\"background-color: " + data.chatLine1Color + "; font-size: " + data.fontSize + "px;\">";
        let div2 = "<div style=\"background-color: " + data.chatLine2Color + "; font-size: " + data.fontSize + "px;\">";

        if(data.selectChat === 0){
            for(let i = 0, len1 = data.public.length, len2 = data.chatLim; (i < len1) && (i < len2); i += 1){
                if(data.public[i] === "") continue;
                if(alternate) msg += div1 + data.public[i] + "</div>";
                else          msg += div2 + data.public[i] + "</div>";
                alternate = !alternate;
            }
        }
        else if(data.selectChat === 1){
            for(let i = 0, len1 = data.trade.length, len2 = data.chatLim; (i < len1) && (i < len2); i += 1){
                if(alternate) msg += div1 + data.trade[i] + "</div>";
                else          msg += div2 + data.trade[i] + "</div>";
                alternate = !alternate;
            }
        }
        else if(data.selectChat === 2){
            for(let i = 0, len1 = data.global.length, len2 = data.chatLim; (i < len1) && (i < len2); i += 1){
                if(alternate) msg += div1 + data.global[i] + "</div>";
                else          msg += div2 + data.global[i] + "</div>";
                alternate = !alternate;
            }
        }
        else if(data.selectChat === 3){
            for(let i = 0, len1 = data.all.length, len2 = data.chatLim; (i < len1) && (i < len2); i += 1){
                if(alternate) msg += div1 + data.all[i] + "</div>";
                else          msg += div2 + data.all[i] + "</div>";
                alternate = !alternate;
            }
        }
        newChatNode.innerHTML = msg;
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
        for(let i = 0, len = msgs.length; i < len; i += 1){
            if(item === msgs[i]) return true;
        }
        return false;
    }

    return {
        init: init
    };

}();

$(document).ready(function(){
    chat.init();
});