# MATRIX TERMINAL

[English](README.md) | [Русский](README.ru.md)

A small experiment and sandbox: a Matrix-inspired terminal with a local knowledge base.

The project started as a single static HTML file with a handful of local replies. It is now a bilingual terminal in English and Russian, but it is still intentionally an experiment: there is no real AI connection, backend, or fixed final destination yet.

That is part of the idea. It will be interesting to see what this little terminal gradually grows into.

## What is here now

- Matrix-inspired terminal interface;
- local replies without an external API;
- English and Russian UI;
- language switcher with saved preference;
- answer language detection based on the question;
- local topics, characters, and philosophical questions;
- typewriter-style response animation;
- responsive layout for smaller screens;
- static deployment, including GitHub Pages.

## Project structure

```text
index.html          terminal interface and styles
js/app.js           application logic and question handling
locales/            UI text for each language
content/            local knowledge bases and replies
```

The dictionaries live in separate JSON files on purpose. This makes it possible to expand the content and add languages without mixing text with application logic.

## Run locally

From the project root:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/index.html
```

Use an HTTP server instead of opening `index.html` directly. The app loads its JSON dictionaries with `fetch`, and browsers may block that when the page is opened through `file://`.

If port `8000` is already in use, choose another one:

```bash
python3 -m http.server 8001
```

## Possible next steps

The direction is deliberately open. Some possible paths include:

- expanding the dictionaries and adding more reply variants;
- improving keyword matching and reducing false positives;
- adding categories, priorities, and related topics;
- adding terminal commands such as `/help`, `/lang`, and `/status`;
- saving conversation history;
- adding a local-only mode;
- connecting an LLM API through a server-side proxy or serverless function;
- experimenting with a `local-first` mode, where unknown questions can be sent to a model;
- adding more languages and possibly a dictionary editor;
- exploring visual modes, sound, and terminal atmosphere.

API keys should never live in client-side code or on GitHub Pages. If the project reaches the point of using an external model, it will need a separate server-side layer.

## Ideas and contributions

Ideas, suggestions, experiments, and contributions are very welcome.

You can suggest a new topic, write a terminal reply, improve the interface, help with the architecture, add a language, explore an AI integration, or take the project in an entirely unexpected direction.

There is no single correct path planned in advance. The goal is to develop the project gradually, try things, and see what actually works. Small improvements and ambitious concepts are both welcome.

If you would like to participate, feel free to open an issue, propose a pull request, or simply share an idea. Thoughtful participation can become part of the next stage of the experiment.

## Status

This project is in an early experimental stage and is evolving gradually.

The current version is a local interactive terminal with no connection to an AI API.

> THERE IS NO SPOON
