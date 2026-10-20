(() => {
    const chat = document.getElementById("chat");
    const form = document.getElementById("chat-form");
    const input = document.getElementById("user-input");
    const status = document.getElementById("status");
    const clock = document.getElementById("clock");
    const hint = document.getElementById("hint");
    const submitButton = document.getElementById("submit-button");
    const inputCursor = document.getElementById("input-cursor");
    const localeButtons = document.querySelectorAll("[data-locale]");

    const fallbackLocale = "ru";
    let locale = localStorage.getItem("matrix-locale") || fallbackLocale;
    let dictionaries = {};
    let knowledge = [];
    let busy = false;

    function normalize(text) { return text.toLowerCase().replaceAll("ё", "е"); }

    function updateInputCursor() {
        const beforeCursor = input.value.slice(0, input.selectionStart ?? input.value.length);
        const style = getComputedStyle(input);
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        context.font = style.font;
        inputCursor.style.left = `${Math.max(0, context.measureText(beforeCursor).width - input.scrollLeft)}px`;
    }

    async function loadLocale(nextLocale) {
        const [uiResponse, contentResponse] = await Promise.all([
            fetch(`./locales/${nextLocale}.json`),
            fetch(`./content/${nextLocale}.json`)
        ]);
        if (!uiResponse.ok || !contentResponse.ok) throw new Error(`Unable to load locale: ${nextLocale}`);
        dictionaries[nextLocale] = { ui: await uiResponse.json(), content: await contentResponse.json() };
    }

    function currentDictionary() { return dictionaries[locale]; }

    function applyLocale() {
        const { ui } = currentDictionary();
        document.documentElement.lang = locale;
        document.title = ui.pageTitle;
        status.textContent = ui.statusReady;
        input.placeholder = ui.placeholder;
        input.setAttribute("aria-label", ui.inputLabel);
        submitButton.textContent = ui.submit;
        hint.textContent = ui.hint;
        updateClock();
        localeButtons.forEach(button => {
            const active = button.dataset.locale === locale;
            button.classList.toggle("active", active);
            button.setAttribute("aria-pressed", String(active));
        });
    }

    function addMessage(text, type) {
        const message = document.createElement("div");
        message.className = `message ${type}`;
        const label = document.createElement("span");
        label.className = "system-label";
        label.textContent = type === "user" ? currentDictionary().ui.userLabel : currentDictionary().ui.systemLabel;
        const content = document.createElement("span");
        content.textContent = text;
        message.append(label, content);
        chat.appendChild(message);
        return content;
    }

    function typeText(element, text, speed = 18) {
        return new Promise(resolve => {
            let index = 0;
            function step() {
                if (index >= text.length) return resolve();
                const char = text[index++];
                element.textContent += char;
                chat.scrollTop = chat.scrollHeight;
                let delay = speed;
                if (".!?…".includes(char)) delay = speed * 8;
                else if (",;:".includes(char)) delay = speed * 3;
                else if (char === "\n") delay = speed * 4;
                setTimeout(step, delay);
            }
            step();
        });
    }

    function detectAnswerLocale(question) {
        const cyrillic = (question.match(/[а-яё]/gi) || []).length;
        const latin = (question.match(/[a-z]/gi) || []).length;

        if (cyrillic > latin) return "ru";
        if (latin > cyrillic) return "en";
        return locale;
    }

    function findAnswer(question, answerLocale) {
        const query = normalize(question);
        const answerDictionary = dictionaries[answerLocale];
        const entry = answerDictionary.content.find(item =>
            item.keys.some(key => query.includes(normalize(key)))
        );

        if (!entry) {
            const answers = answerDictionary.ui.fallbacks;
            return answers[Math.floor(Math.random() * answers.length)];
        }
        return entry.answers[Math.floor(Math.random() * entry.answers.length)];
    }

    async function handleQuestion(question) {
        if (busy) return;
        busy = true;
        input.disabled = true;
        status.textContent = currentDictionary().ui.statusProcessing;
        addMessage(question, "user");
        await new Promise(resolve => setTimeout(resolve, 350 + Math.random() * 700));
        status.textContent = currentDictionary().ui.statusAnalyzing;
        const thinking = addMessage("", "system");
        await new Promise(resolve => setTimeout(resolve, 500));
        const answerLocale = detectAnswerLocale(question);
        if (!dictionaries[answerLocale]) await loadLocale(answerLocale);
        await typeText(thinking, findAnswer(question, answerLocale), 15);
        status.textContent = currentDictionary().ui.statusReady;
        input.disabled = false;
        input.focus();
        busy = false;
    }

    async function changeLocale(nextLocale) {
        if (nextLocale === locale || busy) return;
        try {
            if (!dictionaries[nextLocale]) await loadLocale(nextLocale);
            locale = nextLocale;
            knowledge = dictionaries[locale].content;
            localStorage.setItem("matrix-locale", locale);
            applyLocale();
        } catch (error) { console.error(error); }
    }

    function updateClock() {
        const ui = currentDictionary()?.ui;
        if (ui) clock.textContent = new Date().toLocaleTimeString(ui.clockLocale);
    }

    form.addEventListener("submit", event => {
        event.preventDefault();
        const question = input.value.trim();
        if (!question || busy) return;
        input.value = "";
        handleQuestion(question);
    });
    ["input", "click", "keyup", "select", "focus"].forEach(eventName => {
        input.addEventListener(eventName, updateInputCursor);
    });
    window.addEventListener("resize", updateInputCursor);
    localeButtons.forEach(button => button.addEventListener("click", () => changeLocale(button.dataset.locale)));

    async function boot() {
        busy = true;
        try {
            if (!["ru", "en"].includes(locale)) locale = fallbackLocale;
            await loadLocale(locale);
        } catch (error) {
            locale = fallbackLocale;
            await loadLocale(locale);
        }
        knowledge = currentDictionary().content;
        applyLocale();
        const welcome = addMessage("", "system");
        await typeText(welcome, currentDictionary().ui.welcome.join("\n"), 12);
        busy = false;
        updateInputCursor();
        input.focus();
    }

    updateClock();
    setInterval(updateClock, 1000);
    boot();
})();
