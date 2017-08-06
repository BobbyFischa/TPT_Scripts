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

Chat Movement: 
Press tab to tab to the channel on the right. Hold shift and press tab to go one channel to the left. 
You can also click on each of the 6 channels.

SettingUp PMs:
Click the "Add" button. Enter a player's ID, followed by a comma, and their name, and then click "Add Player".
This will add their ID to a drop down menu to the right of those buttons. Selecting someone's ID will automatically
add the /m # PM command to the chat box whenever you access the PM tab. You can remove a player's ID by selecting
their ID, and clicking "Remove Selected".

Clear: 
This will delete the all chat history, and will resort the old chat's messages into their appropriate channels.

Chat Limits: 
Change the maximum # of lines in each channel by entering a number between 10 and 100, and pressing
"New Chat Limit". This will not delete the chat histories of each channel.

Reset: 
Resets colors, chat history, tab position, chat limits, etc.

Font Size: 
Increase/Decrease the font size. Will reset chat histories.

Changing Colors: 
Use the dropdown to select what element you want to change, then select a color and press OK. This will reset chat histories.
*/
var chat = function(){
    let data;
    let newMsgCountActive = false;
    let shiftKey = false;
    
    // Unread Messages Counts
    let publicUnreadCount = 0;
    let tradeUnreadCount = 0;
    let globalUnreadCount = 0;
    let clanUnreadCount = 0;
    let PMUnreadCount = 0;

    // Chat HTML Elements
    let getOldChatID = 0;
    let oldChatNode = null;
    let chatChannelSelect = null;
    let chatBoxInput = null;
    let chatSendBtn = null;
    let newChatNode = document.createElement("div");

    // Chat Tabs
    let chatButtons = document.createElement("div");
    let publicBtn = document.createElement("button");
    let tradeBtn = document.createElement("button");
    let globalBtn = document.createElement("button");
    let PMBtn = document.createElement("button");
    let allBtn = document.createElement("button");
    let clanBtn = document.createElement("button");
    
    // Chat Limit
    let limitInput = document.createElement("input");
    let limitBtn = document.createElement("button");
    let limitCurrent = document.createTextNode(" Current: ");
    
    // Option Buttons
    let optionsBtn = document.createElement("button");
    let resetBtn = document.createElement("button");
    let clearBtn = document.createElement("button");
    let fontUpBtn = document.createElement("button");
    let fontDnBtn = document.createElement("button");
    let colorPicker = document.createElement("input");
    let colorDropDn = document.createElement("button");
    let colorSelect = document.createElement("select");

    // PM Channel Handling Elements
    let PMBoxDiv = document.createElement("div");
    let PMAddPlayerBtn = document.createElement("button");
    let PMRemovePlayerBtn = document.createElement("button");
    let PMSelectInput = document.createElement("input");
    let PMSelectBtn = document.createElement("button");
    let PMChatSelect = document.createElement("select");

    // Regular Expressions for parsing messages
    let globRegex = new RegExp("<span class=\"global\">", 'gi');
    let tradRegex = new RegExp("<span class=\"trade\">", 'gi');
    let clanRegex = new RegExp("<span class=\"clan\">", 'gi');
    let PMTORegex = new RegExp("class=\"unknown\">PM TO</span>", 'i');
    let PMFmRegex = new RegExp("class=\"unknown\">PM FROM</span>", 'i');
    let PMRegex = new RegExp("class=\"unknown\">", 'gi');
    let clanTagRegex = new RegExp("<span class=\"clantag\">", 'gi');
    let aHRefRegex = new RegExp("<a href=\"", 'gi');

    $(document).on('keyup keydown', function(e){
        shiftKey = e.shiftKey; // Detect shift press
    });

    $( document ).keydown(function(e) { // Handle tabbing / shift tabbing
        var keycode = (e.which) ? e.which : e.keyCode;

        if(keycode == 9){
            nextTab(shiftKey); // Shift === true, tab left. false -> right
            e.preventDefault();
        }
    });

    // Decides which tab to go to based off current tab
    function nextTab(shift){
        if(!shift){
            if(data.selectChat === 0) clanBtn.click();
            else if(data.selectChat === 1) globalBtn.click();
            else if(data.selectChat === 2) PMBtn.click();
            else if(data.selectChat === 3) publicBtn.click();
            else if(data.selectChat === 4) tradeBtn.click();
            else if(data.selectChat === 5) allBtn.click();
        }
        else{
            if(data.selectChat === 0) allBtn.click();
            else if(data.selectChat === 1) clanBtn.click();
            else if(data.selectChat === 2) tradeBtn.click();
            else if(data.selectChat === 3) PMBtn.click();
            else if(data.selectChat === 4) publicBtn.click();
            else if(data.selectChat === 5) globalBtn.click();
        }
    }
    
    // Saves the data object into local storage
    function saveTPTData(){
        if(typeof(Storage) !== "undefined")
            localStorage.setItem("TPTsaveData", JSON.stringify(data));
    }

    // Loads the data object from local storage, or init a new data object if none found
    function loadData(){
        //localStorage.removeItem("TPTsaveData"); // Use to remove the item when changes to the data object are made
        if(typeof(Storage) !== "undefined" && localStorage.getItem("TPTsaveData") !== null){
            data = JSON.parse(localStorage.getItem("TPTsaveData"));
        }
        else{
            data = {
                // Chat channels
                public: [],
                trade: [],
                global: [],
                clan: [],
                all: [],
                PM: [],
                
                // Player PM select array
                PMSelect: [],
                currentPMSelect: "PM Select Channel",

                // Starting tab colors
                publicColor: "green",
                tradeColor: "red",
                globalColor: "red",
                allColor: "red",
                clanColor: "red",
                PMColor: "red",

                // Default Chat Info
                selectChat: 0,
                chatLim: 50,
                fontSize: 15,
                chatChannelNum: 0,

                // Default Chat Colors
                tradeChatColor: "#00FF00", // lime
                globalChatColor: "#1E90FF", // dodgerblue
                clanChatColor: "#FF8C00", // dark orange
                clanTagColor: "#008000", // green
                PMToChatColor: "#008000",
                PMFromChatColor: "#008000",
                chatLine1Color: "#000000", // black
                chatLine2Color: "#1F1F1F" // very dark grey
            };

            // Create a local storage object
            localStorage.setItem("TPTsaveData", JSON.stringify(data));
        }
    }

    // Sets the font size of the text, resets chat history
    function setFontSize(ftSize){
        data.fontSize = ftSize;
        resetChats();
        parseChat(null);
    }

    function getColorFromColorSelect(){
        let sel = colorSelect.value;
        if(sel === "Global")   return data.globalChatColor;
        if(sel === "Clan")     return data.clanChatColor;
        if(sel === "Clan Tag") return data.clanTagColor;
        if(sel === "Trade")    return data.tradeChatColor;
        if(sel === "PM TO")    return data.PMToChatColor;
        if(sel === "PM FROM")  return data.PMFromChatColor;
        if(sel === "Line 1")   return data.chatLine1Color;
        if(sel === "Line 2")   return data.chatLine1Color;
    }

    function setupBtns(){
        // Init Button/Input fields text
        globalBtn.innerHTML = "Globals\u00A0\u00A0";
        tradeBtn.innerHTML = "Trade\u00A0\u00A0";
        publicBtn.innerHTML = "Public\u00A0\u00A0";
        clanBtn.innerHTML = "Clan\u00A0\u00A0";
        PMBtn.innerHTML = "PM\u00A0\u00A0";
        allBtn.innerHTML = "All";
        limitBtn.innerHTML = "New Chat Limit";
        resetBtn.innerHTML = "Reset";
        clearBtn.innerHTML = "Clear";
        fontUpBtn.innerHTML = "FtS+";
        fontDnBtn.innerHTML = "FtS-";
        limitCurrent.nodeValue = " Current: " + data.chatLim;
        optionsBtn.innerHTML = "Options";
        PMAddPlayerBtn.innerHTML = "Add";
        PMSelectBtn.innerHTML = "Add Player";
        PMRemovePlayerBtn.innerHTML = "Remove Selected";
        PMSelectInput.value = "<ID>, <Name>";
        limitCurrent.nodeValue = "";

        // Init Button Colors
        globalBtn.style.color = data.globalColor;
        tradeBtn.style.color = data.tradeColor;
        publicBtn.style.color = data.publicColor;
        PMBtn.style.color = data.PMColor;
        allBtn.style.color = data.allColor;
        clanBtn.style.color = data.clanColor;
        optionsBtn.style.color = "red";
        PMAddPlayerBtn.style.color = "red";

        // Init Chat Limit Input
        limitInput.setAttribute("type", "text");
        limitInput.setAttribute("id", "inputLimit");
        limitInput.setAttribute("size", "5");
        
        // Init Option Buttons
        fontUpBtn.setAttribute("title", "*Clears Chat History");
        fontDnBtn.setAttribute("title", "*Clears Chat History");
        clearBtn.setAttribute("title", "*Clears Chat History");
        resetBtn.setAttribute("title", "*Clear chat history, reset colors/limits, etc");

        // Init Color Picker
        colorPicker.setAttribute("type", "color");
        colorPicker.setAttribute("title", "*Clears Chat History");
        
        // Init Color Select Dropdown
        let frag = document.createDocumentFragment();
        colorSelect.options.add(new Option("Global"));
        colorSelect.options.add(new Option("Trade"));
        colorSelect.options.add(new Option("Clan"));
        colorSelect.options.add(new Option("Clan Tag"));
        colorSelect.options.add(new Option("PM TO"));
        colorSelect.options.add(new Option("PM FROM"));
        colorSelect.options.add(new Option("Line 1"));
        colorSelect.options.add(new Option("Line 2"));
        frag.appendChild(colorSelect);

        // Init PM Select Dropdown/Button
        let PMFrag = document.createDocumentFragment();
        PMSelectInput.setAttribute("onfocus", "this.value = '';");
        PMChatSelect.options.add(new Option("PM Select Channel"));
        for(let i = 0, len = data.PMSelect.length; i < len; i += 1){
            PMChatSelect.options.add(new Option(data.PMSelect[i]));
        }
        
        //PMChatSelect.value = data.currentPMSelect;

        // Init Options as hidden
        PMBoxDiv.style.display = colorSelect.style.display = colorPicker.style.display =
            fontDnBtn.style.display = fontUpBtn.style.display = resetBtn.style.display =
            limitBtn.style.display = limitInput.style.display = clearBtn.style.display = "none";

        // Create HTML layout
        PMFrag.appendChild(PMChatSelect);
        PMBoxDiv.appendChild(PMSelectInput);
        PMBoxDiv.appendChild(PMSelectBtn);
        PMBoxDiv.appendChild(PMRemovePlayerBtn);

        chatButtons.appendChild(publicBtn);
        chatButtons.appendChild(clanBtn);
        chatButtons.appendChild(tradeBtn);
        chatButtons.appendChild(globalBtn);
        chatButtons.appendChild(PMBtn);
        chatButtons.appendChild(allBtn);
        chatButtons.appendChild(document.createElement("br"));
        chatButtons.appendChild(PMAddPlayerBtn);
        chatButtons.appendChild(PMBoxDiv);
        chatButtons.appendChild(PMFrag);
        chatButtons.appendChild(document.createElement("br"));
        chatButtons.appendChild(optionsBtn);
        chatButtons.appendChild(document.createTextNode("\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"));
        chatButtons.appendChild(clearBtn);
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
        
        
        PMChatSelect.value = data.currentPMSelect;

        // Remove a player's ID/name from the PM Player Select dropdown
        PMRemovePlayerBtn.addEventListener("click", function(){
            if(PMChatSelect.value !== "PM Select Channel"){
                PMChatSelect.remove(PMChatSelect.selectedIndex);
                data.PMSelect.splice(data.PMSelect.indexOf(PMChatSelect.value), 1);
                data.currentPMSelect = PMChatSelect.value;
                saveTPTData();
            }
        });

        // Selects a player in the PM Player Select dropdown
        PMChatSelect.addEventListener("input", function(){
            if(PMChatSelect.value === "PM Select Channel")
                chatBoxInput.value = "";
            else if(data.selectChat === 5){
                chatBoxInput.value = "/m " + parseInt(PMChatSelect.value.split(" - ")[0].trim()) + " ";
            }

            data.currentPMSelect = PMChatSelect.value;
            saveTPTData();
        });

        // Add a player's ID/name from the PM Player Select dropdown
        PMSelectBtn.addEventListener("click", function(){
            if(PMSelectInput.value === "" || PMSelectInput.value === "<ID>, <Name>"){
                PMSelectInput.value = "<ID>, <Name>";
                return;
            }
            let text = PMSelectInput.value.split(',');
            let name = text[1].trim();
            if(text !== null){
                let numb = text[0].match(/\d/g);
                numb = (numb === null) ? null : numb.join("");

                if(numb === null){
                    alert("Invalid input. Enter a player ID and a player name.");
                    return;
                }
                let num = parseInt(numb);

                if(!num){
                    alert("Invalid input. Enter a player ID and a player name.");
                    return;
                }

                if(confirm("Set PM with " + name + ", with ID: " + num + "?")){
                    let entry = num + " - " + name;
                    PMSelectInput.value = "<ID>, <Name>";
                    PMChatSelect.options.add(new Option(entry));
                    data.PMSelect[data.PMSelect.length] = entry;
                    data.currentPMSelect = PMChatSelect.value;
                    saveTPTData();
                }
            }});

        // Show/Hide Add Player options
        PMAddPlayerBtn.addEventListener("click", function(){
            if(PMBoxDiv.style.display !== "none"){
                PMBoxDiv.style.display = "none";
                PMAddPlayerBtn.style.color = "red";
            }
            else{
                PMBoxDiv.style.display = "inline-block";
                PMAddPlayerBtn.style.color = "green";
            }
        });

        // Show/Hide options buttons
        optionsBtn.addEventListener("click", function(){
            if(clearBtn.style.display !== "none"){
                colorSelect.style.display = colorPicker.style.display = fontDnBtn.style.display =
                    fontUpBtn.style.display = resetBtn.style.display = limitBtn.style.display =
                    limitInput.style.display = clearBtn.style.display = "none";
                limitCurrent.nodeValue = "";
                optionsBtn.style.color = "red";
            }
            else{
                colorSelect.style.display = colorPicker.style.display = fontDnBtn.style.display =
                    fontUpBtn.style.display = resetBtn.style.display = limitBtn.style.display =
                    limitInput.style.display = clearBtn.style.display = "inline-block";
                limitCurrent.nodeValue = " Current: " + data.chatLim;
                optionsBtn.style.color = "green";
            }
        });

        colorSelect.addEventListener("input", function(){
            if(colorSelect.value === "Global")        colorPicker.value = data.globalChatColor;
            else if(colorSelect.value === "Clan")     colorPicker.value = data.clanChatColor;
            else if(colorSelect.value === "Clan Tag") colorPicker.value = data.clanTagColor;
            else if(colorSelect.value === "Trade")    colorPicker.value = data.tradeChatColor;
            else if(colorSelect.value === "PM TO")    colorPicker.value = data.PMToChatColor;
            else if(colorSelect.value === "PM FROM")  colorPicker.value = data.PMFromChatColor;
            else if(colorSelect.value === "Line 1")   colorPicker.value = data.chatLine1Color;
            else if(colorSelect.value === "Line 2")   colorPicker.value = data.chatLine2Color;
        });

        // Changes the color of the text element
        colorPicker.addEventListener("input", function(){
            if(colorSelect.value === "Global")       data.globalChatColor = colorPicker.value;
            else if(colorSelect.value === "Clan")    data.clanChatColor = colorPicker.value;
            else if(colorSelect.value === "Clan Tag")data.clanTagColor = colorPicker.value;
            else if(colorSelect.value === "Trade")   data.tradeChatColor = colorPicker.value;
            else if(colorSelect.value === "PM TO")   data.PMToChatColor = colorPicker.value;
            else if(colorSelect.value === "PM FROM") data.PMFromChatColor = colorPicker.value;
            else if(colorSelect.value === "Line 1")  data.chatLine1Color = colorPicker.value;
            else if(colorSelect.value === "Line 2")  data.chatLine2Color = colorPicker.value;

            newMsgCountActive = false;
            resetChats();
            parseChat(null);
            newMsgCountActive = true;
        }, false);

        setInterval(function(){
            let pmStart = "/m " + parseInt(PMChatSelect.value.split(" - ")[0].trim()) + " ";
            if(data.selectChat === 5 && PMChatSelect.value !== "PM Select Channel" && chatBoxInput.value === "")
                chatBoxInput.value = pmStart;
        }, 500);

        // Font Size control buttons
        fontUpBtn.addEventListener("click", function(){
            newMsgCountActive = false;
            if(data.fontSize < 30) setFontSize(data.fontSize + 1);
            newMsgCountActive = true;
        });

        fontDnBtn.addEventListener("click", function(){
            newMsgCountActive = false;
            if(data.fontSize > 10) setFontSize(data.fontSize - 1);
            newMsgCountActive = true;
        });

        resetBtn.addEventListener("click", function(){
            if(confirm("Will reset colors, font size, chat limits, and tabs, continue?")) resetChat();
        });

        // Clears chat histories
        clearBtn.addEventListener("click", function(){
            newMsgCountActive = false;
            publicBtn.innerHTML = "Public\u00A0\u00A0";
            tradeBtn.innerHTML = "Trade\u00A0\u00A0";
            globalBtn.innerHTML = "Global\u00A0\u00A0";
            clanBtn.innerHTML = "Clan\u00A0\u00A0";
            PMBtn.innerHTML = "PM\u00A0\u00A0";
            resetChats();
            parseChat(null);
            newMsgCountActive = true;
        });

        // Change the max number of messages in a chat channel
        limitBtn.addEventListener("click", function(){
            let node = document.getElementById("inputLimit");

            if(node !== null){
                let numb = limitInput.value.match(/\d/g);
                limitInput.value = ""; // Clear chat box
                numb = (numb === null) ? null : numb.join("");

                if(numb === null || numb.length > 3 || numb.length < 1){
                    alert("Invalid input. Enter a number between 10 and 100");
                    return;
                }
                let num = parseInt(numb);

                if(!num || num < 10 || num > 100){
                    alert("Invalid input. Enter a number between 10 and 100");
                    return;
                }

                if(confirm("Set chat size limit to: " + num + "?")) changeChatLimits(num);
            }
        });

        // Buttons to switch between tabs
        PMBtn.addEventListener("click", function(){
            data.clanColor = clanBtn.style.color = data.allColor = allBtn.style.color = data.globalColor =
                globalBtn.style.color = data.tradeColor = tradeBtn.style.color = data.publicColor = publicBtn.style.color = "red";
            data.PMColor = PMBtn.style.color = "green";
            PMBtn.innerHTML = "PM\u00A0\u00A0";
            PMUnreadCount = 0;
            data.selectChat = 5;
            chatChannelSelect.value = 1;
            saveTPTData();

            if(PMChatSelect.value !== "PM Select Channel"){
                chatBoxInput.value = "/m " + parseInt(PMChatSelect.value.split(" - ")[0].trim()) + " ";
            }

            parseChat(null);
        });

        clanBtn.addEventListener("click", function(){
            data.PMColor = PMBtn.style.color = data.allColor = allBtn.style.color = data.globalColor =
                globalBtn.style.color = data.tradeColor = tradeBtn.style.color = data.publicColor = publicBtn.style.color = "red";
            data.clanColor = clanBtn.style.color = "green";
            clanBtn.innerHTML = "Clan\u00A0\u00A0";
            clanUnreadCount = 0;
            data.selectChat = 4;
            chatChannelSelect.value = 1;
            saveTPTData();
            chatBoxInput.value = "";
            parseChat(null);
        });

        allBtn.addEventListener("click", function(){
            data.PMColor = PMBtn.style.color = data.tradeColor = tradeBtn.style.color = data.globalColor =
                globalBtn.style.color = data.publicColor = publicBtn.style.color = data.clanColor = clanBtn.style.color = "red";
            data.allColor = allBtn.style.color = "green";
            data.selectChat = 3;
            chatChannelSelect.value = 0;
            saveTPTData();
            chatBoxInput.value = "";
            parseChat(null);
        });

        globalBtn.addEventListener("click", function(){
            data.PMColor = PMBtn.style.color = data.allColor = allBtn.style.color = data.tradeColor =
                tradeBtn.style.color = data.publicColor = publicBtn.style.color = data.clanColor = clanBtn.style.color = "red";
            data.globalColor = globalBtn.style.color = "green";
            globalBtn.innerHTML = "Global\u00A0\u00A0";
            globalUnreadCount = 0;
            data.selectChat = 2;
            chatChannelSelect.value = 0;
            saveTPTData();
            chatBoxInput.value = "";
            parseChat(null);
        });

        tradeBtn.addEventListener("click", function(){
            data.PMColor = PMBtn.style.color = data.allColor = allBtn.style.color = data.globalColor =
                globalBtn.style.color = data.publicColor = publicBtn.style.color = data.clanColor = clanBtn.style.color = "red";
            data.tradeColor = tradeBtn.style.color = "green";
            tradeBtn.innerHTML = "Trade\u00A0\u00A0";
            tradeUnreadCount = 0;
            data.selectChat = 1;
            chatChannelSelect.value = 2;
            saveTPTData();
            chatBoxInput.value = "";
            parseChat(null);
        });

        publicBtn.addEventListener("click", function(){
            data.PMColor = PMBtn.style.color = data.allColor = allBtn.style.color = data.globalColor =
                globalBtn.style.color = data.tradeColor = tradeBtn.style.color = data.clanColor = clanBtn.style.color = "red";
            data.publicColor = publicBtn.style.color = "green";
            publicBtn.innerHTML = "Public\u00A0\u00A0";
            publicUnreadCount = 0;
            data.selectChat = 0;
            chatChannelSelect.value = 0;
            saveTPTData();
            chatBoxInput.value = "";
            parseChat(null);
        });
    }

    function resetChats(){
        // Delete old chats
        data.public = [];
        data.global = [];
        data.trade = [];
        data.clan = [];
        data.all = [];
        data.PM = [];
        saveTPTData();
    }

    function changeChatLimits(newLimit){
        data.chatLim = newLimit;
        limitCurrent.nodeValue = " Current: " + data.chatLim;
        newMsgCountActive = false;
        parseChat(null);
        newMsgCountActive = true;
    }

    function resetChat(){
        localStorage.removeItem("TPTsaveData"); // Reset the data object
        loadData();

        newMsgCountActive = false;
        PMBtn.style.color = allBtn.style.color = tradeBtn.style.color = globalBtn.style.color = clanBtn.style.color = "red";
        publicBtn.style.color = "green";
        colorSelect.value = "Global";
        chatChannelSelect.value = 0;
        colorPicker.value = getColorFromColorSelect();

        publicBtn.innerHTML = "Public\u00A0\u00A0";
        tradeBtn.innerHTML = "Trade\u00A0\u00A0";
        globalBtn.innerHTML = "Global\u00A0\u00A0";
        clanBtn.innerHTML = "Clan\u00A0\u00A0";
        PMBtn.innerHTML = "PM\u00A0\u00A0";

        parseChat(null);
        newMsgCountActive = true;
    }

    // Pushes the chat message into the appropriate chat channel array, also manages max array lengths
    function parseMsg(msg, chat){
        switch(chat){
            case "public":
                if(!isInArray(msg, data.public)){
                    data.public[data.public.length] = msg; // Push msg in array
                    if(data.selectChat !== 0 && newMsgCountActive) publicBtn.innerHTML = "Public(" + (++publicUnreadCount) + ")"; // Notify user of new chat msg
                    if(data.public.length > 130) data.public = data.public.slice(105); // Cut array in half to avoid hogging memory
                } break;
            case "global":
                if(!isInArray(msg, data.global)){
                    data.global[data.global.length] = msg;
                    if(data.selectChat !== 2 && newMsgCountActive) globalBtn.innerHTML = "Global(" + (++globalUnreadCount) + ")";
                    if(data.global.length > 130) data.global = data.global.slice(105);
                } break;
            case "clan":
                if(!isInArray(msg, data.clan)){
                    data.clan[data.clan.length] = msg;
                    if(data.selectChat !== 4 && newMsgCountActive) clanBtn.innerHTML = "Clan(" + (++clanUnreadCount) + ")";
                    if(data.clan.length > 130) data.clan = data.clan.slice(105);
                } break;
            case "pm":
                if(!isInArray(msg, data.PM)){
                    data.PM[data.PM.length] = msg;
                    if(data.selectChat !== 5 && newMsgCountActive) PMBtn.innerHTML = "PM(" + (++PMUnreadCount) + ")";
                    if(data.PM.length > 130) data.PM = data.PM.slice(105);
                } break;
            case "trade":
                if(!isInArray(msg, data.trade)){
                    data.trade[data.trade.length] = msg;
                    if(data.selectChat !== 1 && newMsgCountActive) tradeBtn.innerHTML = "Trade(" + (++tradeUnreadCount) + ")";
                    if(data.trade.length > 130) data.trade = data.trade.slice(105);
                } break;
        }
    }

    function parseChat(mut){
        let messages = oldChatNode.innerHTML.split("<br>");
        data.all = [];

        // Sort messages into their respective chats
        for(let i = messages.length - 2; i >= 0; i -= 1){
            if(messages[i] === "Loading...") continue;
            let msg = "";

            if(aHRefRegex.test(messages[i])) // Change font sizes of urls/usernames in chat
                messages[i] = messages[i].replace(aHRefRegex, "<a style=\"font-size: " + data.fontSize + "px;\" href=\"");

            // Give global / trade / PM messages their colors back
            if(globRegex.test(messages[i])){
                msg = messages[i].replace(globRegex, "<span style=\"color: " + data.globalChatColor + "\" class = \"global\">");
                parseMsg(msg, "global");
            }
            else if(clanRegex.test(messages[i])){
                msg = messages[i].replace(clanRegex, "<span style=\"color: " + data.clanChatColor + "\" class = \"clan\">");
                parseMsg(msg, "clan");
            }
            else if(tradRegex.test(messages[i])){
                msg = messages[i].replace(tradRegex, "<span style=\"color: " + data.tradeChatColor + "\" class = \"trade\">");
                parseMsg(msg, "trade");
            }
            else if(PMTORegex.test(messages[i])){
                msg = messages[i].replace(PMRegex, "style=\"color: " + data.PMToChatColor + "\" class = \"unknown\">");
                parseMsg(msg, "pm");
            }
            else if(PMFmRegex.test(messages[i])){
                msg = messages[i].replace(PMRegex, "style=\"color: " + data.PMFromChatColor + "\" class = \"unknown\">");
                parseMsg(msg, "pm");
            }
            else{
                msg = messages[i].replace(clanTagRegex, "<span style=\"color: " + data.clanTagColor + "\" class = \"clantag\">");
                parseMsg(msg, "public");
            }

            data.all[data.all.length] = msg;// Insert message into All chat
        }
        updateChat();
    }

    function printChat(_arr, chat){
        let arr = _arr.slice().reverse();
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
        if(data.selectChat === 0)      printChat(data.public);
        else if(data.selectChat === 1) printChat(data.trade);
        else if(data.selectChat === 2) printChat(data.global);
        else if(data.selectChat === 3) printChat(data.all);
        else if(data.selectChat === 4) printChat(data.clan);
        else if(data.selectChat === 5) printChat(data.PM);
    }

    function observeChatNode(){
        if(oldChatNode === null) oldChatNode = document.getElementById("chat");
        else{
            oldChatNode.style.display = "none"; // Hide the old chat box, make new one visible
            newChatNode.style.visibility = "visible";
            chatChannelSelect = document.getElementById("chat-channel");
            chatBoxInput = document.getElementById("chat-input");
            chatSendBtn = document.getElementById("chat-send");

            if(data.selectChat === 0 || data.selectChat === 2 || data.selectChat === 3)
                chatChannelSelect.value = 0;
            else if(data.selectChat === 1)
                chatChannelSelect.value = 2;
            else if(data.selectChat === 4 || data.selectChat === 5)
                chatChannelSelect.value = 1;

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
        }
    }

    function init(){
        loadData();
        getOldChatID = setInterval(observeChatNode, 10);
        let initID = setInterval(function(){
            setupBtns();
            parseChat(null); // Call immediately to avoid waiting for the chatbox to fill
            clearInterval(initID);
        }, 100);

        let chatNotifID = setInterval(function(){
            newMsgCountActive = true;
            clearInterval(chatNotifID);
        }, 1000);
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
