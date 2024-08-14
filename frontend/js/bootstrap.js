window.session = {};

// Axios so that we can attach CSRF token to requests
import axios from 'axios';

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
// Set axios to automatically make requests accept JSON response
window.axios.defaults.headers.common['Accept'] = 'application/json';

import hljs from 'highlight.js';
// import styles for highlight.js
import 'highlight.js/styles/github-dark.css';

document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelectorAll('pre code').forEach((block) => {
        let classes = block.className.split(' ');
        let language = classes.find((c) => c.startsWith('language-'));
        if (language === undefined) {
            return;
        }
        language = language.split('-')[1];
        let highlightedCode = hljs.highlight(block.textContent, {
            language
        }).value;
        block.innerHTML = highlightedCode;
        block.classList.add('hljs');
    });
});
window.rehighlight = (block) => {
    let classes = block.className.split(' ');
    let language = classes.find((c) => c.startsWith('language-'));
    if (language === undefined) {
        return;
    }
    language = language.split('-')[1];
    let highlightedCode = hljs.highlight(block.textContent, {
        language
    }).value;
    block.innerHTML = highlightedCode;
    block.classList.add('hljs');
};

// Initialize Alpine
import Alpine from 'alpinejs'

import humanizeDuration from "humanize-duration";

Alpine.magic('tootDuration', () => (date) => {
    let now = new Date();
    let tootDate = new Date(date);
    let diff = now - tootDate;
    if (diff < 3600 * 1000) {
        return humanizeDuration(diff, { round: true }) + " ago";
    }
    return tootDate.toLocaleString();
});

window.Alpine = Alpine

Alpine.start()

