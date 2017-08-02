// ==UserScript==
// @name         TPT Best Chat
// @version      1.0
// @description  Script to change how the chat is handled
// @author       Bobby
// @include http://www.tpt-revised.co.uk/*
// ==/UserScript==

var chat = function(){
    let data;

    let maxChatLim;

    let getOldChatID = 0;
    let oldChatNode = null;
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
    // Add a reset chats button, clears all old chat messages

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
                fontSize: 15
            };

            localStorage.setItem("TPTsaveData", JSON.stringify(data));
        }

        maxChatLim = 2 * data.chatLim;
    }

    function setFontSize(ftSize){
        data.fontSize = ftSize;
        saveTPTData();
        changeChatLimits(data.chatLim);
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

        fontUpBtn.addEventListener("click", function(){
            if(data.fontSize < 30)
                setFontSize(data.fontSize + 1);
        });

        fontDnBtn.addEventListener("click", function(){
            if(data.fontSize > 10)
                setFontSize(data.fontSize - 1);
        });

        resetBtn.addEventListener("click", function(){
            changeChatLimits(data.chatLim);
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
            saveTPTData();
            updateChat();
        });

        globalBtn.addEventListener("click", function(){
            data.allColor = allBtn.style.color = "red";
            data.globalColor = globalBtn.style.color = "green";
            data.tradeColor = tradeBtn.style.color = "red";
            data.publicColor = publicBtn.style.color = "red";
            data.selectChat = 2;
            saveTPTData();
            updateChat();
        });

        tradeBtn.addEventListener("click", function(){
            data.allColor = allBtn.style.color = "red";
            data.globalColor = globalBtn.style.color = "red";
            data.tradeColor = tradeBtn.style.color = "green";
            data.publicColor = publicBtn.style.color = "red";
            data.selectChat = 1;
            saveTPTData();
            updateChat();
        });

        publicBtn.addEventListener("click", function(){
            data.allColor = allBtn.style.color = "red";
            data.globalColor = globalBtn.style.color = "red";
            data.tradeColor = tradeBtn.style.color = "red";
            data.publicColor = publicBtn.style.color = "green";
            data.selectChat = 0;
            saveTPTData();
            updateChat();
        });
    }

    function changeChatLimits(newLimit){
        data.chatLim = newLimit;
        maxChatLim = 2 * data.chatLim;
        limitCurrent.nodeValue = " Current: " + data.chatLim;

        data.public = []; // Delete old chats
        data.global = [];
        data.trade = [];
        data.all = [];
        saveTPTData();
        parseChat(null);
    }

    function parseChat(mut){
        let messages = oldChatNode.innerHTML.split("<br>");

        // Sort messages into their respective chats
        for(let i = messages.length - 1; i >= 0; i -= 1){
            let isTrade = messages[i].includes("[<span class=\"trade\">Trade</span>]");
            let isGlobal = messages[i].includes("[<span class=\"global\">Global</span>]");
            let msg = "";

            // Give global / trade messages their colors back
            if(isGlobal && !isTrade)
                msg = messages[i].replace(/class=\"global\"/g, "class = \"global\" style=\"color: dodgerblue\"");
            else if(isTrade && !isGlobal)
                msg = messages[i].replace(/class=\"trade\"/g, "class = \"trade\" style=\"color: lime\"");
            else msg = messages[i];

            if(msg.includes("<a href=\"")) // Change font sizes of urls/usernames in chat
                msg = msg.replace(/<a href=\"/gi, "<a  style=\"font-size: " + data.fontSize + "px;\" href=\"");

            // Put message into All chat
            if(!isInArray(msg, data.all)){
                data.all.splice(0, 0, msg); // Insert at beginning
                if(data.all.length >= maxChatLim) data.all = data.all.slice(0, data.chatLim);
            }

            // Sort the messages
            if(isGlobal && !isTrade && !isInArray(msg, data.global)){
                data.global.splice(0, 0, msg);
                if(data.global.length >= maxChatLim) data.global = data.global.slice(0, data.chatLim);
            }
            else if(!isGlobal && !isTrade && !isInArray(msg, data.public)){
                data.public.splice(0, 0, msg);
                if(data.public.length >= maxChatLim) data.public = data.public.slice(0, data.chatLim);
            }
            else if(isTrade && !isGlobal && !isInArray(msg, data.trade)){
                data.trade.splice(0, 0, msg);
                if(data.trade.length >= maxChatLim) data.trade = data.trade.slice(0, data.chatLim);
            }
        }
        updateChat();
    }

    function updateChat(){
        let msg = "";
        let alternate = true;
        let div1 = "<div style=\"background-color: black; font-size: " + data.fontSize + "px;\">";
        let div2 = "<div style=\"background-color: #1F1F1F; font-size: " + data.fontSize + "px;\">";

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